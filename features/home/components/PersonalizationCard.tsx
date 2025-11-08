import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PersonalizationCardProps {
  onPress?: () => void;
}

export function PersonalizationCard({ onPress }: PersonalizationCardProps) {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.text,
          ...Shadows.sm,
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Personalize Journal Recommendations</Text>
          <Text style={styles.subtitle}>Choose your interests for better results</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
  },
});
