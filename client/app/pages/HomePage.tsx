"use client";
import NavigationBar from "@/components/NavigationBar/NavigationBar";
import DiscoverPage from "../discover/page";


export default function HomePage() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="h-[8%] w-full z-50 relative">
        <NavigationBar />
      </div>
      <DiscoverPage />
    </div>
  );
}
