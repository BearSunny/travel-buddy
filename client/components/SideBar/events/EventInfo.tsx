import React from "react";
import { Event } from "@/interface/TripEvent";
import { Calendar, DollarSign, Clock } from "lucide-react";

interface EventInfoProps {
  data: Partial<Event>;
  isEditing: boolean;
  onChange: (field: keyof Event, value: any) => void;
}

export default function EventInfo({ data, isEditing, onChange }: EventInfoProps) {
  // Helper to format date for input type="datetime-local"
  const toInputDate = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    // Adjust for timezone offset to keep local time in input
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  return (
    <div className="p-6 pb-2">
      {/* Title */}
      <div className="mb-4">
        {isEditing ? (
          <input
            type="text"
            value={data.title || ""}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent placeholder-gray-300"
            placeholder="Event Title"
          />
        ) : (
          <h2 className="text-2xl font-bold text-gray-900 break-words leading-tight">
            {data.title}
          </h2>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* Date / Time */}
        <div className="flex items-start gap-3 text-gray-600">
          <Calendar size={18} className="mt-0.5 text-blue-500 shrink-0" />
          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Start</label>
                <input
                  type="datetime-local"
                  value={toInputDate(data.start_time)}
                  onChange={(e) => onChange("start_time", new Date(e.target.value))}
                  className="text-sm border border-gray-300 rounded p-1.5 w-full focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <label className="text-xs font-semibold text-gray-400 uppercase">End</label>
                <input
                  type="datetime-local"
                  value={toInputDate(data.end_time)}
                  onChange={(e) => onChange("end_time", new Date(e.target.value))}
                  className="text-sm border border-gray-300 rounded p-1.5 w-full focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {new Date(data.start_time || "").toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Clock size={12} />
                  <span>
                    {new Date(data.start_time || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {" - "}
                    {new Date(data.end_time || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-3 text-gray-600 mt-1">
          <DollarSign size={18} className="text-green-600 shrink-0" />
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={data.cost || ""}
                onChange={(e) => onChange("cost", e.target.value)}
                placeholder="Cost (e.g. $50)"
                className="text-sm border-b border-gray-300 w-full py-1 focus:border-blue-500 outline-none bg-transparent"
              />
            ) : (
              <span className="text-sm font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded">
                {data.cost || "No cost added"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}