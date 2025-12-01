"use client";
import dynamic from "next/dynamic";
import NavigationBar from "@/components/NavBar/NavigationBar";
import Sidebar from "@/components/SideBar/Sidebar";

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
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="h-[5%] w-full z-50 relative">
        <NavigationBar />
      </div>
      <div className="flex-1 flex flex-row relative w-full h-[95%]">
        <Sidebar />
        
        <div className="flex-1 relative transition-all duration-300 ease-in-out">
          <LazyMap />
        </div>
      </div>
    </div>
  );
}