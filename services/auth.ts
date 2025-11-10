import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import api from './api';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
// For Expo Go: MUST use Web Client ID with Expo's auth proxy
const GOOGLE_CONFIG = {
  webClientId: '302081173028-tb9ekj8f1er45vmgehre61mvjk48hi2o.apps.googleusercontent.com',
  androidClientId: '302081173028-3dn1kpvih879h52k9bcq0ib4hk5ue7c5.apps.googleusercontent.com',
  iosClientId: '302081173028-r9s2p6nku4djqigqr4al352ujl989a9v.apps.googleusercontent.com',
};

// User type from backend
export interface User {
  id: string;
  email: string;
  fullName: string;
  nickname: string | null;
  avatarUrl: string | null;
  authProvider: string;
  isVerified: boolean;
}

// Backend response type
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * Custom hook for Google Authentication
 */
export const useGoogleAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup Google OAuth with explicit redirect URI for Expo
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    // Use Expo's auth proxy - backend must whitelist this URL
    redirectUri: 'https://auth.expo.io/@habdil_ali/scory-apps',
  });

  // Handle Google OAuth response
  useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  const handleGoogleResponse = async () => {
    if (response?.type === 'success') {
      setLoading(true);
      setError(null);

      try {
        const { id_token } = response.params;

        // Send idToken to backend
        const { data } = await api.post<AuthResponse>('/auth/google', {
          idToken: id_token,
        });

        if (data.success) {
          // Save token and user data
          await AsyncStorage.setItem('token', data.data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.data.user));

          setUser(data.data.user);
          console.log('✅ Login successful:', data.data.user.email);
        } else {
          setError(data.message || 'Login failed');
          console.error('❌ Login failed:', data.message);
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Network error. Please check your connection.';
        setError(errorMessage);
        console.error('❌ Auth error:', err);
      } finally {
        setLoading(false);
      }
    } else if (response?.type === 'error') {
      setError('Google authentication failed');
      console.error('❌ Google auth error:', response.error);
    }
  };

  /**
   * Trigger Google Sign In
   */
  const signIn = async () => {
    try {
      setError(null);
      await promptAsync();
    } catch (err) {
      setError('Failed to open Google sign-in');
      console.error('❌ Prompt error:', err);
    }
  };

  /**
   * Sign out user
   */
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('✅ Signed out successfully');
    } catch (err) {
      console.error('❌ Sign out error:', err);
    }
  };

  /**
   * Load user from storage on mount
   */
  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    loadUser,
    isAuthenticated: !!user,
  };
};

/**
 * Get user profile from backend
 */
export const getProfile = async (): Promise<User | null> => {
  try {
    const { data } = await api.get<{ success: boolean; data: User }>('/profile');
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData: {
  fullName?: string;
  nickname?: string;
  avatarUrl?: string;
}): Promise<User | null> => {
  try {
    // Only send fields that have values (remove empty strings)
    const payload: any = {};

    if (profileData.fullName?.trim()) {
      payload.fullName = profileData.fullName.trim();
    }

    if (profileData.nickname?.trim()) {
      payload.nickname = profileData.nickname.trim();
    }

    if (profileData.avatarUrl?.trim()) {
      payload.avatarUrl = profileData.avatarUrl.trim();
    }

    console.log('Sending update profile payload:', payload);

    const { data } = await api.patch<{ success: boolean; message: string; data: User }>(
      '/profile',
      payload
    );

    if (data.success) {
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    }
    return null;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

/**
 * Register with email and password
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  fullName: string,
  nickname?: string
): Promise<{ user: User; token: string }> => {
  try {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      fullName,
      nickname,
    });

    if (data.success) {
      // Save token and user data
      await AsyncStorage.setItem('token', data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));

      console.log('✅ Registration successful:', data.data.user.email);
      return data.data;
    }

    throw new Error(data.message || 'Registration failed');
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
    throw new Error(errorMessage);
  }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    if (data.success) {
      // Save token and user data
      await AsyncStorage.setItem('token', data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));

      console.log('✅ Login successful:', data.data.user.email);
      return data.data;
    }

    throw new Error(data.message || 'Login failed');
  } catch (error: any) {
    console.error('❌ Login error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

/**
 * Logout user (call backend to delete session)
 */
export const logout = async (): Promise<void> => {
  try {
    // Call backend to delete session
    await api.post('/auth/logout');
    console.log('✅ Logged out from backend');
  } catch (error) {
    console.error('❌ Backend logout error:', error);
    // Continue anyway to clear local data
  } finally {
    // Clear local storage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    console.log('✅ Local storage cleared');
  }
};
