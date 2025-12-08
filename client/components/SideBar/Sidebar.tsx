"use client";

import { useState } from "react"; // Removed useEffect as it wasn't used in your snippet
import PlanInfo from "./planInfo";
import ViewRouter from "./viewRouter";
import PlanPicker from "./PlanPicker";
import { useTrip } from "@/hooks/useTrip";
import { TripProvider } from "@/context/TripContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);  
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const { trips, isLoading, addEventLocal, removeEventLocal } = useTrip();

  const activeTrip = activeTripId 
    ? trips.find((t) => t.trip_id === activeTripId) || null 
    : null;

  return (
    <aside
      className={`
        relative bg-white shadow-xl z-[1000]
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
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
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
          </div>
        ) : !activeTrip ? (
          <PlanPicker onSelectTrip={(trip) => setActiveTripId(trip.trip_id)} />
        ) : (
          // PLAN VIEW
          <div className="flex flex-col w-full h-full p-4 overflow-y-auto"> 
            <PlanInfo trip={activeTrip} onBack={() => setActiveTripId(null)} />
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
        )}
      </div>
    </aside>
  );
}