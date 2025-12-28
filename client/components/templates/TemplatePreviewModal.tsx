"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface TemplateEvent {
  id: string;
  template_id: string;
  title: string;
  description: string;
  day_number: number;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  order_index?: number;
}

interface TemplateDetails {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  category: string;
  thumbnail_url?: string;
  usage_count: number;
  average_rating: number;
  rating_count: number;
  creator_name: string;
  creator_avatar?: string;
  created_at: string;
}

interface TemplatePreviewModalProps {
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate?: (template: TemplateDetails) => void;
}

export default function TemplatePreviewModal({
  templateId,
  isOpen,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const [template, setTemplate] = useState<TemplateDetails | null>(null);
  const [events, setEvents] = useState<TemplateEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary">("overview");

  useEffect(() => {
    if (isOpen && templateId) {
      fetchTemplateDetails();
    }
  }, [isOpen, templateId]);

  const fetchTemplateDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/api/templates/${templateId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch template details");
      }

      const data = await response.json();
      setTemplate(data.template);
      setEvents(data.events || []);
    } catch (err) {
      console.error("Error fetching template details:", err);
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setIsLoading(false);
    }
  };

  const groupEventsByDay = (events: TemplateEvent[]) => {
    const grouped: { [day: number]: TemplateEvent[] } = {};
    events.forEach((event) => {
      if (!grouped[event.day_number]) {
        grouped[event.day_number] = [];
      }
      grouped[event.day_number].push(event);
    });
    return grouped;
  };

  const formatTime = (time?: string) => {
    if (!time) return "";
    // Time is stored as HH:MM:SS in UTC, convert to Vietnam time (UTC+7)
    const [hours, minutes] = time.split(':').map(Number);
    const vietnamHours = (hours + 7) % 24; // Add 7 hours for UTC+7
    return `${vietnamHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatLocation = (event: TemplateEvent) => {
    const parts = [];
    if (event.location) parts.push(event.location);
    if (event.address && event.address !== event.location) parts.push(event.address);
    if (event.city) parts.push(event.city);
    if (event.country) parts.push(event.country);
    return parts.join(", ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoading ? "Loading..." : template?.title}
                </h2>
                {template?.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {template.category}
                  </span>
                )}
              </div>

              {template && (
                <>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      ⭐ {template.average_rating > 0 ? Number(template.average_rating).toFixed(1) : "New"}
                      {template.rating_count > 0 && ` (${template.rating_count})`}
                    </div>
                    <span className="text-gray-300">•</span>
                    <div>Used {template.usage_count} times</div>
                    <span className="text-gray-300">•</span>
                    <div>{template.duration_days} days</div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {template.creator_avatar && (
                      <img
                        src={template.creator_avatar}
                        alt={template.creator_name}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span>by {template.creator_name}</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 ml-4"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📋 Overview
            </button>
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "itinerary"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📅 Itinerary ({events.length} events)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading template details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-2">Error loading template</p>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && template && (
                <div className="space-y-6">
                  {/* Thumbnail */}
                  {template.thumbnail_url && (
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                      <img
                        src={template.thumbnail_url}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">About This Trip</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {template.description || "No description provided"}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Duration</p>
                      <p className="text-xl font-bold text-gray-900">{template.duration_days} days</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Activities</p>
                      <p className="text-xl font-bold text-gray-900">{events.length} events</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Itinerary Tab */}
              {activeTab === "itinerary" && (
                <div className="space-y-6">
                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No events in this template yet</p>
                    </div>
                  ) : (
                    Object.entries(groupEventsByDay(events)).map(([day, dayEvents]) => (
                      <div key={day}>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 sticky top-0 bg-white py-2">
                          Day {day}
                        </h3>
                        <div className="space-y-3">
                          {dayEvents
                            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                            .map((event, index) => (
                              <div
                                key={event.id}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 flex-1">
                                    {event.title}
                                  </h4>
                                  {(event.start_time || event.end_time) && (
                                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                      {formatTime(event.start_time)}
                                      {event.end_time && ` - ${formatTime(event.end_time)}`}
                                    </span>
                                  )}
                                </div>

                                {event.description && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {event.description}
                                  </p>
                                )}

                                {formatLocation(event) && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span>📍 {formatLocation(event)}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {template && onUseTemplate && (
            <button
              onClick={() => onUseTemplate(template)}
              className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Use This Template →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
