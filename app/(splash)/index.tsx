import { Colors } from '@/constants/theme';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkSession } from '@/services/auth';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  const router = useRouter();
  const colors = Colors.light;
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();

      // Start Info Animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

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
      }, 2500); // Slightly longer to show animation

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, router]);

  if (!fontsLoaded) {
    return null;
  }

  // Responsive calculations
  const logoWidth = Math.min(width * 0.5, 240); // 50% of screen width, max 240px
  const logoHeight = logoWidth * (84 / 200); // Maintain original aspect ratio (84/200 = 0.42)

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryDark }]}>
      <StatusBar style="light" />
      
      {/* Animated Logo */}
      <Animated.View 
        style={[
          styles.logoContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('@/assets/images/onboarding/logo-white.svg')}
          style={{ width: logoWidth, height: logoHeight }}
          contentFit="contain"
        />
      </Animated.View>
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
    // Add shadow/glow effect for premium feel
    shadowColor: '#fff', 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
});
