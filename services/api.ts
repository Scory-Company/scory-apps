import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL configuration
const API_URL = __DEV__
  ? 'http://172.16.90.121:5000/api/v1'
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

// Request interceptor - Auto-attach JWT token with automatic refresh
api.interceptors.request.use(
  async (config) => {
    try {
      // Import tokenManager dynamically to avoid circular dependency
      const { getValidToken } = await import('./tokenManager');

      // Get valid token (automatically refreshes if expired)
      const token = await getValidToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[API] ⚠️ No valid token available for request:', config.url);
      }
    } catch (error: any) {
      console.error('[API] ❌ Error getting token:', error.message);
    }

    return config;
  },
  (error) => {
    console.error('[API] ❌ Request interceptor error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors & expired tokens
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log network errors for debugging
    if (error.message === 'Network Error') {
      console.error('[API] 🌐 Network Error:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        baseURL: originalRequest?.baseURL,
        message: 'Cannot connect to backend. Check if backend is running and IP address is correct.'
      });
    } else if (error.code === 'ECONNABORTED') {
      console.error('[API] ⏱️ Request timeout:', originalRequest?.url);
    }

    // Handle 401 errors (token expired/invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[API] 🔐 401 Unauthorized - attempting token refresh...');

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token
        const { refreshAccessToken } = await import('./tokenManager');
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Refresh successful, retry original request
          console.log('[API] ✅ Token refreshed, retrying request');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue();
          return api(originalRequest);
        } else {
          // Refresh failed, clear tokens and reject
          console.log('[API] ❌ Token refresh failed, clearing tokens');
          const { clearTokens } = await import('./tokenManager');
          await clearTokens();
          processQueue(error);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
        console.error('[API] ❌ Token refresh error:', refreshError);
        const { clearTokens } = await import('./tokenManager');
        await clearTokens();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
