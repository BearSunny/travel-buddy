import React from "react";
import { Icons } from "@/components/ui/Icons";

interface EmptyStateProps {
  onCreate: () => void;
}

export default function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
      <div className="bg-white p-3 rounded-full shadow-sm mb-3">
        <Icons.MapPin />
      </div>
      <p className="text-gray-500 text-sm mb-4 text-center">No plans yet.</p>
      <button
        onClick={onCreate}
        className="text-blue-600 text-sm font-semibold hover:underline"
      >
        Create one &rarr;
      </button>
    </div>
  );
}