import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL configuration
const API_URL = __DEV__
  ? 'http://192.168.1.14:5000/api/v1'
  : 'https://api.scory.app/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for long-running simplify operations
});

// Request interceptor - Auto-attach JWT token
api.interceptors.request.use(
  async (config) => {
    // 🔍 DEBUG LOGGING
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[API INTERCEPTOR] Request Details:');
    console.log('  Method:', config.method?.toUpperCase());
    console.log('  URL Path:', config.url);
    console.log('  Full URL:', (config.baseURL || '') + (config.url || ''));
    console.log('  Base URL:', config.baseURL);

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('  Token:', token.substring(0, 30) + '...' + token.substring(token.length - 10));
        console.log('  ✅ Token attached');
      } else {
        console.log('  ⚠️ No token found in AsyncStorage');
      }
    } catch (error) {
      console.log('  ❌ Error getting token:', error);
    }

    console.log('  Headers:', JSON.stringify(config.headers, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return config;
  },
  (error) => {
    console.log('[API INTERCEPTOR] ❌ Request Error:', error);
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
