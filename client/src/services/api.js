import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const createApiClient = (getAccessTokenSilently) => {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add Auth0 token
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        if (getAccessTokenSilently) {
          const token = await getAccessTokenSilently({
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          });
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error('Error getting access token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('Unauthorized access - redirecting to login');
        // Handle unauthorized access
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

export const testConnection = async () => {
  try {
    const response = await axios.get('http://localhost:5001/api/health');
    console.log('Backend connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Backend connection failed:', error);
    throw error;
  }
};

export default createApiClient;