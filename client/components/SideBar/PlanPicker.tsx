"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDbUser } from "@/context/userContext";
import { Trip } from "@/interface/Trip";
import { Icons } from "@/components/ui/Icons";
import EmptyState from "./trip/EmptyState";
import PlanCard from "./trip/PlanCard";
import CreatePlanModal from "./trip/CreatePlanModal";
import { useTrip } from "@/hooks/useTrip";
import LoginButton from "@/components/NavigationBar/LoginButton";

interface PlanPickerProps {
  onSelectTrip: (trip: Trip) => void;
  sharedTrip?: Trip | null;
  highlightedTripId?: string | null;
}

export default function PlanPicker({ onSelectTrip, sharedTrip, highlightedTripId }: PlanPickerProps) {
  const { user } = useDbUser();
  const { trips, createTrip, deleteTrip } = useTrip();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine user trips with shared trip
  const allTrips = useMemo(() => {
    if (!sharedTrip) return trips || [];
    
    // Check if shared trip is already in user's trips
    const sharedTripId = sharedTrip.trip_id || (sharedTrip as any).id;
    const alreadyOwned = trips?.some(t => 
      (t.trip_id || (t as any).id) === sharedTripId
    );
    
    if (alreadyOwned) {
      console.log('[PlanPicker] Shared trip is already owned by user');
      return trips || [];
    }
    
    // Add shared trip at the top
    console.log('[PlanPicker] Adding shared trip to list');
    return [sharedTrip, ...(trips || [])];
  }, [sharedTrip, trips]);

  // Auto-highlight the shared trip
  useEffect(() => {
    if (highlightedTripId && trips && trips.length > 0) {
      const foundTrip = trips.find(t => (t.trip_id || (t as any).id) === highlightedTripId);
      if (foundTrip) {
        console.log(`[PlanPicker] Highlighting shared trip:`, foundTrip);
      }
    }
  }, [highlightedTripId, trips]);

  const handleDelete = async (tripId: string) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await deleteTrip(tripId);
    } catch (error) {
      alert("Failed to delete plan.");
    }
  };

  const handleCreate = async (payload: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createTrip(payload);
      setIsModalOpen(false);
    } catch (error) {
      alert("Error creating plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return (  
      <LoginButton />
  );

  const hasTrips = allTrips.length > 0;
  const sharedTripId = sharedTrip ? (sharedTrip.trip_id || (sharedTrip as any).id) : null;

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Your trips</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
        >
          <Icons.Plus />
          <span>New</span>
        </button>
      </div>

      {!hasTrips ? (
        <EmptyState onCreate={() => setIsModalOpen(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {allTrips.map((trip) => {
            const tripId = trip.trip_id || (trip as any).id;
            const isShared = tripId === sharedTripId;
            const isHighlighted = tripId === highlightedTripId;
            
            return (
              <div key={tripId}>
                <div
                  className={`transition-all ${
                    isShared
                      ? "ring-2 ring-blue-500 ring-offset-2 rounded-lg"
                      : ""
                  }`}
                >
                  <PlanCard
                    trip={trip}
                    onDelete={handleDelete}
                    onClick={() => onSelectTrip(trip)}
                    isShared={isShared}
                  />
                </div>
                {(isShared || isHighlighted) && (
                  <div className="mt-1 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-b-lg border border-t-0 border-blue-200">
                    📍 Shared trip - Click to view and collaborate
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <CreatePlanModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}