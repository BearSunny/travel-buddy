"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import NavigationBar from "@/components/NavigationBar/NavigationBar";
import Sidebar from "@/components/SideBar/Sidebar";
import useUserSync from "@/hooks/UserSync";

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
  const searchParams = useSearchParams();
  const [sharedTripId, setSharedTripId] = useState<string | null>(null);

  useEffect(() => {
    const tripParam = searchParams.get('trip');
    if (tripParam) {
      setSharedTripId(tripParam);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="h-[8%] w-full z-50 relative">
        <NavigationBar />
      </div>
      <div className="flex-1 flex flex-row relative w-full h-[95%]">
        <Sidebar sharedTripId={sharedTripId} />

        <div className="flex-1 relative transition-all duration-300 ease-in-out">
          <LazyMap />
        </div>
      </div>
    </div>
  );
}
