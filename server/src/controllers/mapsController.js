import * as googleMapsService from '../services/googleMapsService.js';

export const getPlaceDetails = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const data = await googleMapsService.getPlaceDetails(placeId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const searchPlaces = async (req, res, next) => {
  try {
    const { query, location, radius } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const data = await googleMapsService.searchPlaces(query, location, radius);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { latitude, longitude, type, radius } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    const data = await googleMapsService.getNearbyPlaces(latitude, longitude, type, radius);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const reverseGeocode = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    const data = await googleMapsService.reverseGeocode(latitude, longitude);
    res.json(data);
  } catch (error) {
    next(error);
  }
};