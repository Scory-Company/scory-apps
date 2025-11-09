import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TrendingTopicCardProps {
  keyword: string;
  count: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  gradientColors?: [string, string, ...string[]];
}

export const TrendingTopicCard: React.FC<TrendingTopicCardProps> = ({
  keyword,
  count,
  onPress,
  icon = 'flash',
  gradientColors = ['#667eea', '#764ba2'],
}) => {
  return (
    <TouchableOpacity
      style={[styles.trendingCard, Shadows.md]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.overlay} />

        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={32} color="rgba(255, 255, 255, 0.9)" />
        </View>

        <Text style={styles.trendingKeyword}>{keyword}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.trendingCount}>{count}</Text>
          <View style={styles.iconCircle}>
            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.9)" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  trendingCard: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    minHeight: 150,
    width: '48%',
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
    minHeight: 150,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  iconContainer: {
    marginBottom: Spacing.xs,
  },
  trendingKeyword: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  trendingCount: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});