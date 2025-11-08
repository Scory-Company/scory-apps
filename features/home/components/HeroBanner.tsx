import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

interface HeroBannerProps {
  badge?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  onPress?: () => void;
}

export function HeroBanner({
  badge = '✨ Pilihan Editor',
  title,
  subtitle,
}: HeroBannerProps) {

  return (
    <View style={[styles.container, Shadows.lg]}>
      <ImageBackground
        source={require('@/assets/images/element/card-hero.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    height: 160,
  },
  backgroundImage: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 160,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  ctaContainer: {
    gap: Spacing.sm,
  },
  cta: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
});
