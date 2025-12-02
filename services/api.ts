import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL configuration
const API_URL = __DEV__
  ? 'http://10.1.1.49:5000/api/v1'
  : 'https://api.scory.app/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Auto-attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore errors getting token
    }
    return config;
  },
  (error) => {
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
