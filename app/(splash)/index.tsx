import { Colors } from '@/constants/theme';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkSession } from '@/services/auth';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  const router = useRouter();
  const colors = Colors.light;

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();

      // Initialize app and navigate accordingly
      const timer = setTimeout(async () => {
        // Step 1: Check if user has valid session (auto-login)
        const hasValidSession = await checkSession();

        if (hasValidSession) {
          // User is logged in, go directly to home
          router.replace('/(tabs)');
          return;
        }

        // Step 2: No valid session, check onboarding status
        const hasCompletedOnboarding = await AsyncStorage.getItem('onboarding_completed');

        if (hasCompletedOnboarding === 'true') {
          // User has completed onboarding, go to login
          router.replace('/(auth)/login');
        } else {
          // First-time user, show onboarding
          router.replace('/(onboarding)/welcome');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryDark }]}>
      {/* Logo only - centered */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/onboarding/logo-white.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 84,
  },
});
