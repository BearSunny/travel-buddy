// Geocoding utilities using Nominatim (OpenStreetMap)

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    country?: string;
  };
}

export interface GeocodedLocation {
  display_name: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Debounce helper
let searchTimeout: NodeJS.Timeout;

/**
 * Search for location suggestions using Nominatim
 * @param query Search query (e.g., "Louvre Museum")
 * @returns Array of location suggestions
 */
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=10`,
      {
        headers: {
          'User-Agent': 'TravelBuddyApp/1.0' 
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding search failed');
    }

    const results = await response.json();
    return results;
  } catch (error) {
    console.error('Geocoding search error:', error);
    return [];
  }
}

/**
 * Debounced location search
 * @param query Search query
 * @param callback Function to call with results
 * @param delay Debounce delay in ms (default 500)
 */
export function debouncedSearchLocations(
  query: string,
  callback: (results: LocationSuggestion[]) => void,
  delay: number = 500
): void {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(async () => {
    const results = await searchLocations(query);
    callback(results);
  }, delay);
}

/**
 * Convert LocationSuggestion to GeocodedLocation
 */
export function parseLocation(suggestion: LocationSuggestion): GeocodedLocation {
  return {
    display_name: suggestion.display_name,
    latitude: parseFloat(suggestion.lat),
    longitude: parseFloat(suggestion.lon),
    city: suggestion.address?.city,
    country: suggestion.address?.country,
  };
}

/**
 * Geocode a single address (for existing data migration)
 * @param address Address string to geocode
 * @returns Geocoded location or null if not found
 */
export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  const results = await searchLocations(address);
  
  if (results.length === 0) {
    return null;
  }

  return parseLocation(results[0]);
}
