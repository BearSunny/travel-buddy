"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDbUser } from "@/context/userContext";
import { Trip } from "@/interface/Trip";
import PlanCard from "@/components/SideBar/trip/PlanCard";
import EmptyState from "@/components/SideBar/trip/EmptyState";

interface TripData {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

export default function YourPlansTab() {
  const router = useRouter();
  const { user } = useDbUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTrips = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const apiUrl = process.env.APP_API_URL || "http://localhost:5001";
        const response = await fetch(`${apiUrl}/api/users/${user.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }

        const data = await response.json();
        
        // Transform the trips data to match Trip interface
        const transformedTrips: Trip[] = (data.trips || []).map((trip: TripData) => ({
          trip_id: trip.id,
          owner_id: trip.owner_id,
          title: trip.title,
          description: trip.description,
          start_date: new Date(trip.start_date),
          end_date: new Date(trip.end_date),
          events: [],
        }));

        setTrips(transformedTrips);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError(err instanceof Error ? err.message : "Failed to load trips");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTrips();
  }, [user]);

  const handleViewTrip = (tripId: string) => {
    router.push(`/?trip=${tripId}`);
  };

  const handleDeleteTrip = async (tripId: string) => {
    // For now, just filter it out locally
    setTrips((currentTrips) => currentTrips.filter((t) => t.trip_id !== tripId));
  };

  const handleCreateTrip = () => {
    // Navigate to templates or AI tab
    router.push("/discover");
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Loading your plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">Error loading plans</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4 font-medium">Please log in to view your plans.</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <EmptyState onCreate={handleCreateTrip} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Your Plans</h2>
        <p className="text-gray-600 mt-2 text-sm">
          All your trip plans in one place • {trips.length} {trips.length === 1 ? "plan" : "plans"}
        </p>
      </div>

      <div className="space-y-3">
        {trips.map((trip) => (
          <PlanCard
            key={trip.trip_id}
            trip={trip}
            onClick={() => handleViewTrip(trip.trip_id)}
            onDelete={handleDeleteTrip}
            isShared={trip.owner_id !== user.id}
          />
        ))}
      </div>
    </div>
  );
}
