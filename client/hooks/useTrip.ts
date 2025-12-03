import useSWR from "swr";
import { useState, useEffect } from "react";
import { useDbUser } from "@/context/userContext";
import { Trip } from "@/interface/Trip";

interface CreateTripData {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

interface UpdateTripData {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTrip() {
  const { user } = useDbUser();
  const apiUrl = process.env.APP_API_URL || 'http://localhost:5001';

  const { data: userData, error, isLoading: isUserLoading, mutate } = useSWR(
    user ? `${apiUrl}/api/users/${user.id}` : null,
    fetcher,
    {
      refreshInterval: 300000,
      dedupingInterval: 2000,
    }
  );

  const [fullTrips, setFullTrips] = useState<Trip[]>([]);
  const [isTripsLoading, setIsTripsLoading] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!userData || !userData.trips || userData.trips.length === 0) {
        setFullTrips([]);
        return;
      }

      setIsTripsLoading(true);
      try {
        const promises = userData.trips.map(async (t: any) => {
          const tripId = t.id || t.trip_id; 
          const res = await fetch(`${apiUrl}/api/trips/read/${tripId}`);
          return res.json();
        });

        const results = await Promise.all(promises);
        const formattedTrips: Trip[] = results
          .map((res: any) => {
            // Check if response is valid array and has data
            if (Array.isArray(res) && res.length > 0) {
              const { trip, trip_events } = res[0];
              return {
                ...trip,
                trip_id: trip.id, 
                events: trip_events || [],
              };
            }
            return null;
          })
          .filter((t): t is Trip => t !== null); // Remove any failed fetches

        setFullTrips(formattedTrips);
      } catch (err) {
        console.error("Error fetching detailed trips:", err);
      } finally {
        setIsTripsLoading(false);
      }
    };

    fetchTripDetails();
  }, [userData, apiUrl]);

  // --- ACTIONS ---

  const createTrip = async (tripData: CreateTripData) => {
    if (!user) return;
    try {
      const response = await fetch(`${apiUrl}/api/trips/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tripData, owner_id: user.id }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create");
      }
      await mutate(); 
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateTrip = async (tripId: number | string, updates: UpdateTripData) => {
    try {
      const response = await fetch(`${apiUrl}/api/trips/update/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update");
      await mutate();
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteTrip = async (tripId: number | string) => {
    try {
      const response = await fetch(`${apiUrl}/api/trips/delete/${tripId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");
      await mutate();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    plan: fullTrips, 
    isLoading: isUserLoading || isTripsLoading,
    isError: error,
    refetch: mutate,
    createTrip,
    updateTrip,
    deleteTrip,
  };
}