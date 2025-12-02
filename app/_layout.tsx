import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { configureGoogleSignIn } from '@/services/googleAuth';
import { LanguageProvider } from '@/features/settings/context/LanguageContext';
import { personalizationApi } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@/utils/i18n';
import 'react-native-reanimated';

export default function RootLayout() {
  // Configure Google Sign In and sync personalization on app start
  useEffect(() => {
    configureGoogleSignIn();
    syncPersonalizationFromAPI();
  }, []);

  // Sync reading level preference from API to AsyncStorage
  const syncPersonalizationFromAPI = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      // Only sync if user is logged in
      if (!token) {
        console.log('🔄 [Sync] No token found, skipping personalization sync');
        return;
      }

      console.log('🔄 [Sync] Fetching personalization from API...');
      const response = await personalizationApi.getSettings();

      if (response.data?.data?.readingLevel) {
        const apiLevel = response.data.data.readingLevel;
        console.log('🔄 [Sync] API Reading Level:', apiLevel);

        // Sync to AsyncStorage
        await AsyncStorage.setItem('preferredReadingLevel', apiLevel);
        console.log('✅ [Sync] Reading level synced to AsyncStorage:', apiLevel);
      } else {
        console.log('⚠️ [Sync] No personalization data in API, using local cache');
      }
    } catch (error) {
      console.error('❌ [Sync] Failed to sync personalization:', error);
      // Don't throw error - fallback to AsyncStorage or default
    }
  };

  return (
    <LanguageProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LanguageProvider>
  );
}
