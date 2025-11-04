import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';
import createApiClient from './api';

export const useMapsService = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  const apiClient = useMemo(() => {
    if (isAuthenticated) {
      const client = createApiClient(getAccessTokenSilently);
      console.log('API Client Base URL: ', client.defaults.baseURL);
      return client;
    }
    return null;
  }, [getAccessTokenSilently, isAuthenticated]);

  const searchPlaces = async (query, location, radius = 5000) => {
    if (!apiClient) throw new Error('Not authenticated');
    
    console.log('Making request to base URL: ', apiClient.defaults.baseURL);
    console.log('Full URL will be: ', `${apiClient.defaults.baseURL}/google-maps/nearby`);
    
    const response = await apiClient.get('/google-maps/search', {
      params: { query, location, radius }
    });
    return response.data;
  };

  const getNearbyPlaces = async (latitude, longitude, type = 'restaurant', radius = 5000) => {
    if (!apiClient) throw new Error('Not authenticated');
    
    const response = await apiClient.get('/google-maps/nearby', {
      params: { latitude, longitude, type, radius }
    });
    return response.data;
  };

  const getPlaceDetails = async (placeId) => {
    if (!apiClient) throw new Error('Not authenticated');
    
    const response = await apiClient.get(`/google-maps/place/${placeId}`);
    return response.data;
  };

  const reverseGeocode = async (latitude, longitude) => {
    if (!apiClient) throw new Error('Not authenticated');
    
    const response = await apiClient.get('/google-maps/geocode', {
      params: { latitude, longitude }
    });
    return response.data;
  };

  return {
    searchPlaces,
    getNearbyPlaces,
    getPlaceDetails,
    reverseGeocode,
    isReady: !!apiClient
  };
};