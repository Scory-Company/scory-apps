import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL configuration
const API_URL = __DEV__
  ? 'https://scory-backend-production.up.railway.app/api/v1'
  : 'https://scory-backend-production.up.railway.app/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increased timeout for job polling endpoints
  // Job creation and status polling should not timeout - backend handles the actual timeout
  // Only applies to network connection timeout, not job processing time
  timeout: 120000, // 120 seconds for long-running AI jobs
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
      }
    } catch {
      // Silent error
    }

    return config;
  },
  (error) => {
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

    // Handle 401 errors (token expired/invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {

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
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue();
          return api(originalRequest);
        } else {
          // Refresh failed, clear tokens and reject
          const { clearTokens } = await import('./tokenManager');
          await clearTokens();
          processQueue(error);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
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
