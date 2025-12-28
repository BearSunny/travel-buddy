"use client";

import React, { useEffect, useState } from "react";
import { useCollaborationContext } from "@/context/CollaborationContext";
import { useDbUser } from "@/context/userContext";
import { getColorForUser, getAnimalForUser } from "@/utils/avatarGenerator";
import { Icons } from "../ui/Icons";
import { Trip } from "@/interface/Trip";
import { Event } from "@/interface/TripEvent";
import TripCompletionModal from "./trip/TripCompletionModal";

interface PlanInfoProps {
  trip: Trip;
  onBack: () => void;
  onTripUpdate?: () => void;
}

export default function PlanInfo({ trip, onBack, onTripUpdate }: PlanInfoProps) {
  // Calculate trip duration and progress
  const calculateTripStats = () => {
    if (!trip.start_date || !trip.end_date) {
      return { totalDays: 0, plannedDays: 0, progressPercent: 0 };
    }

    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime() + 1) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0 || !trip.events || trip.events.length === 0) {
      return { totalDays: totalDays > 0 ? totalDays : 0, plannedDays: 0, progressPercent: 0 };
    }

    // Count unique days with events
    const uniqueDaysWithEvents = new Set(
      trip.events.map((event: Event) => {
        const eventDate = new Date(event.start_time);
        return eventDate.toDateString();
      })
    );

    const plannedDays = uniqueDaysWithEvents.size;
    const progressPercent = totalDays > 0 ? Math.round((plannedDays / totalDays) * 100) : 0;

    return { totalDays, plannedDays, progressPercent };
  };

  const { totalDays, plannedDays, progressPercent } = calculateTripStats();

  // Determine progress bar color based on completion
  // const getProgressColor = () => {
  //   if (progressPercent >= 70) return "bg-green-500";
  //   if (progressPercent >= 30) return "bg-yellow-500";
  //   return "bg-red-500";
  // };
  const { tripId, userId, users, isConnected, generateShareLink, joinTripRoom, leaveRoom } =
    useCollaborationContext();
  const { user } = useDbUser();
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [category, setCategory] = useState("Other");
  const [exportDescription, setExportDescription] = useState("");
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  // Join room when PlanInfo mounts (only for non-completed trips)
  useEffect(() => {
    const currentTripId = trip.trip_id || (trip as any).id;
    const isCompleted = trip.completion_status === 'completed' || trip.completion_status === 'cancelled';
    
    if (currentTripId && !isCompleted) {
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

  const handleReopenTrip = async () => {
    if (!confirm("Reopen this trip? It will be editable again and marked as 'In Progress'.")) {
      return;
    }

    try {
      const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
      const tripId = trip.trip_id || (trip as any).id;
      
      const response = await fetch(`${apiUrl}/api/trips/reopen/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to reopen trip");
      }

      alert("Trip reopened! You can now edit it again.");
      window.location.reload(); // Reload to refresh trip data
    } catch (error) {
      console.error("Reopen error:", error);
      alert("Failed to reopen trip. Please try again.");
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

  // Check if trip meets export quality requirements
  const canExport = () => {
    const isCompleted = trip.completion_status === 'completed';
    const hasMinEvents = (trip.events?.length || 0) >= 3;
    const hasMinCompletion = (trip.completion_percentage || 0) >= 50;
    const hasEnded = trip.end_date ? new Date(trip.end_date) < new Date() : false;
    
    return isCompleted && hasMinEvents && hasMinCompletion && hasEnded;
  };

  const getExportTooltip = () => {
    if (trip.completion_status !== 'completed') {
      return "Trip must be marked as completed to export";
    }
    
    const hasEnded = trip.end_date ? new Date(trip.end_date) < new Date() : false;
    if (!hasEnded) {
      return "Trip must have ended to export as template";
    }
    
    const eventCount = trip.events?.length || 0;
    const completionPercent = trip.completion_percentage || 0;
    
    const issues = [];
    if (eventCount < 3) {
      issues.push(`Need ${3 - eventCount} more event${3 - eventCount > 1 ? 's' : ''}`);
    }
    if (completionPercent < 50) {
      issues.push(`Need ${50 - completionPercent}% more completion`);
    }
    
    if (issues.length > 0) {
      return `Cannot export: ${issues.join(', ')}`;
    }
    
    return "Export plan as template";
  };

  const isExportEnabled = canExport();

  // Check if trip needs completion (ended but not marked as completed)
  const needsCompletion = () => {
    const hasEnded = trip.end_date ? new Date(trip.end_date) < new Date() : false;
    const notCompleted = trip.completion_status !== 'completed' && trip.completion_status !== 'cancelled';
    return hasEnded && notCompleted;
  };

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

          {/* Completion Status Badge */}
          {trip.completion_status === 'completed' && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full border border-green-300">
              ✓ Completed
            </span>
          )}
          {trip.completion_status === 'in_progress' && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-300">
              ● In Progress
            </span>
          )}
          {trip.completion_status === 'cancelled' && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded-full border border-red-300">
              ✗ Cancelled
            </span>
          )}

          {/* Real-time Collaborators - Active Viewers - Hide for completed trips */}
          {isConnected && userCount > 0 && trip.completion_status !== 'completed' && trip.completion_status !== 'cancelled' && (
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
          {trip.completion_status === 'completed' && isOwner && (
            <button
              onClick={handleReopenTrip}
              className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
              title="Reopen trip for editing"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Reopen
            </button>
          )}
          
          {isOwner && (
            <button
              onClick={() => isExportEnabled && setShowExportModal(true)}
              disabled={!isExportEnabled}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm ${
                isExportEnabled
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={getExportTooltip()}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          )}

          {trip.completion_status !== 'completed' && trip.completion_status !== 'cancelled' && (
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
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-end justify-between mt-1">
        <span className="text-[11px] font-medium text-gray-500">
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </span>
        {/* <div className="flex flex-col items-end w-32">
          <div className="text-[10px] font-bold text-gray-900 mb-1">
            {plannedDays}/{totalDays} <span className="font-normal text-gray-500">Days planned</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor()} rounded-full transition-all duration-300`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div> */}
      </div>

      {/* Connection Status - Only show for non-completed trips */}
      {isConnected && tripId && trip.completion_status !== 'completed' && trip.completion_status !== 'cancelled' && (
        <div className="text-[10px] text-gray-500 mt-2">
          🟢 Connected • {userCount} user{userCount !== 1 ? "s" : ""} viewing
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-1000">
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

      {/* Trip Completion Modal */}
      {showCompletionPrompt && (
        <TripCompletionModal
          trip={trip}
          onClose={() => setShowCompletionPrompt(false)}
          onComplete={async (status, notes) => {
            try {
              const apiUrl = process.env.APP_API_URL || 'http://localhost:5001';
              const tripId = trip.trip_id || (trip as any).id;
              
              const response = await fetch(`${apiUrl}/api/trips/complete/${tripId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completion_status: status, notes })
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update trip status');
              }

              setShowCompletionPrompt(false);
              if (onTripUpdate) {
                onTripUpdate();
              } else {
                window.location.reload();
              }
              
              alert(`Trip marked as ${status}!`);
            } catch (error) {
              console.error('Error completing trip:', error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}