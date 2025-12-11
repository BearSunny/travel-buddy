"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { LatLngExpression, LatLngTuple } from "leaflet";
import { fixLeafletIcons } from "@/lib/FixLeafletIcons";
import { useEffect, useState } from "react";
import LeafletGeocoder from "./LeafletGeocoder";
// import CoffeeFinder from "./CoffeeFinder";

// --- Types ---
interface LocationState {
  coords: LatLngExpression;
  loaded: boolean;
  error: boolean;
}

// --- Internal Component: User Location Handler ---
function UserLocationPan({ coords }: { coords: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 13);
  }, [coords, map]);
  return null;
}

export default function Map() {
  const defaultPosition: LatLngTuple = [10.8231, 106.6297];

  const [userLocation, setUserLocation] = useState<LocationState>({
    coords: defaultPosition,
    loaded: false,
    error: false,
  });

  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    fixLeafletIcons();
    if (!navigator.geolocation) {
      setUserLocation({ coords: defaultPosition, loaded: true, error: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          coords: [position.coords.latitude, position.coords.longitude],
          loaded: true,
          error: false,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setUserLocation({ coords: defaultPosition, loaded: true, error: true });
        setShowToast("Location access denied. Showing default view.");
      }
    );
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!userLocation.loaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Locating you...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {showToast && (
        <div className="absolute top-5 right-5 z-[1000] bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {showToast}
        </div>
      )}

      <MapContainer
        center={userLocation.coords}
        zoomControl={false}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        {!userLocation.error && <UserLocationPan coords={userLocation.coords} />}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!userLocation.error && (
          <Marker position={userLocation.coords}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        <ZoomControl position="bottomright"/>
        <div className="absolute top-4 left-4 z-[400] w-[calc(100%-2rem)] md:w-auto pointer-events-none md:pointer-events-auto">
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
            
            {/* The Search Bar (Grows on desktop) */}
            <div className="pointer-events-auto w-full md:w-80">
              <LeafletGeocoder />
            </div>

            {/* The Coffee Button (Fixed width on desktop, full width on mobile) */}
            {/* <div className="pointer-events-auto w-full md:w-auto"> */}
              {/* <CoffeeFinder onToast={(msg) => setShowToast(msg)} /> */}
            {/* </div> */}
          </div>
        </div>
      </MapContainer>
    </div>
  );
}