import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Image, ImageSource } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ContinueLearningCardProps {
  image: ImageSource;
  title: string;
  lastAccessed: string;
  progress: number; // 0-100
  currentPage?: number;
  totalPages?: number;
  onPress?: () => void;
}

export function ContinueLearningCard({
  image,
  title,
  lastAccessed,
  progress,
  currentPage,
  totalPages,
  onPress,
}: ContinueLearningCardProps) {
  const colors = Colors.light;

  // Circular progress calculation
  const size = 56;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: '#37D644FF',
          ...Shadows.sm,
        },
      ]}
    >
      <View style={styles.leftContent}>
        <Image source={image} style={styles.icon} contentFit="cover" />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{lastAccessed}</Text>
        </View>
      </View>

      {/* Circular Progress */}
      <View style={styles.progressCircle}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.borderLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.progressTextContainer}>
          <Text style={[styles.progressText, { color: colors.primary }]}>{progress}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.xl,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#F3F4F6',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: Typography.fontSize.base * 1.3,
  },
  meta: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  progressCircle: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
