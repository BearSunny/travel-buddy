"use client";

import React from "react";

export default function CalendarView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
      <svg
        className="w-12 h-12 mb-2 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <p className="text-sm font-medium">Calendar view coming soon</p>
    </div>
  );
}