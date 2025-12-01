"use client";

import React, { useState } from "react";
import ObjectView from "./view/ObjectView";
import CalendarView from "./view/CalendarView";

type ViewType = "destinations" | "calendar";

export default function ViewRouter() {
  const [activeView, setActiveView] = useState<ViewType>("destinations");

  return (
    <div className="flex flex-col h-full overflow-hidden mt-4">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-gray-100 rounded-lg mb-2 mx-1">
        <button
          onClick={() => setActiveView("destinations")}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
            activeView === "destinations"
              ? "bg-[#2563eb] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Destinations
        </button>
        <button
          onClick={() => setActiveView("calendar")}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
            activeView === "calendar"
              ? "bg-[#2563eb] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Calendar
        </button>
      </div>

      {/* Render Active View */}
      {activeView === "destinations" ? <ObjectView /> : <CalendarView />}
    </div>
  );
}