"use client";

import React, { useState } from "react";
import { Trip } from "@/interface/Trip";
import { Icons } from "@/components/ui/Icons";

interface PlanCardProps {
  trip: Trip;
  onDelete: (tripId: string) => void;
  onClick: () => void;
  isShared?: boolean;
}

export default function PlanCard({ trip, onDelete, onClick, isShared = false }: PlanCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tripId = trip.trip_id || (trip as any).id;
    const shareLink = `${window.location.origin}?trip=${tripId}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(trip.trip_id || (trip as any).id);
  };

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return isNaN(date.getTime())
      ? "N/A"
      : new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(date);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-gray-900 text-base flex-1">{trip.title}</h3>
        <div className="flex gap-1 ml-2">
          <button
            onClick={handleShare}
            className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
            title={copied ? "Copied!" : "Share"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          {!isShared && (
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm">{trip.description}</p>
      <div className="flex gap-4 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Icons.Calendar/>
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </span>
      </div>
    </div>
  );
}