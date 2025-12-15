import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL configuration
const API_URL = __DEV__
  ? 'http://10.60.240.213:5000/api/v1'
  : 'https://api.scory.app/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increased timeout for job polling endpoints
  // Job creation and status polling should not timeout - backend handles the actual timeout
  // Only applies to network connection timeout, not job processing time
  timeout: 30000, // 30 seconds for network operations
});

// Request interceptor - Auto-attach JWT token
api.interceptors.request.use(
  async (config) => {
    // Minimal logging - only show method and path
    const method = config.method?.toUpperCase() || 'GET';
    const path = config.url || '';
    console.log(`[API] ${method} ${path}`);

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API] Error getting token:', error);
    }

    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors & expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch {
        // Ignore errors clearing storage
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
