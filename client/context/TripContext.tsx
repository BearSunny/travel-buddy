import React, { createContext, useContext, useMemo } from "react";
import { Trip } from "@/interface/Trip";

interface TripContextType {
  activeTrip: Trip | null;
  eventIds: { id: string }[];
  isLoading: boolean;
  removeEventLocal: (tripId: string, eventId: string) => void;
  addEventLocal: (tripId: string, event: any) => void;
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
  const eventIds = useMemo(() => {
    return trip?.events?.map((e) => ({ id: e.id })) || [];
  }, [trip]);

  const value = useMemo(
    () => ({
      activeTrip: trip,
      eventIds,
      isLoading,
      removeEventLocal,
      addEventLocal,
    }),
    [trip, eventIds, isLoading, removeEventLocal, addEventLocal]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};
