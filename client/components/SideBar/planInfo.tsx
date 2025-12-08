"use client";

import React, { useEffect, useState } from "react";
import { useCollaborationContext } from "@/context/CollaborationContext";
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
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    setIsExporting(true);
    try {
      console.log("Exporting plan as template:", trip);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Plan exported as template!");
      setShowExportModal(false);
    } catch (error) {
      alert("Failed to export plan as template.");
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
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Export as Template</h2>
            <p className="text-gray-600 text-sm mb-6">
              This will make this plan available in the Templates tab for other users to discover.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-blue-900"><strong>Plan:</strong> {trip.title}</p>
              <p className="text-xs text-blue-900"><strong>Duration:</strong> {formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
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
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}