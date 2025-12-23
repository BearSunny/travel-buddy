"use client";

import React, { useState } from "react";
import { Trip } from "@/interface/Trip";
import { Event } from "@/interface/TripEvent";

interface TripCompletionModalProps {
  trip: Trip;
  onClose: () => void;
  onComplete: (status: 'completed' | 'cancelled', notes?: string) => Promise<void>;
}

export default function TripCompletionModal({
  trip,
  onClose,
  onComplete,
}: TripCompletionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'completed' | 'cancelled'>('completed');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateCompletionStats = () => {
    const totalEvents = trip.events?.length || 0;
    const doneEvents = trip.events?.filter((e) => e.status === 'done').length || 0;
    const cancelledEvents = trip.events?.filter((e) => e.status === 'cancelled').length || 0;
    
    return {
      total: totalEvents,
      done: doneEvents,
      cancelled: cancelledEvents,
      percentage: totalEvents > 0 ? Math.round((doneEvents / totalEvents) * 100) : 0,
    };
  };

  const stats = calculateCompletionStats();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(selectedStatus, notes);
    } catch (error) {
      console.error('Failed to complete trip:', error);
      alert('Failed to update trip status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        // Prevent clicks from reaching components underneath
        e.stopPropagation();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            🎉 Trip Completed!
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Your trip &quot;{trip.title}&quot; has ended. Let&apos;s wrap it up!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Trip Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Trip Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-700">Total Events</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-blue-700">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.done}</p>
              </div>
              <div>
                <p className="text-blue-700">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <div>
                <p className="text-blue-700">Completion</p>
                <p className="text-2xl font-bold text-blue-900">{stats.percentage}%</p>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Did you complete this trip?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderColor: selectedStatus === 'completed' ? '#10b981' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={selectedStatus === 'completed'}
                  onChange={(e) => setSelectedStatus(e.target.value as 'completed')}
                  className="w-4 h-4 text-green-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">Yes, trip completed ✓</p>
                  <p className="text-xs text-gray-500">Mark this trip as successfully completed</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderColor: selectedStatus === 'cancelled' ? '#ef4444' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="status"
                  value="cancelled"
                  checked={selectedStatus === 'cancelled'}
                  onChange={(e) => setSelectedStatus(e.target.value as 'cancelled')}
                  className="w-4 h-4 text-red-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">No, trip was cancelled ✗</p>
                  <p className="text-xs text-gray-500">The trip didn&apos;t happen as planned</p>
                </div>
              </label>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Final Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any thoughts about the trip? Changes you'd make? Tips for others?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Export Reminder */}
          {selectedStatus === 'completed' && stats.percentage >= 50 && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-800">
                <strong>💡 Tip:</strong> Your trip is {stats.percentage}% complete! 
                Consider exporting it as a template to help other travelers.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
              selectedStatus === 'completed' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : `Mark as ${selectedStatus === 'completed' ? 'Completed' : 'Cancelled'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
