import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

const googleMapsClient = axios.create({
  baseURL: GOOGLE_MAPS_BASE_URL,
});

export const getPlaceDetails = async (placeId) => {
  try {
    const response = await googleMapsClient.get('/place/details/json', {
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        fields: 'name,rating,formatted_address,opening_hours,photos,url'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Google Maps API Error: ${error.message}`);
  }
};

export const searchPlaces = async (query, location, radius) => {
  try {
    const response = await googleMapsClient.get('/place/textsearch/json', {
      params: {
        query,
        location,
        radius: radius || 5000,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Google Maps Search Error: ${error.message}`);
  }
};

export const getNearbyPlaces = async (latitude, longitude, type, radius) => {
  try {
    const response = await googleMapsClient.get('/place/nearbysearch/json', {
      params: {
        location: `${latitude},${longitude}`,
        radius: radius || 5000,
        type: type || 'restaurant',
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Nearby Search Error: ${error.message}`);
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await googleMapsClient.get('/geocode/json', {
      params: {
        latlng: `${latitude},${longitude}`,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Reverse Geocoding Error: ${error.message}`);
  }
};