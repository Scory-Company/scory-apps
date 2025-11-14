import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { configureGoogleSignIn } from '@/services/googleAuth';
import { LanguageProvider } from '@/features/settings/context/LanguageContext';
import '@/utils/i18n';
import 'react-native-reanimated';

export default function RootLayout() {
  // Configure Google Sign In on app start
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

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
