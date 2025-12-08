import useSWR from "swr";
import { useDbUser } from "@/context/userContext";
import { Event } from "@/interface/TripEvent";

interface CreateEventData {
  trip_id: string;
  title: string;
  description?: string;
  start_time?: Date | string;
  end_time?: Date | string;
  address?: string;
  city?: string;
  country?: string;
  status: string;
  cost?: string;
  image?: string;
  timeRange?: string;
  travelTime?: string;
  distance?: string;
}
const batchFetcher = async (...args: (string | string[])[]) => {
  const urls = (Array.isArray(args[0]) ? args[0] : args) as string[];
  if (urls.length === 0) return [];
  const promises = urls.map((url) => fetch(url).then((res) => res.json()));
  return Promise.all(promises);
};

export function useEvents(
  baseEvents: { id: string }[],
  onEventsChange?: (
    action: "create" | "delete",
    payload: Event | string
  ) => void
) {
  const { user } = useDbUser();
  const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
  const endpoint = `${apiUrl}/api/trip_events`;

  const shouldFetch = baseEvents && baseEvents.length > 0;

  const urls = shouldFetch
    ? baseEvents.map((e) => `${endpoint}/read/${e.id}`)
    : null;

  const {
    data: detailedEvents,
    error,
    isLoading,
    mutate,
  } = useSWR<Event[]>(urls, batchFetcher, {
    dedupingInterval: 5000,
    keepPreviousData: true,
    fallbackData: [],
  });

  const createEvent = async (eventData: CreateEventData) => {
    if (!user) throw new Error("User not authenticated");
    try {
      console.log("New Event info:", eventData)
      const response = await fetch(`${endpoint}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, creator_id: user.id }),
      });
      if (!response.ok) throw new Error("Failed to create");

      const newEvent = await response.json();

      await mutate((current) => [...(current || []), newEvent], false);
      if (onEventsChange) onEventsChange("create", newEvent);

      return newEvent;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await fetch(`${endpoint}/delete/${id}`, { method: "DELETE" });

      await mutate(
        (current) => (current || []).filter((e) => e.id !== id),
        false
      );

      if (onEventsChange) onEventsChange("delete", id);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    events: detailedEvents || [],
    isLoading: isLoading && !!urls,
    isError: error,
    createEvent,
    deleteEvent,
    mutate,
  };
}
