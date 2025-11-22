"use client";

import { useState } from "react";
import { useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Interfaces
interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    amenity?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface CoffeeFinderProps {
  onToast: (message: string) => void;
}

// --- Custom Icon (Orange) ---
const createCoffeeIcon = () => {
  return L.divIcon({
    className: "custom-coffee-marker",
    html: `<div class="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 1v3M10 1v3M14 1v3" />
             </svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const coffeeIcon = createCoffeeIcon();

export default function CoffeeFinder({ onToast }: CoffeeFinderProps) {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  const [coffeeShops, setCoffeeShops] = useState<OverpassElement[]>([]);

  const findCoffeeNearby = async () => {
    setLoading(true);
    const center = map.getCenter();
    const lat = center.lat;
    const lon = center.lng;
    const radius = 1000;

    const query = `
      [out:json][timeout:25];
      nwr(around:${radius},${lat},${lon})["amenity"="cafe"];
      out center;
    `;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Too many requests. Wait a moment.");
        throw new Error(`Error: ${response.statusText}`);
      }

      const data: OverpassResponse = await response.json();
      
      const validShops = data.elements.filter((e) => {
        const hasName = e.tags?.name;
        const hasCoords = (e.lat && e.lon) || (e.center?.lat && e.center?.lon);
        return hasName && hasCoords;
      });

      if (validShops.length === 0) {
        onToast("No coffee shops found within 1km.");
      } else {
        onToast(`Found ${validShops.length} coffee shops nearby!`);
        setCoffeeShops(validShops);
      }

    } catch (error: any) {
      console.error("Overpass API Error:", error);
      onToast(error.message || "Failed to fetch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SHARED STYLE: h-12, bg-white, border-gray-300, rounded-lg, shadow-md 
        Width is handled by parent (w-full mobile, w-12 desktop)
      */}
      <button
        onClick={findCoffeeNearby}
        disabled={loading}
        title="Find Coffee Nearby"
        className={`
          h-12 w-full md:w-12
          flex items-center justify-center
          rounded-lg border border-gray-300 shadow-md
          bg-white hover:bg-gray-50 transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-orange-400
        `}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          // Orange Icon inside White Button
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 1v3M10 1v3M14 1v3" />
          </svg>
        )}
      </button>

      {/* Markers */}
      {coffeeShops.map((shop) => {
        const position: L.LatLngExpression = [
            shop.lat ?? shop.center!.lat, 
            shop.lon ?? shop.center!.lon
        ];

        return (
          <Marker key={shop.id} position={position} icon={coffeeIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-orange-700 block mb-1">{shop.tags?.name}</strong>
                <span className="text-gray-600 text-xs">{shop.tags?.["addr:street"] || "Coffee Shop"}</span>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}