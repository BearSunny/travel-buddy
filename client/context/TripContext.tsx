import React, { createContext, useContext, useMemo, useEffect, useCallback } from "react";
import { Trip } from "@/interface/Trip";
import { useCollaborationContext } from "./CollaborationContext";

interface TripContextType {
  activeTrip: Trip | null;
  eventIds: { id: string }[];
  isLoading: boolean;
  removeEventLocal: (tripId: string, eventId: string) => void;
  addEventLocal: (tripId: string, event: any) => void;
  broadcastEventChange: (type: 'event_added' | 'event_updated' | 'event_deleted', eventData: any) => void;
}

const TripContext = createContext<TripContextType | null>(null);

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
};

export const TripProvider = ({
  trip,
  isLoading,
  addEventLocal,
  removeEventLocal,
  children,
}: {
  trip: Trip | null;
  isLoading: boolean;
  addEventLocal: (tripId: string, event: any) => void;
  removeEventLocal: (tripId: string, eventId: string) => void;
  children: React.ReactNode;
}) => {
  const { broadcastEvent, setEventCallbacks, isConnected } = useCollaborationContext();

  const eventIds = useMemo(() => {
    return trip?.events?.map((e) => ({ id: e.id })) || [];
  }, [trip]);

  // Dispatch custom event when trip changes (for components outside TripProvider)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('tripChanged', { 
        detail: trip 
      });
      window.dispatchEvent(event);
    }
  }, [trip]);

  // Subscribe to remote event changes
  useEffect(() => {
    if (!trip || !isConnected) return;

    const tripId = trip.trip_id || (trip as any).id;
    console.log('[TripContext] Setting up event callbacks for trip:', tripId);

    setEventCallbacks({
      onEventAdded: (event) => {
        console.log('[TripContext] Remote event added:', event);
        addEventLocal(tripId, event);
      },
      onEventUpdated: (event) => {
        console.log('[TripContext] Remote event updated:', event);
        // Remove old and add updated
        removeEventLocal(tripId, event.id);
        addEventLocal(tripId, event);
      },
      onEventDeleted: (eventId) => {
        console.log('[TripContext] Remote event deleted:', eventId);
        removeEventLocal(tripId, eventId);
      },
    });

    return () => {
      console.log('[TripContext] Cleaning up event callbacks');
      setEventCallbacks({});
    };
  }, [trip, isConnected, setEventCallbacks, addEventLocal, removeEventLocal]);

  // Function to broadcast event changes after local API operations
  const broadcastEventChange = useCallback((type: 'event_added' | 'event_updated' | 'event_deleted', eventData: any) => {
    if (isConnected) {
      console.log('[TripContext] Broadcasting event change:', type, eventData);
      broadcastEvent(type, eventData);
    }
  }, [isConnected, broadcastEvent]);

  const value = useMemo(
    () => ({
      activeTrip: trip,
      eventIds,
      isLoading,
      removeEventLocal,
      addEventLocal,
      broadcastEventChange,
    }),
    [trip, eventIds, isLoading, removeEventLocal, addEventLocal, broadcastEventChange]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};
