"use client";

import React, { useState } from "react";
import { Trip } from "@/interface/Trip";

const MOCK_TRIPS: Trip[] = [
  {
    trip_id: "1",
    owner_id: "user1",
    title: "Hành trình Hội An",
    description: "Khám phá phổ cổ",
    start_date: new Date("2025-11-15"),
    end_date: new Date("2025-11-17"),
    events: [],
  },
  {
    trip_id: "2",
    owner_id: "user1",
    title: "Hành trình Đà Nẵng",
    description: "Khám phá Mỹ Khê",
    start_date: new Date("2025-11-15"),
    end_date: new Date("2025-11-17"),
    events: [],
  },
  {
    trip_id: "3",
    owner_id: "user1",
    title: "Summer Beach Vacation",
    description: "Relaxing beach getaway",
    start_date: new Date("2025-06-15"),
    end_date: new Date("2025-06-22"),
    events: [],
  },
];

export default function YourPlansTab() {
  const [trips] = useState<Trip[]>(MOCK_TRIPS);

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

  const handleViewTrip = (tripId: string) => {
    console.log("View trip:", tripId);
    alert("Trip details view coming soon!");
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4 font-medium">No plans yet.</p>
        <p className="text-gray-500 text-sm">Create one using the AI planner or choose a template to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Your Plans</h2>
        <p className="text-gray-600 mt-2 text-sm">All your trip plans in one place</p>
      </div>

      <div className="space-y-3">
        {trips.map((trip) => (
          <div
            key={trip.trip_id}
            onClick={() => handleViewTrip(trip.trip_id)}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">{trip.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{trip.description}</p>
                <div className="flex gap-6 mt-3 text-sm text-gray-500 items-center">
                  <span className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                  </span>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex-shrink-0 ml-4">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
