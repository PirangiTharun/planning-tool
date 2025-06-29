import axios from 'axios';
import type { RoomApiResponse } from '../../types';

// Configure axios base URL for AWS API Gateway
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? '/api' // Use proxy during development
  : (import.meta.env.VITE_API_URL || 'https://b2180toiij.execute-api.us-east-1.amazonaws.com/default');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Don't send cookies with requests
});

// Add request interceptor to handle CORS preflight
api.interceptors.request.use(
  (config) => {
    // Ensure we're making a simple request to avoid preflight
    config.headers.set('Content-Type', 'application/json');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle CORS errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('CORS error detected, trying alternative approach');
      // We'll handle this in the fetchRoomData function
    }
    return Promise.reject(error);
  }
);

// API function to fetch room data
export const fetchRoomData = async (roomId: string): Promise<RoomApiResponse> => {
  try {
    const response = await api.get<RoomApiResponse>(`/getRoomDetails?room_id=${roomId}`);
    return response.data;
  } catch (error) {
    // If CORS error and not in development, try direct fetch as fallback
    if (!isDevelopment && axios.isAxiosError(error) && (error.code === 'ERR_NETWORK' || error.message.includes('CORS'))) {
      try {
        console.log('Attempting direct fetch due to CORS issue...');
        const directUrl = `https://b2180toiij.execute-api.us-east-1.amazonaws.com/default/getRoomDetails?room_id=${roomId}`;
        const fallbackResponse = await fetch(directUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
        }
        
        const data = await fallbackResponse.json();
        return data as RoomApiResponse;
      } catch (fetchError) {
        console.error('Both axios and fetch failed:', fetchError);
        throw new Error('Failed to fetch room data due to CORS policy. Please contact your API administrator to enable CORS for this domain.');
      }
    }
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error: Unable to connect to the API. Please check your internet connection or try again later.');
      }
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};
