"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDbUser } from "@/context/userContext";
import { useTemplateRating } from "@/hooks/useTemplateRating";
import RatingModal from "@/components/templates/RatingModal";

interface Template {
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

export default function TemplatesTab() {
  const router = useRouter();
  const { user } = useDbUser();
  const { trackTemplateUsage, pendingRatings, removeFromPending } = useTemplateRating();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "rating">("popular");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Use Template Modal State
  const [showUseModal, setShowUseModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [tripTitle, setTripTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [templateToRate, setTemplateToRate] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [sortBy, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
      const params = new URLSearchParams();
      if (sortBy) params.append("sort", sortBy);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`${apiUrl}/api/templates?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemplate = (template: Template) => {
    if (!user) {
      alert("Please log in to use templates");
      return;
    }
    setSelectedTemplate(template);
    setTripTitle(template.title);
    setShowUseModal(true);
  };

  const handleCreateFromTemplate = async () => {
    if (!user || !selectedTemplate || !startDate) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/api/templates/${selectedTemplate.id}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title: tripTitle,
          start_date: startDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create trip from template");
      }

      const newTrip = await response.json();
      console.log("Trip created from template:", newTrip);
      
      // Track template usage for future rating prompt
      trackTemplateUsage(selectedTemplate.id, selectedTemplate.title, newTrip.id);
      
      // Navigate to the new trip
      router.push(`/?trip=${newTrip.id}`);
    } catch (error) {
      console.error("Create trip error:", error);
      alert("Failed to create trip from template. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const categories = ["Beach", "City", "Adventure", "Cultural", "Nature", "Food", "Other"];

  const handleRateTemplate = (template: Template) => {
    if (!user) {
      alert("Please log in to rate templates");
      return;
    }
    setTemplateToRate({ id: template.id, title: template.title });
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    if (templateToRate) {
      removeFromPending(templateToRate.id);
    }
    fetchTemplates(); // Refresh to show updated ratings
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">Error loading templates</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Community Templates</h2>
        <p className="text-gray-600 mt-2 text-sm">
          Discover trip templates shared by the community • {templates.length} templates available
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4 font-medium">No templates yet.</p>
          <p className="text-gray-500 text-sm">Be the first to export a trip as a template!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-blue-400 to-purple-500">
                {template.thumbnail_url ? (
                  <img
                    src={template.thumbnail_url}
                    alt={template.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                    {template.category.charAt(0)}
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-700">
                  {template.category}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {template.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    ⭐ {template.average_rating > 0 ? Number(template.average_rating).toFixed(1) : "New"}
                    {template.rating_count > 0 && ` (${template.rating_count})`}
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="text-xs text-gray-600">
                    Used {template.usage_count} times
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
                  {template.description || "No description provided"}
                </p>

                <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                  <span>{template.duration_days} days</span>
                  <span className="text-gray-300">•</span>
                  <span>by {template.creator_name}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRateTemplate(template);
                    }}
                    className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
                    title="Rate this template"
                  >
                    ⭐
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Use Template Modal */}
      {showUseModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Trip from Template</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-blue-900">{selectedTemplate.title}</p>
              <p className="text-xs text-blue-700 mt-1">{selectedTemplate.duration_days} days • {selectedTemplate.category}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Trip Title
                </label>
                <input
                  type="text"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="My Amazing Trip"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  End date will be calculated based on template duration ({selectedTemplate.duration_days} days)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUseModal(false);
                  setSelectedTemplate(null);
                  setTripTitle("");
                  setStartDate("");
                }}
                disabled={isCreating}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFromTemplate}
                disabled={isCreating || !startDate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {isCreating ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && templateToRate && user && (
        <RatingModal
          templateId={templateToRate.id}
          templateTitle={templateToRate.title}
          userId={user.id}
          onClose={() => {
            setShowRatingModal(false);
            setTemplateToRate(null);
          }}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
}
