import React from "react";
import { Icons } from "@/components/ui/Icons";
import { Trip } from "@/interface/Trip";

interface PlanCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export default function PlanCard({ trip, onDelete, onClick }: PlanCardProps) {
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "TBD";
    try {
      const d = new Date(date);
      // Check if date is "Invalid Date"
      if (isNaN(d.getTime())) return "Invalid Date";
      
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(d);
    } catch (e) {
      return "Error";
    }
  };

  // Fallback for ID mismatch issues
  const tripId = trip.trip_id || (trip as any).id;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-4 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 line-clamp-1">{trip.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this plan?")) onDelete(tripId);
          }}
          className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icons.Trash />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <Icons.Calendar />
        <span>
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </span>
      </div>

      <p className="text-xs text-gray-600 line-clamp-2">
        {trip.description || "No description."}
      </p>
    </div>
  );
}