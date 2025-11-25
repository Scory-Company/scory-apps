import { Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ReadingProgressBarProps {
  progress: number; // 0 to 1
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ progress }) => {
  const colors = Colors.light;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primary,
              width: `${clampedProgress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
