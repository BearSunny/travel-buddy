"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import NavigationBar from "@/components/NavigationBar/NavigationBar";
import Sidebar from "@/components/SideBar/Sidebar";
import { Event } from "@/interface/TripEvent";

// Prevent Leaflet Map to render before React, which leads to "window is not defined" error
const LazyMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
      Loading Map...
    </div>
  ),
});

export default function HomePage() {
  const [activeTripEvents, setActiveTripEvents] = useState<Event[]>([]);

  // Listen for trip selection changes from Sidebar
  useEffect(() => {
    const handleTripChange = (event: CustomEvent) => {
      const tripData = event.detail;
      console.log('[HomePage] tripChanged event received:', tripData);
      console.log('[HomePage] Events in trip:', tripData?.events);
      
      if (tripData?.events) {
        console.log('[HomePage] Setting active trip events, count:', tripData.events.length);
        setActiveTripEvents(tripData.events);
      } else {
        console.log('[HomePage] No events, clearing map');
        setActiveTripEvents([]);
      }
    };

    window.addEventListener('tripChanged' as any, handleTripChange);
    return () => {
      window.removeEventListener('tripChanged' as any, handleTripChange);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="h-[8%] w-full z-50 relative">
        <NavigationBar />
      </div>
      <div className="flex-1 flex flex-row relative w-full h-[92%]">
        <Sidebar />
        <div className="flex-1 relative transition-all duration-300 ease-in-out">
          <LazyMap events={activeTripEvents} />
        </div>
      </div>
    </div>
  );
}