"use client";

import React, { useEffect, useState } from "react";
import { useCollaborationContext } from "@/context/CollaborationContext";
import { useDbUser } from "@/context/userContext";
import { getColorForUser, getAnimalForUser } from "@/utils/avatarGenerator";
import { Icons } from "../ui/Icons";
import { Trip } from "@/interface/Trip";

interface PlanInfoProps {
  trip: Trip;
  onBack: () => void;
}

export default function PlanInfo({ trip, onBack }: PlanInfoProps) {
  const { tripId, userId, users, isConnected, generateShareLink, joinTripRoom, leaveRoom } =
    useCollaborationContext();
  const { user } = useDbUser();
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [category, setCategory] = useState("Other");
  const [exportDescription, setExportDescription] = useState("");

  // Join room when PlanInfo mounts
  useEffect(() => {
    const currentTripId = trip.trip_id || (trip as any).id;
    if (currentTripId) {
      console.log(`[PlanInfo] Joining trip room: ${currentTripId}`);
      joinTripRoom(currentTripId);
    }

    // Leave room when component unmounts
    return () => {
      console.log(`[PlanInfo] Leaving trip room`);
      leaveRoom();
    };
  }, [trip, joinTripRoom, leaveRoom]);

  const handleShare = () => {
    const shareLink = generateShareLink();
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportTemplate = async () => {
    if (!user) {
      alert("Please log in to export templates");
      return;
    }

    setIsExporting(true);
    try {
      const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
      const tripId = trip.trip_id || (trip as any).id;
      
      const response = await fetch(`${apiUrl}/api/templates/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          user_id: user.id,
          category,
          description: exportDescription || trip.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error("Export failed:", response.status, errorData);
        
        // Check for ownership error
        if (response.status === 403 && errorData.error?.includes('owner')) {
          throw new Error("Only trip owners can export templates. Ask the trip owner to export this trip.");
        }
        
        throw new Error(errorData.error || `Failed to export template (${response.status})`);
      }

      const template = await response.json();
      console.log("Template exported:", template);
      alert("🎉 Template exported successfully! Others can now discover your itinerary in the Templates tab.");
      setShowExportModal(false);
      setCategory("Other");
      setExportDescription("");
    } catch (error) {
      console.error("Export error:", error);
      alert(`Failed to export template: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const userCount = users.size;
  const allUsers = Array.from(users.entries());

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return isNaN(date.getTime())
      ? "N/A"
      : new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(date);
  };

  // Check if current user is the trip owner
  const isOwner = user && trip.owner_id === user.id;

  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-gray-200">
      {/* Header: Title, Users, Share, Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Back"
          >
            <Icons.ArrowLeft />
          </button>

          <h1 className="text-xl font-extrabold text-black tracking-tight">
            {trip.title}
          </h1>

          {/* Real-time Collaborators - Active Viewers */}
          {isConnected && userCount > 0 && (
            <div className="flex items-center gap-1">
              {allUsers.slice(0, 3).map(([id, user]) => (
                <div
                  key={id}
                  className={`w-6 h-6 rounded-full ${getColorForUser(
                    id
                  )} text-white flex items-center justify-center text-xs leading-none ring-2 ring-white`}
                  title={user.displayName || id}
                >
                  {getAnimalForUser(id)}
                </div>
              ))}
              {userCount > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                  +{userCount - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
              title="Export plan as template"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            title={copied ? "Copied!" : "Copy share link"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-end justify-between mt-1">
        <span className="text-[11px] font-medium text-gray-500">
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </span>
        <div className="flex flex-col items-end w-32">
          <div className="text-[10px] font-bold text-gray-900 mb-1">
            1/30 <span className="font-normal text-gray-500">Nights planned</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[3.33%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {isConnected && tripId && (
        <div className="text-[10px] text-gray-500 mt-2">
          🟢 Connected • {userCount} user{userCount !== 1 ? "s" : ""} viewing
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Share Your Trip as a Template</h2>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Please Note:</strong>
              </p>
              <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                <li><strong>Public:</strong> Your trip will be visible to all users</li>
                <li><strong>Customizable:</strong> Others can modify when using</li>
                <li><strong>Final Version:</strong> Cannot be edited after export</li>
                <li><strong>Privacy:</strong> Specific dates and collaborators will be removed</li>
              </ul>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Beach">Beach</option>
                  <option value="City">City</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Nature">Nature</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={exportDescription}
                  onChange={(e) => setExportDescription(e.target.value)}
                  placeholder={trip.description || "Describe your trip template..."}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExportTemplate}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {isExporting ? "Exporting..." : "Export Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}