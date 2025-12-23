/**
 * Search for a location and return geocoded data
 * @param {string} query - Location search query (e.g., "Eiffel Tower, Paris")
 * @returns {Promise<{latitude: number, longitude: number, display_name: string, city?: string, country?: string} | null>}
 */
export async function geocodeLocation(query) {
  if (!query || query.length < 3) {
    return null;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=1`,
      {
        headers: {
          'User-Agent': 'TravelBuddyApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const results = await response.json();
    
    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      country: result.address?.country
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode multiple locations in parallel
 * @param {string[]} locations - Array of location strings
 * @returns {Promise<Array<{latitude: number, longitude: number, display_name: string, city?: string, country?: string} | null>>}
 */
export async function geocodeMultipleLocations(locations) {
  const promises = locations.map(location => geocodeLocation(location));
  return Promise.all(promises);
}
