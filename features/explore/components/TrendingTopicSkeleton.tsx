import { Radius, Shadows, Spacing } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

export const TrendingTopicSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.skeletonCard, Shadows.md]}>
      <Animated.View style={[styles.shimmer, { opacity }]}>
        {/* Icon placeholder */}
        <View style={styles.iconPlaceholder} />

        {/* Title placeholder */}
        <View style={styles.titlePlaceholder} />

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.countPlaceholder} />
          <View style={styles.arrowPlaceholder} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonCard: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    minHeight: 150,
    width: '48%',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  shimmer: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
    minHeight: 150,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginBottom: Spacing.xs,
  },
  titlePlaceholder: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginBottom: Spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  countPlaceholder: {
    width: '50%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  arrowPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
  },
});
