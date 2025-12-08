"use client";

import React, { useState } from "react";

interface PlanFormData {
  destination: string;
  days: number;
  startDate: string;
  endDate: string;
  tripType: "relaxation" | "adventure" | "mixed";
  preferences: string;
}

export default function AITab() {
  const [formData, setFormData] = useState<PlanFormData>({
    destination: "",
    days: 3,
    startDate: "",
    endDate: "",
    tripType: "mixed",
    preferences: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "days" ? parseInt(value) : value,
    }));
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.destination || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      alert("Plan generation coming soon! You'll be able to edit events manually.");
      setLoading(false);
      setFormData({
        destination: "",
        days: 3,
        startDate: "",
        endDate: "",
        tripType: "mixed",
        preferences: "",
      });
    }, 1000);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">AI Trip Planner</h2>
        <p className="text-gray-600 mt-2 text-sm">Describe your ideal trip and let AI create a personalized plan</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleGeneratePlan} className="space-y-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Destination <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="Where do you want to go?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              name="days"
              value={formData.days}
              onChange={handleInputChange}
              min="1"
              max="60"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          </div>

          {/* Trip Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Trip Type
            </label>
            <select
              name="tripType"
              value={formData.tripType}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="relaxation">Relaxation</option>
              <option value="adventure">Adventure</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Preferences (Optional)
            </label>
            <textarea
              name="preferences"
              value={formData.preferences}
              onChange={handleInputChange}
              placeholder="Any specific preferences? (e.g., beach time, cultural sites, budget hotels...)"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              "Generate Plan →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
