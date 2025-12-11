"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
  ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { LatLngExpression, LatLngTuple, DivIcon, LatLngBounds } from "leaflet";
import { fixLeafletIcons } from "@/lib/FixLeafletIcons";
import { useEffect, useState } from "react";
import LeafletGeocoder from "./LeafletGeocoder";
import CoffeeFinder from "./CoffeeFinder";
import { Event } from "@/interface/TripEvent";

// --- Types ---
interface LocationState {
  coords: LatLngExpression;
  loaded: boolean;
  error: boolean;
}

interface MapProps {
  events?: Event[];
}

// --- Internal Component: User Location Handler ---
function UserLocationPan({ coords }: { coords: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 13);
  }, [coords, map]);
  return null;
}

// --- Internal Component: Fit Bounds Handler ---
function FitBounds({ events }: { events: Event[] }) {
  const map = useMap();
  
  useEffect(() => {
    const validEvents = events.filter(e => e.latitude && e.longitude);
    if (validEvents.length === 0) return;

    const bounds = new LatLngBounds(
      validEvents.map(e => [e.latitude!, e.longitude!] as LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [events, map]);

  return null;
}

export default function Map({ events = [] }: MapProps) {
  const defaultPosition: LatLngTuple = [10.8231, 106.6297];

  const [userLocation, setUserLocation] = useState<LocationState>({
    coords: defaultPosition,
    loaded: false,
    error: false,
  });

  const [showToast, setShowToast] = useState<string | null>(null);

  // Filter events with valid coordinates and sort by start_time
  const eventsWithCoords = events
    .filter(e => e.latitude && e.longitude)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Group events by date for different route colors
  const eventsByDate = eventsWithCoords.reduce((acc, event) => {
    const date = new Date(event.start_time).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Route colors for different days
  const routeColors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4'];

  // Create numbered marker icons
  const createNumberedIcon = (number: number) => {
    return new DivIcon({
      className: 'custom-numbered-icon',
      html: `<div style="
        background-color: #4caf50;
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${number}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

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
        {eventsWithCoords.length === 0 && !userLocation.error && (
          <UserLocationPan coords={userLocation.coords} />
        )}

        {eventsWithCoords.length > 0 && <FitBounds events={eventsWithCoords} />}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!userLocation.error && eventsWithCoords.length === 0 && (
          <Marker position={userLocation.coords}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Render event markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {eventsWithCoords.map((event, index) => (
            <Marker
              key={event.id}
              position={[event.latitude!, event.longitude!]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                  {event.address && <p className="text-xs text-gray-600">{event.address}</p>}
                  {event.city && <p className="text-xs text-gray-600">{event.city}, {event.country}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.start_time).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                    {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}`}
                  </p>
                  {event.cost && <p className="text-xs text-green-600 mt-1">Cost: {event.cost}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Render routes (polylines) for each day */}
        {Object.entries(eventsByDate).map(([date, dayEvents], dayIndex) => {
          const routeCoords: LatLngTuple[] = dayEvents.map(e => [e.latitude!, e.longitude!]);
          return (
            <Polyline
              key={date}
              positions={routeCoords}
              color={routeColors[dayIndex % routeColors.length]}
              weight={3}
              opacity={0.7}
            />
          );
        })}

        <ZoomControl position="bottomright" />
        <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-2rem)] md:w-auto pointer-events-none md:pointer-events-auto">
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