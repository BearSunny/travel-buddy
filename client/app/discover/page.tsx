"use client";

import React, { useState } from "react";
import TemplatesTab from "./components/TemplatesTab";
import AITab from "./components/AITab";
import YourPlansTab from "./components/YourPlansTab";

type TabType = "templates" | "ai" | "yourplans";

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<TabType>("templates");

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Discover
          </h1>
          <p className="text-gray-600 mt-2 font-inter font-regular">
            Find inspiration or create your perfect trip
          </p>
        </div>
      </div>

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
              onClick={() => setActiveTab("ai")}
              className={`py-4 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === "ai"
                  ? "text-gray-900 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              AI Planner
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
          {activeTab === "ai" && <AITab />}
          {activeTab === "yourplans" && <YourPlansTab />}
        </div>
      </div>
    </div>
  );
}
