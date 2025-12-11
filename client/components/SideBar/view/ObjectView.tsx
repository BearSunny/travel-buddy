"use client";

import { useEvents } from "@/hooks/useTripEvents";
import { Trip } from "@/interface/Trip";
import { Event } from "@/interface/TripEvent";
import { useState, useMemo, useEffect } from "react";
import { useTripContext } from "@/context/TripContext";
import { Icons } from "@/components/ui/Icons";
import EventCard from "../events/EventCard"; // Import the new component
import LocationAutocomplete from "@/components/map/LocationAutocomplete";
import { GeocodedLocation } from "@/utils/geocoding";

const formatTime = (date: Date | string) => {
  const d = new Date(date); 
  return isNaN(d.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(d);
};

export default function ObjectView() {
  const {
    activeTrip,
    eventIds,
    isLoading: isTripLoading,
    removeEventLocal,
    addEventLocal,
  } = useTripContext(); 

  const {
    events,
    isLoading: isEventsLoading,
    createEvent,
    deleteEvent,
    updateEvent,
  } = useEvents(eventIds, (action, payload) => {
    if (!activeTrip) return;

    if (action === "delete") {
      removeEventLocal(activeTrip.trip_id, payload as string);
    } else if (action === "create") {
      addEventLocal(activeTrip.trip_id, payload);
    }
  });

  // 2. Add state for selected event
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // 3. Derive selected event (keeps it fresh with live updates)
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: activeTrip?.start_date
      ? new Date(activeTrip?.start_date).toISOString().split("T")[0]
      : "",
    startTime: "",
    endTime: "",
    cost: "",
    location: "",
  });
  const [selectedLocation, setSelectedLocation] = useState<GeocodedLocation | null>(null);
  const groupedEvents = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    const sorted = [...events].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    sorted.forEach((event) => {
      const d = new Date(event.start_time);
      const vnDate = new Date(
        d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      const dateKey = !isNaN(vnDate.getTime())
        ? vnDate.toISOString().split("T")[0]
        : "Unscheduled";

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });

    return groups;
  }, [events]);

  const handleInputChange = (field: string, value: string) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    if (!newEvent.title || !newEvent.date) {
      alert("Please provide at least a Title and a Date");
      return;
    }

    const dateKey = newEvent.date;
    const startDateTime = new Date(
      `${dateKey}T${newEvent.startTime || "09:00"}:00`
    );
    const endDateTime = new Date(
      `${dateKey}T${newEvent.endTime || "10:00"}:00`
    );

    try {
      if (!activeTrip) throw Error("There is no activeTrip");

      await createEvent({
        trip_id: activeTrip.trip_id,
        title: newEvent.title,
        status: "planned",
        start_time: startDateTime,
        end_time: endDateTime,
        cost: newEvent.cost,
        description: "",
        address: selectedLocation?.display_name || newEvent.location,
        city: selectedLocation?.city,
        country: selectedLocation?.country,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
      });

      setNewEvent((prev) => ({
        ...prev,
        title: "",
        startTime: "",
        endTime: "",
        cost: "",
        location: "",
      }));
      setSelectedLocation(null);
    } catch (error) {
      console.error("Failed to add event", error);
      alert("Failed to create event");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening the card when clicking delete
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      if (selectedEventId === id) setSelectedEventId(null);
      await deleteEvent(id);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const formatGroupHeader = (dateKey: string) => {
    if (dateKey === "Unscheduled") return "Unscheduled";
    const date = new Date(dateKey);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(date);
  };

  useEffect(() => {
    console.log(events);
  })

  if (isTripLoading) return <div>Loading Trip...</div>;
  if (isEventsLoading) return <div>Loading {eventIds.length} Events...</div>;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="flex-1 overflow-y-scroll pr-1 mt-4 no-scrollbar pb-20">
        {isEventsLoading && (!events || events.length === 0) && (
          <div className="text-center mt-10 text-gray-400">
            Loading detailed events...
          </div>
        )}

        {!isEventsLoading && events.length === 0 && (
          <div className="text-center text-gray-400 mt-10 mb-10">
            <p>No events found.</p>
            <p className="text-sm">
              Use the form below to add your first stop!
            </p>
          </div>
        )}

        {Object.entries(groupedEvents).map(([dateKey, groupEvents]) => (
          <div key={dateKey} className="mb-2">
            <div className="flex items-center gap-2 top-0 bg-white z-10 py-2">
              <Icons.Calendar/>
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {formatGroupHeader(dateKey)}
              </h2>
            </div>

            <div className="relative pl-4 ml-2">
              <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-[#e0e0e0]"></div>

              {groupEvents.map((e, index) => {
                const isLast = index === groupEvents.length - 1;
                const isSelected = e.id === selectedEventId;

                return (
                  <div key={e.id} className="relative mb-6">
                    {!isLast && (
                      <div className="absolute left-[-5px] top-8 h-[calc(100%+24px)] w-[2px] bg-[#29b6f6] z-0"></div>
                    )}

                    <div className="absolute -left-4 top-3 w-6 h-6 rounded-full bg-[#29b6f6] text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm border-2 border-white">
                      {index + 1}
                    </div>

                    {/* 4. Make this clickable and add visual feedback for selection */}
                    <div 
                      onClick={() => setSelectedEventId(e.id)}
                      className={`
                        rounded-xl p-3 flex gap-3 shadow-sm transition-all relative group border cursor-pointer
                        ${isSelected 
                            ? "bg-blue-50 border-blue-400 ring-1 ring-blue-400 shadow-md" 
                            : "bg-[#f3f4f6] border-transparent hover:border-gray-200 hover:shadow-md"
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 text-sm truncate mr-2">
                            {e.title}
                          </h3>
                          <button
                            onClick={(event) => handleDelete(event, e.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
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
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {e.cost && (
                            <span className="bg-[#e3f2fd] text-[#1e88e5] text-[10px] font-semibold px-2 py-0.5 rounded">
                              {e.cost}
                            </span>
                          )}
                          {(e.start_time || e.timeRange) && (
                            <span className="bg-[#f3e5f5] text-[#8e24aa] text-[10px] font-semibold px-2 py-0.5 rounded">
                              {e.timeRange ||
                                `${formatTime(e.start_time)} - ${formatTime(
                                  e.end_time
                                )}`}
                            </span>
                          )}
                        </div>
                      </div>
                      {e.image && (
                        <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-300">
                          <img
                            src={e.image}
                            alt={e.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 h-40 mb-10 bg-white bottom-30 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
          Add New Event
        </h3>
        <div className="bg-[#f3f4f6] rounded-lg p-2 flex flex-col gap-2 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center text-gray-400 pl-1">
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <input
              type="date"
              className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
              value={newEvent.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
            />
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <input
              type="text"
              placeholder="What are we doing?"
              className="bg-transparent text-xs font-medium text-gray-700 placeholder-gray-500 flex-1 focus:outline-none min-w-[80px]"
              value={newEvent.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 border-t border-gray-200 pt-2">
            <div className="flex items-center justify-center text-gray-400 pl-1">
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="flex-1">
              <LocationAutocomplete
                value={newEvent.location}
                onChange={(value, location) => {
                  handleInputChange("location", value);
                  setSelectedLocation(location);
                }}
                placeholder="Where?"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-200 pt-2">
            <div className="flex items-center gap-1">
              <input
                type="time"
                className="bg-transparent text-[10px] w-12 text-center focus:outline-none placeholder-gray-400"
                value={newEvent.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="gray"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <input
                type="time"
                className="bg-transparent text-[10px] w-12 text-center focus:outline-none placeholder-gray-400"
                value={newEvent.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <div className="flex items-center gap-1 text-gray-500 flex-1">
              <div className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center text-[8px]">
                $
              </div>
              <input
                type="text"
                placeholder="Cost"
                className="bg-transparent text-[10px] w-full focus:outline-none placeholder-gray-400"
                value={newEvent.cost}
                onChange={(e) => handleInputChange("cost", e.target.value)}
              />
            </div>
            <button
              onClick={handleAdd}
              className="ml-auto px-4 py-1 bg-[#4caf50] hover:bg-green-600 rounded text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              Add
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 5. The Sliding Card Component */}
      <EventCard
        event={selectedEvent}
        isOpen={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onUpdate={updateEvent}
      />
    </div>
  );
}