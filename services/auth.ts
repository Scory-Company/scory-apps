import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import api from './api';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
// Web Client ID: For Expo Go development only
// Android/iOS Client IDs: For production & development builds
const GOOGLE_CONFIG = {
  webClientId: '302081173028-tb9ekj8f1er45vmgehre61mvjk48hi2o.apps.googleusercontent.com',
  androidClientId: '302081173028-3dn1kpvih879h52k9bcq0ib4hk5ue7c5.apps.googleusercontent.com',
  iosClientId: '302081173028-r9s2p6nku4djqigqr4al352ujl989a9v.apps.googleusercontent.com',
};

// Detect if running in Expo Go vs Standalone/Development Build
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Get appropriate redirect URI based on environment
const getRedirectUri = () => {
  if (isExpoGo) {
    // Expo Go: use Expo's auth proxy
    return 'https://auth.expo.io/@habdil_ali/scory-apps';
  }
  // Production/Development Build: use custom scheme
  // Android/iOS Client IDs handle this automatically
  return undefined; // Let expo-auth-session auto-generate
};

// User type from backend
export interface User {
  id: string;
  email: string;
  fullName: string;
  nickname: string | null;
  avatarUrl: string | null;
  authProvider: string;
  role:string;
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

  // Setup Google OAuth with environment-aware configuration
  // Expo Go: Web Client ID + Expo auth proxy
  // Production/Dev Build: Android/iOS Client ID + auto redirect
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    redirectUri: getRedirectUri(),
  });


  // Handle Google OAuth response
  useEffect(() => {
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
          } else {
            setError(data.message || 'Unable to sign in. Please try again.');
          }
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message || 'Unable to connect. Please check your internet connection.';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      } else if (response?.type === 'error') {
        setError('Unable to sign in with Google. Please try again.');
      }
    };

    handleGoogleResponse();
  }, [response, request]);

  /**
   * Trigger Google Sign In
   */
  const signIn = async () => {
    try {
      setError(null);
      await promptAsync();
    } catch {
      setError('Unable to open Google sign-in. Please try again.');
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
    } catch {
      // Ignore errors during sign out
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
    } catch {
      // Ignore errors during user load
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
  } catch {
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
    throw new Error(error.response?.data?.message || 'Unable to update profile. Please try again.');
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

      return data.data;
    }

    throw new Error('Unable to create account. Please try again.');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Unable to create account. Please try again.';
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

      return data.data;
    }

    throw new Error('Unable to sign in. Please check your credentials.');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Unable to sign in. Please check your credentials.';
    throw new Error(errorMessage);
  }
};

/**
 * Check if user has valid session (token exists and valid)
 */
export const checkSession = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return false;
    }

    // Validate token by fetching profile
    const profile = await getProfile();

    if (profile) {
      // Token valid, update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(profile));
      return true;
    }

    // Token invalid, clear storage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    return false;
  } catch {
    // Network error or other issues, assume invalid
    return false;
  }
};

/**
 * Logout user (call backend to delete session)
 */
export const logout = async (): Promise<void> => {
  try {
    // Call backend to delete session
    await api.post('/auth/logout');
  } catch {
    // Continue anyway to clear local data
  } finally {
    // Sign out from Google if signed in
    try {
      const { signOutFromGoogle } = await import('./googleAuth');
      await signOutFromGoogle();
    } catch {
      // User might not be signed in with Google, ignore error
    }

    // Clear local storage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }
};
