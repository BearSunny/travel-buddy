"use client";

import { useEffect, useState } from "react";
import PlanInfo from "./planInfo";
import ViewRouter from "./viewRouter";
import PlanPicker from "./PlanPicker";
import { useTrip } from "@/hooks/useTrip";
import { Trip } from "@/interface/Trip";
import { TripProvider } from "@/context/TripContext";

interface SidebarProps {
  sharedTripId?: string | null;
}

export default function Sidebar({ sharedTripId }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { isLoading: tripListLoading, trips } = useTrip();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isFetchingShared, setIsFetchingShared] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(null);

  // When shared trip ID is in URL, fetch it
  useEffect(() => {
    if (sharedTripId) {
      setIsFetchingShared(true);
      setFetchError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const url = `${apiUrl}/api/trips/read/${sharedTripId}`;
      
      console.log(`[Sidebar] Fetching shared trip from: ${url}`);
      
      fetch(url)
        .then(res => {
          console.log(`[Sidebar] Response status: ${res.status}`);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to fetch trip`);
          }
          return res.json();
        })
        .then(data => {
          console.log(`[Sidebar] Trip fetched successfully:`, data);
          // API returns array with trip data
          if (Array.isArray(data) && data.length > 0) {
            const { trip, trip_events } = data[0];
            const formattedTrip: Trip = {
              ...trip,
              trip_id: trip.id,
              events: trip_events || [],
            };
            setSharedTrip(formattedTrip);
            console.log(`[Sidebar] Shared trip stored:`, formattedTrip);
          } else {
            throw new Error('Invalid response format');
          }
        })
        .catch(err => {
          console.error('[Sidebar] Failed to fetch shared trip:', err);
          setFetchError(err.message);
          alert(`Could not load shared trip: ${err.message}`);
        })
        .finally(() => setIsFetchingShared(false));
    }
  }, [sharedTripId]);

  const handleSelectTrip = (trip: Trip) => {
    console.log(`[Sidebar] Trip selected:`, trip);
    setActiveTrip(trip);
    // Collaboration connection happens in PlanInfo component
  };

  const handleBackFromTrip = () => {
    console.log(`[Sidebar] Navigating back from trip`);
    setActiveTrip(null);
    // Don't clear sharedTrip - keep it available in PlanPicker
  };

  const isLoading = tripListLoading || isFetchingShared;

  return (
    <aside
      className={`
        relative h-full bg-white shadow-xl z-[1000]
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
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="h-full w-full overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Failed to Load Trip</h3>
            <p className="text-sm text-gray-600 mb-4">{fetchError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : !activeTrip ? (
          <PlanPicker 
            onSelectTrip={handleSelectTrip}
            sharedTrip={sharedTrip}
          />
        ) : (
          <TripProvider
            trip={activeTrip}
            isLoading={false}
            addEventLocal={() => {}}
            removeEventLocal={() => {}}
          >
            <div className="flex flex-col h-full p-4">
              <PlanInfo trip={activeTrip} onBack={handleBackFromTrip} />
              <div className="flex-1 mt-4 overflow-hidden">
                <ViewRouter />
              </div>
            </div>
          </TripProvider>
        )}
      </div>
    </aside>
  );
}