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
  const { roomId, userId, users, isConnected, generateShareLink } =
    useCollaborationContext();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareLink = generateShareLink();
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const userCount = users.size;
  const otherUsers = Array.from(users.entries()).filter(
    ([id]) => id !== userId
  );

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
      {/* Header: Title, User, Share */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* REMOVED mt-1 TO ENSURE PERFECT VERTICAL CENTERING */}
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

          {/* Active Users Display */}
          <div className="flex items-center gap-1">
            {otherUsers.slice(0, 3).map(([id, user]) => (
              <div
                key={id}
                className={`w-6 h-6 rounded-full ${getColorForUser(
                  id
                )} text-white flex items-center justify-center text-sm leading-none ring-2 ring-white`}
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

          {/* Add User Button (+) */}
          <button className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 bg-[#1a73e8] hover:bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
          title={copied ? "Copied!" : "Copy share link"}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          {copied ? "Copied!" : "Share"}
        </button>
      </div>

      {/* Date Range & Progress */}
      <div className="flex items-end justify-between mt-1">
        <span className="text-[11px] font-medium text-gray-500">
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </span>

        <div className="flex flex-col items-end w-32">
          <div className="text-[10px] font-bold text-gray-900 mb-1">
            1/30{" "}
            <span className="font-normal text-gray-500">Nights planned</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* 3.33% for 1/30 days */}
            <div className="h-full bg-green-500 w-[3.33%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {isConnected && roomId && (
        <div className="text-[10px] text-gray-500">
          Connected to room {roomId.slice(0, 8)}... • {userCount} user
          {userCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}