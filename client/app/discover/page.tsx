"use client";

import React, { useState } from "react";
import TemplatesTab from "./components/TemplatesTab";
import YourPlansTab from "./components/YourPlansTab";

type TabType = "templates" | "yourplans";

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<TabType>("templates");

  return (
    <div className="h-screen bg-white flex flex-col">

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-12">
            <button
              onClick={() => setActiveTab("templates")}
              className={`py-4 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === "templates"
                  ? "text-gray-900 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab("yourplans")}
              className={`py-4 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === "yourplans"
                  ? "text-gray-900 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              Your Plans
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {activeTab === "templates" && <TemplatesTab />}
          {activeTab === "yourplans" && <YourPlansTab />}
        </div>
      </div>
    </div>
  );
}
