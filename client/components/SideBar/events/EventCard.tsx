import React, { useEffect, useState } from "react";
import { X, Save, Edit3 } from "lucide-react";
import { Event } from "@/interface/TripEvent";
import EventInfo from "./EventInfo";
import EventDetails from "./EventDetails";

interface EventCardProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Event>) => Promise<void>;
}

export default function EventCard({
  event,
  isOpen,
  onClose,
  onUpdate,
}: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when event changes
  useEffect(() => {
    if (event) {
      setFormData(event);
      setIsEditing(false);
    }
  }, [event]);

  const handleSave = async () => {
    if (!event || !formData) return;
    setIsSaving(true);
    try {
      await onUpdate(event.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update event", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (event) setFormData(event);
    setIsEditing(false);
  };

  const handleChange = (field: keyof Event, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[500] md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-[8%] right-0 h-[92%] bg-white shadow-2xl z-[500]
          w-full md:w-[30%] min-w-[320px] max-w-[500px]
          transform transition-transform duration-300 ease-in-out
          flex flex-col border-l border-gray-200
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between p-1 border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-70"
                >
                  <Save size={14} />
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors"
              >
                <Edit3 size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {event && formData ? (
            <div className="flex flex-col">
              <EventInfo
                data={formData}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <div className="h-px bg-gray-100 mx-6 my-2" />
              <EventDetails
                data={formData}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select an event to view details
            </div>
          )}
        </div>
      </div>
    </>
  );
}