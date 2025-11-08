import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

interface OnboardingDotsProps {
  total: number;
  currentIndex: number;
  scrollX?: Animated.Value;
}

export function OnboardingDots({ total, currentIndex }: OnboardingDotsProps) {
  const colors = Colors.light;

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === currentIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive ? styles.activeDot : styles.inactiveDot,
              {
                backgroundColor: isActive ? colors.primary : 'transparent',
                borderColor: colors.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  activeDot: {
    width: 32,
  },
  inactiveDot: {
    width: 8,
  },
});
