"use client";
import useUserSync from "@/hooks/UserSync";
import dynamic from "next/dynamic";
import NavigationBar from "@/components/NavigationBar";
import Sidebar from "@/components/Sidebar";

// Prevent Leaflet Map to render before React, which leds to "window is not defined" error
const LazyMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function HomePage() {
  const { syncStatus } = useUserSync();
  // alert(syncStatus)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="h-[8%] w-full">
        <NavigationBar />
      </div>
      <div className="flex-1 w-full relative">
        {/* <Sidebar/> */}
        <LazyMap />
      </div>
    </div>
  );
}
