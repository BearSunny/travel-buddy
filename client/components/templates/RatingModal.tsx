"use client";

import React, { useState } from "react";

interface RatingModalProps {
  templateId: string;
  templateTitle: string;
  userId: string;
  onClose: () => void;
  onRatingSubmitted?: () => void;
}

export default function RatingModal({
  templateId,
  templateTitle,
  userId,
  onClose,
  onRatingSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/api/templates/${templateId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      alert("Thank you for your rating!");
      onRatingSubmitted?.();
      onClose();
    } catch (error) {
      console.error("Rating error:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Rate Template</h2>
        <p className="text-sm text-gray-600 mb-4">{templateTitle}</p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-3xl transition-colors focus:outline-none"
              >
                {star <= (hoveredRating || rating) ? (
                  <span className="text-yellow-400">⭐</span>
                ) : (
                  <span className="text-gray-300">⭐</span>
                )}
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this template..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}
