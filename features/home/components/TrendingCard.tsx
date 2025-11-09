import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Image, ImageSource } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TrendingCardProps {
  image: ImageSource;
  title: string;
  author: string;
  rating?: number;
  difficulty?: 'Mudah' | 'Sedang' | 'Sulit';
  source?: 'Scopus' | 'Sinta 1' | 'Sinta 2' | 'Sinta 3' | 'Sinta 4' | 'WoS' | 'IEEE';
  onPress?: () => void;
}

export function TrendingCard({
  image,
  title,
  author,
  rating,  
  difficulty,
  source,
  onPress,
}: TrendingCardProps) {
  const colors = Colors.light;

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Mudah':
        return colors.success;
      case 'Sedang':
        return colors.warning;
      case 'Sulit':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getSourceColor = () => {
    if (source?.includes('Scopus') || source === 'WoS') return '#1E88E5'; // Blue
    if (source?.includes('Sinta')) return '#43A047'; // Green
    if (source === 'IEEE') return '#00629B'; // IEEE Blue
    return colors.primary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          ...Shadows.md,
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image source={image} style={styles.image} contentFit="cover" />
      <View style={styles.overlay}>
        {source && (
          <View style={[styles.badge, styles.sourceBadge, { backgroundColor: getSourceColor() }]}>
            <Text style={styles.badgeText}>{source}</Text>
          </View>
        )}
        {difficulty && (
          <View style={[styles.badge, { backgroundColor: getDifficultyColor() }]}>
            <Text style={styles.badgeText}>{difficulty}</Text>
          </View>
        )}
      </View>

      {typeof rating === 'number' && (
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {author}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  overlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'column',
    gap: Spacing.xs,
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.sm,
  },
  sourceBadge: {
    paddingHorizontal: Spacing.md,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    padding: Spacing.md,
    minHeight: 90,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
    lineHeight: Typography.fontSize.base * 1.3,
    maxHeight: Typography.fontSize.base * 1.3 * 2, 
  },
  meta: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  ratingBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.light.textwhite,
  },
});
