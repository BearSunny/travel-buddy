"use client";

import { useState, useEffect } from "react";
import { useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Interfaces
interface GeocodeResult {
  name: string;
  center: L.LatLng;
  bbox: L.LatLngBounds;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: string[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function LeafletGeocoder() {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setResults([]);
      setIsOpen(false);
      setNoResults(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    setIsSearching(true);
    setNoResults(false);

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5&addressdetails=1`,
          { signal }
        );

        if (!response.ok) throw new Error("Network error");

        const data: NominatimResult[] = await response.json();

        if (data.length === 0) {
          setResults([]);
          setNoResults(true);
          setIsOpen(true);
        } else {
          const mappedResults: GeocodeResult[] = data.map((item) => {
            const bbox = L.latLngBounds(
              [parseFloat(item.boundingbox[0]), parseFloat(item.boundingbox[2])],
              [parseFloat(item.boundingbox[1]), parseFloat(item.boundingbox[3])]
            );
            return {
              name: item.display_name,
              center: L.latLng(parseFloat(item.lat), parseFloat(item.lon)),
              bbox: bbox,
            };
          });
          setResults(mappedResults);
          setIsOpen(true);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Geocoding error:", error);
          setResults([]);
          setNoResults(true);
        }
      } finally {
        if (!signal.aborted) setIsSearching(false);
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSelectLocation = (result: GeocodeResult) => {
    setQuery(result.name);
    setIsOpen(false);
    
    const southWest = result.bbox.getSouthWest();
    const northEast = result.bbox.getNorthEast();
    const latDiff = Math.abs(northEast.lat - southWest.lat);
    const lngDiff = Math.abs(northEast.lng - southWest.lng);

    if (latDiff < 0.005 && lngDiff < 0.005) {
      map.flyTo(result.center, 16);
    } else {
      map.fitBounds(result.bbox);
    }
  };

  return (
    <div className="relative font-sans text-black w-full pointer-events-none md:pointer-events-auto ">
      {/* SHARED STYLE: h-12, bg-white, border-gray-300, rounded-lg, shadow-md */}
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="w-full h-12 px-4 pr-10 rounded-lg border border-gray-300 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {/* Spinner inside input */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <ul className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto border border-gray-200 bg-white rounded-lg shadow-xl z-[1100]">
          {noResults ? (
            <li className="px-4 py-3 text-gray-500 text-sm">No locations found</li>
          ) : (
            results.map((res, idx) => (
              <li
                key={`${res.name}-${idx}`}
                onClick={() => handleSelectLocation(res)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0 leading-snug"
              >
                {res.name}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Live Markers */}
      {results.map((res, idx) => (
        <Marker
          key={`marker-${idx}`}
          position={res.center}
          eventHandlers={{ click: () => handleSelectLocation(res) }}
        >
          <Popup>
            <div className="text-sm font-medium">{res.name}</div>
          </Popup>
        </Marker>
      ))}
    </div>
  );
}