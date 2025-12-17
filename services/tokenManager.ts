import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

/**
 * Token Manager
 * 
 * Manages JWT token lifecycle including:
 * - Token storage and retrieval
 * - Token expiry checking
 * - Automatic token refresh
 */

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

// Base URL configuration
const API_URL = __DEV__
    ? 'http://192.168.7.206:5000/api/v1'
    : 'https://api.scory.app/api/v1';

/**
 * Decode JWT token to get expiry time
 */
function decodeJWT(token: string): { exp?: number } | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

/**
 * Check if token is expired or will expire soon
 * @param bufferMinutes - Minutes before expiry to consider token as expired (default: 5)
 */
export async function isTokenExpired(bufferMinutes: number = 5): Promise<boolean> {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);

        // If no token exists, consider it expired
        if (!token) {
            return true;
        }

        const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

        if (!expiryStr) {
            // No expiry stored, try to decode from token
            const decoded = decodeJWT(token);
            if (decoded?.exp) {
                // Save expiry for future checks
                await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, decoded.exp.toString());

                const now = Math.floor(Date.now() / 1000);
                const buffer = bufferMinutes * 60;
                return now + buffer >= decoded.exp;
            }
            // Can't determine expiry, consider expired
            return true;
        }

        const expiry = parseInt(expiryStr, 10);
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const buffer = bufferMinutes * 60; // Convert to seconds

        // Token is expired if current time + buffer >= expiry time
        const isExpired = now + buffer >= expiry;

        if (isExpired) {
            const timeUntilExpiry = expiry - now;
        }

        return isExpired;
    } catch (error) {
        return true;
    }
}

/**
 * Save token and extract expiry time
 */
export async function saveToken(token: string, refreshToken?: string): Promise<void> {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);

        // Decode token to get expiry
        const decoded = decodeJWT(token);
        if (decoded?.exp) {
            await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, decoded.exp.toString());
        }

        // Save refresh token if provided
        if (refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Get current access token
 */
export async function getToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        return null;
    }
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        return null;
    }
}

/**
 * Clear all tokens
 */
export async function clearTokens(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY, 'user']);
    } catch (error) {
        throw error;
    }
}

/**
 * Refresh access token using refresh token
 * Returns new access token or null if refresh failed
 */
export async function refreshAccessToken(): Promise<string | null> {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            return null;
        }

        // Call backend refresh endpoint
        const response = await axios.post(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            }
        );

        if (response.data?.success && response.data?.data?.token) {
            const newToken = response.data.data.token;
            const newRefreshToken = response.data.data.refreshToken;

            // Save new tokens
            await saveToken(newToken, newRefreshToken);

            return newToken;
        }
        return null;
    } catch (error: any) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // If refresh fails with 401, clear all tokens (refresh token is invalid)
        if (status === 401) {
            await clearTokens();
        }

        // If endpoint doesn't exist (404), backend doesn't support refresh
        if (status === 404) {
        }

        return null;
    }
}

/**
 * Get valid token - automatically refreshes if expired
 * Returns token or null if unable to get/refresh
 */
export async function getValidToken(): Promise<string | null> {
    try {
        // Check if current token is expired (with 2 minute buffer instead of 5)
        const expired = await isTokenExpired(2);

        if (!expired) {
            // Token is still valid
            return await getToken();
        }

        // Token is expired or will expire soon, try to refresh
        const newToken = await refreshAccessToken();

        if (newToken) {
            return newToken;
        }

        // Refresh failed, clear tokens
        await clearTokens();
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Get token information for debugging
 * Returns detailed info about current token state
 */
export async function getTokenInfo(): Promise<{
    hasToken: boolean;
    hasRefreshToken: boolean;
    expiresAt?: number;
    expiresIn?: number;
    isExpired: boolean;
} | null> {
    try {
        const token = await getToken();
        const refreshToken = await getRefreshToken();
        const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

        if (!token) {
            return {
                hasToken: false,
                hasRefreshToken: !!refreshToken,
                isExpired: true
            };
        }

        const expiry = expiryStr ? parseInt(expiryStr, 10) : null;
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = expiry ? expiry - now : null;

        return {
            hasToken: true,
            hasRefreshToken: !!refreshToken,
            expiresAt: expiry || undefined,
            expiresIn: expiresIn || undefined,
            isExpired: await isTokenExpired(0) // Check without buffer
        };
    } catch (error) {
        return null;
    }
}

export default {
    saveToken,
    getToken,
    getRefreshToken,
    getValidToken,
    refreshAccessToken,
    isTokenExpired,
    clearTokens,
    getTokenInfo,
};
