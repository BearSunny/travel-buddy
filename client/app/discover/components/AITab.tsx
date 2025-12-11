"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDbUser } from "@/context/userContext";

interface PlanFormData {
  destination: string;
  duration: number;
  startDate: string;
  interests: string;
  budget: "budget" | "moderate" | "luxury";
}

interface AIEvent {
  title: string;
  description: string;
  location: string;
  dayNumber: number;
  suggestedStartTime: string;
  suggestedEndTime: string;
}

interface AIItinerary {
  title: string;
  description: string;
  events: AIEvent[];
}

export default function AITab() {
  const router = useRouter();
  const { user } = useDbUser();
  
  const [formData, setFormData] = useState<PlanFormData>({
    destination: "",
    duration: 3,
    startDate: "",
    interests: "",
    budget: "moderate",
  });
  
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [itinerary, setItinerary] = useState<AIItinerary | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) : value,
    }));
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to use the AI planner");
      return;
    }

    if (!formData.destination || !formData.startDate) {
      alert("Please fill in destination and start date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/api/ai/generate-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: formData.destination,
          duration: formData.duration,
          interests: formData.interests,
          budget: formData.budget,
          startDate: formData.startDate,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate trip");
      }

      const data = await response.json();
      setItinerary(data.itinerary);
      setShowPreview(true);
    } catch (err) {
      console.error("Generate trip error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate trip");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async () => {
    if (!user || !itinerary) return;

    setCreating(true);
    setError(null);

    try {
      const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/api/ai/create-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerary,
          startDate: formData.startDate,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create trip");
      }

      const newTrip = await response.json();
      router.push(`/?trip=${newTrip.id}`);
    } catch (err) {
      console.error("Create trip error:", err);
      setError(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setCreating(false);
    }
  };

  const groupEventsByDay = (events: AIEvent[]) => {
    const grouped: { [day: number]: AIEvent[] } = {};
    events.forEach(event => {
      if (!grouped[event.dayNumber]) {
        grouped[event.dayNumber] = [];
      }
      grouped[event.dayNumber].push(event);
    });
    return grouped;
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">AI Trip Planner</h2>
        <p className="text-gray-600 mt-2 text-sm">Describe your ideal trip and let AI create a personalized itinerary</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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
              placeholder="e.g., Paris, France"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Duration (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration.toString()}
              onChange={handleInputChange}
              min="1"
              max="14"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              required
            />
          </div>

          {/* Start Date */}
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

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Budget Level
            </label>
            <select
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="budget">Budget</option>
              <option value="moderate">Moderate</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Interests & Preferences (Optional)
            </label>
            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleInputChange}
              placeholder="e.g., museums, food tours, hiking, nightlife, family-friendly..."
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Your Perfect Trip...
              </>
            ) : (
              <>
                ✨ Generate AI Trip Plan
              </>
            )}
          </button>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && itinerary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{itinerary.title}</h2>
              <p className="text-gray-600 mt-2 text-sm">{itinerary.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {Object.entries(groupEventsByDay(itinerary.events)).map(([day, events]) => (
                <div key={day} className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 sticky top-0 bg-white py-2">
                    Day {day}
                  </h3>
                  <div className="space-y-3">
                    {events.map((event, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {event.suggestedStartTime} - {event.suggestedEndTime}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <p className="text-xs text-gray-500">📍 {event.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setItinerary(null);
                }}
                disabled={creating}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrip}
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Trip...
                  </>
                ) : (
                  "Create This Trip"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
