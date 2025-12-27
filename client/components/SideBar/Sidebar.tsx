"use client";

import { useState, useEffect } from "react";
import PlanInfo from "./planInfo";
import ViewRouter from "./ViewRouter";
import PlanPicker from "./PlanPicker";
import TripCompletionModal from "./trip/TripCompletionModal";
import { useTrip } from "@/hooks/useTrip";
import { TripProvider } from "@/context/TripContext";
import { Trip } from "@/interface/Trip";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);  
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const { trips, isLoading, addEventLocal, removeEventLocal, refetch } = useTrip();
  
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(null);
  const [sharedTripId, setSharedTripId] = useState<string | null>(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [sharedTripError, setSharedTripError] = useState<string | null>(null);
  const [hasRefetchedForShared, setHasRefetchedForShared] = useState(false);
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionModalDismissed, setCompletionModalDismissed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('trip');
    
    if (tripId) {
      console.log(`[Sidebar] Detected shared trip ID from URL: ${tripId}`);
      setSharedTripId(tripId);
      fetchSharedTrip(tripId);
      
      console.log(`[Sidebar] Scheduling refetch for shared trip...`);
      setTimeout(() => {
        console.log(`[Sidebar] Refetching trips to include newly shared trip`);
        refetch();
        setHasRefetchedForShared(true);
      }, 2000);
    }
  }, []);

  // Check if active trip needs completion modal
  useEffect(() => {
    if (!activeTrip || completionModalDismissed) {
      setShowCompletionModal(false);
      return;
    }

    // Check if trip has ended and is not yet marked as completed
    const tripEndDate = new Date(activeTrip.end_date);
    const now = new Date();
    const hasEnded = tripEndDate < now;
    const needsCompletion = activeTrip.completion_status !== 'completed' && 
                           activeTrip.completion_status !== 'cancelled';
    
    if (hasEnded && needsCompletion) {
      setShowCompletionModal(true);
    } else {
      setShowCompletionModal(false);
    }
  }, [activeTripId, completionModalDismissed]);

  const fetchSharedTrip = async (tripId: string) => {
    setIsLoadingShared(true);
    setSharedTripError(null);
    
    try {
      console.log(`[Sidebar] Fetching shared trip data for: ${tripId}`);
      const response = await fetch(`http://localhost:5001/api/trips/read/${tripId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trip: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[Sidebar] Received shared trip data:`, data);
      
      if (Array.isArray(data) && data.length > 0 && data[0].trip) {
        const tripData = data[0].trip;
        const tripEvents = data[0].trip_events || [];
        // Transform to Trip interface format
        const trip: Trip = {
          trip_id: tripData.id,
          title: tripData.title,
          description: tripData.description || '',
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          owner_id: tripData.owner_id,
          events: tripEvents
        };
        setSharedTrip(trip);
        console.log(`[Sidebar] Shared trip loaded successfully with ${tripEvents.length} events:`, trip);
        
        // Dispatch tripChanged event for map to receive events
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('tripChanged', { detail: trip });
          window.dispatchEvent(event);
          console.log(`[Sidebar] Dispatched tripChanged event with ${tripEvents.length} events`);
        }
      } else {
        throw new Error('Trip not found or invalid response format');
      }
    } catch (error) {
      console.error(`[Sidebar] Error fetching shared trip:`, error);
      setSharedTripError(error instanceof Error ? error.message : 'Failed to load shared trip');
    } finally {
      setIsLoadingShared(false);
    }
  };

  // Check if shared trip is now in the regular trips array
  useEffect(() => {
    if (sharedTripId && hasRefetchedForShared && sharedTrip) {
      const foundInTrips = trips.find((t) => t.trip_id === sharedTripId);
      if (foundInTrips) {
        console.log(`[Sidebar] Shared trip now found in regular trips array, clearing temporary state`);
        setSharedTrip(null);
        setActiveTripId(sharedTripId); // Auto-select the shared trip
        
        // Dispatch for the regular trip
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('tripChanged', { detail: foundInTrips });
          window.dispatchEvent(event);
        }
      }
    }
  }, [trips, sharedTripId, hasRefetchedForShared, sharedTrip]);

  const activeTrip = activeTripId 
    ? trips.find((t) => t.trip_id === activeTripId) || sharedTrip
    : null;

  return (
    <aside
      className={`
        relative bg-white shadow-xl z-[500]
        transition-[width] duration-300 ease-in-out border-r border-gray-200
        ${isOpen ? "w-full md:w-[500px]" : "w-0"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute top-1/2 -translate-y-1/2 -right-0 translate-x-full w-8 h-16 bg-white border border-l-0 border-gray-200 rounded-r-md flex items-center justify-center shadow-md hover:bg-gray-50 text-gray-500 z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="h-full w-full overflow-hidden flex flex-col">
        {isLoading || isLoadingShared ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <svg
              className="animate-spin h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {isLoadingShared && <span className="text-xs">Loading shared trip...</span>}
          </div>
        ) : sharedTripError ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3 p-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-1">Failed to load shared trip</p>
              <p className="text-xs text-gray-500">{sharedTripError}</p>
            </div>
            <button
              onClick={() => {
                setSharedTripError(null);
                if (sharedTripId) fetchSharedTrip(sharedTripId);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : !activeTrip ? (
          <PlanPicker 
            onSelectTrip={(trip) => setActiveTripId(trip.trip_id)} 
            sharedTrip={sharedTrip}
            highlightedTripId={sharedTripId}
          />
        ) : (
          // PLAN VIEW
          <>
            <div className="flex flex-col w-full h-full p-4 overflow-y-auto"> 
              <PlanInfo 
                trip={activeTrip} 
                onBack={() => {
                  setActiveTripId(null);
                  setCompletionModalDismissed(false);
                  // Clear the map markers by dispatching tripChanged with null
                  if (typeof window !== 'undefined') {
                    const event = new CustomEvent('tripChanged', { detail: null });
                    window.dispatchEvent(event);
                  }
                }}
                onTripUpdate={async () => {
                  await refetch();
                  setCompletionModalDismissed(false);
                }}
              />
              <div className="flex-1 overflow-hidden">
                <TripProvider 
                  trip={activeTrip} 
                  isLoading={isLoading}
                  addEventLocal={addEventLocal}
                  removeEventLocal={removeEventLocal}
                >
                    <ViewRouter />
                </TripProvider>
              </div>
            </div>

            {/* Trip Completion Modal */}
            {showCompletionModal && (
              <TripCompletionModal
                trip={activeTrip}
                onClose={() => {
                  setShowCompletionModal(false);
                  setCompletionModalDismissed(true);
                }}
                onComplete={async (status, notes) => {
                  try {
                    const apiUrl = process.env.APP_API_URL || 'http://localhost:5001';
                    const tripId = activeTrip.trip_id || (activeTrip as any).id;
                    
                    const response = await fetch(`${apiUrl}/api/trips/complete/${tripId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ completion_status: status, notes })
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || 'Failed to update trip status');
                    }

                    // Success - refetch trips to get updated data
                    await refetch();
                    setShowCompletionModal(false);
                    setCompletionModalDismissed(false);
                    
                    alert(`Trip marked as ${status}!`);
                  } catch (error) {
                    console.error('Error completing trip:', error);
                    throw error;
                  }
                }}
              />
            )}
          </>
        )}
      </div>
    </aside>
  );
}