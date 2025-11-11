import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import api from './api';

// Google OAuth Configuration
const GOOGLE_CONFIG = {
  webClientId: '302081173028-tb9ekj8f1er45vmgehre61mvjk48hi2o.apps.googleusercontent.com',
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
 * Configure Google Sign In
 * Call this once when app starts
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_CONFIG.webClientId,
    offlineAccess: true,
  });
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<{ user: User; token: string }> => {
  try {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices();

    // Get user info from Google
    await GoogleSignin.signIn();

    // Get ID token
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;

    // Send idToken to backend
    const { data } = await api.post<AuthResponse>('/auth/google', {
      idToken,
    });

    if (data.success) {
      // Save token and user data
      await AsyncStorage.setItem('token', data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data;
    }

    throw new Error('Unable to sign in with Google. Please try again.');
  } catch (error: any) {
    // Handle specific error codes with user-friendly messages
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Sign in was cancelled');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Please wait, sign in is in progress');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services is not available on this device');
    }

    throw new Error('Unable to sign in with Google. Please try again later.');
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    // Sign out from Google
    await GoogleSignin.signOut();

    // Clear local storage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    throw new Error('Unable to sign out. Please try again.');
  }
};

/**
 * Get current Google user info (if signed in)
 */
export const getCurrentGoogleUser = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo;
  } catch {
    return null;
  }
};
