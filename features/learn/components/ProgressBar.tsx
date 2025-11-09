import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  fillColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  fillColor,
  backgroundColor,
  textColor,
}) => {
  const colors = Colors.light;
  const percentage = (current / total) * 100;

  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarBg, { backgroundColor: backgroundColor || colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: fillColor || colors.third }
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: textColor || colors.textSecondary }]}>
        {current}/{total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    minWidth: 40,
  },
});