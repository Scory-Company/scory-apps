import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, useColorScheme } from 'react-native';
import { Spacing, Typography, Radius } from '@/constants/theme';

interface GamificationLoaderProps {
  message?: string;
  emoji?: string;
}

export const GamificationLoader: React.FC<GamificationLoaderProps> = ({
  message = 'Setting up your experience...',
  emoji = '🎯',
}) => {
  const colorScheme = useColorScheme();

  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation for the outer ring
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for the emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation for the text
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Generate lighter shades for the third color
  const thirdColor = colorScheme === 'light' ? '#19A03D' : '#26EE5A';
  const thirdLight = colorScheme === 'light' ? '#4DB874' : '#74E99D';
  const thirdLighter = colorScheme === 'light' ? '#A3D9B5' : '#B3F5CE';
  const thirdBg = colorScheme === 'light' ? '#E8F5EC' : '#1A3A28';

  return (
    <View style={styles.container}>
      {/* Outer spinning ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View style={[styles.ringSegment1, { width: 70, height: 70, borderWidth: 3, borderColor: thirdColor, borderTopColor: 'transparent', borderLeftColor: 'transparent' }]} />
        <View style={[styles.ringSegment2, { width: 58, height: 58, borderWidth: 2.5, borderColor: thirdLight, borderBottomColor: 'transparent', borderRightColor: 'transparent' }]} />
        <View style={[styles.ringSegment3, { width: 48, height: 48, borderWidth: 2, borderColor: thirdLighter, borderTopColor: 'transparent', borderLeftColor: 'transparent' }]} />
      </Animated.View>

      {/* Inner circle with emoji */}
      <View style={[styles.innerCircle, { width: 40, height: 40, backgroundColor: thirdBg }]}>
        <Animated.Text
          style={[
            styles.emoji,
            {
              transform: [{ scale: pulseValue }],
            },
          ]}
        >
          {emoji}
        </Animated.Text>
      </View>

      {/* Loading message */}
      <Animated.Text
        style={[
          styles.message,
          {
            color: thirdColor,
            opacity: fadeValue,
          },
        ]}
      >
        {message}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  outerRing: {
    width: 70,
    height: 70,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSegment1: {
    position: 'absolute',
    borderRadius: Radius.full,
  },
  ringSegment2: {
    position: 'absolute',
    borderRadius: Radius.full,
  },
  ringSegment3: {
    position: 'absolute',
    borderRadius: Radius.full,
  },
  innerCircle: {
    position: 'absolute',
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  message: {
    marginTop: Spacing.xl,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
