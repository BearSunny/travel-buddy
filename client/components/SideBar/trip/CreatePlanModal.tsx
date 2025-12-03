"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icons } from "@/components/ui/Icons";

interface CreatePlanModalProps {
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  }) => void;
  isSubmitting: boolean;
}

export default function CreatePlanModal({
  onClose,
  onSubmit,
  isSubmitting,
}: CreatePlanModalProps) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
          <h3 className="font-bold text-gray-900">New Trip</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Icons.X />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="p-4 space-y-3"
        >
          <input
            required
            type="text"
            placeholder="Trip Title"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Start</label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">End</label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>
          <textarea
            rows={2}
            placeholder="Description..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}