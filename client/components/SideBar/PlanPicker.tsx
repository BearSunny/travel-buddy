"use client";

import React, { useState } from "react";
import { useDbUser } from "@/context/userContext";
import { Trip } from "@/interface/Trip";
import { Icons } from "@/components/ui/Icons";
import EmptyState from "./trip/EmptyState";
import PlanCard from "./trip/PlanCard";
import CreatePlanModal from "./trip/CreatePlanModal";
import { useTrip } from "@/hooks/useTrip";

interface PlanPickerProps {
  onSelectTrip: (trip: Trip) => void;
}

export default function PlanPicker({ onSelectTrip }: PlanPickerProps) {
  const { user } = useDbUser();
  const { trips, createTrip, deleteTrip } = useTrip();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (!user) return <div className="p-8 text-center text-gray-500">Log in to view trips.</div>;

  const hasTrips = Array.isArray(trips) && trips.length > 0;

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

      {/* There is no trip available */}
      {!hasTrips ? (
        <EmptyState onCreate={() => setIsModalOpen(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <PlanCard
              key={trip.trip_id || (trip as any).id}
              trip={trip}
              onDelete={handleDelete}
              onClick={() => onSelectTrip(trip)}
            />
          ))}
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