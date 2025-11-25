import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import React, { forwardRef, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Image } from 'expo-image';

interface PersonalizationCardProps {
  onPress?: () => void;
  style?: ViewStyle;
  showIndicator?: boolean;
}

export const PersonalizationCard = forwardRef<View, PersonalizationCardProps>(
  ({ onPress, style, showIndicator = false }, ref) => {
    const colors = Colors.light;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulse animation for indicator
    useEffect(() => {
      if (showIndicator) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }, [showIndicator, pulseAnim]);

    return (
      <Animated.View
        style={[
          showIndicator && {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          ref={ref}
          style={[
            styles.container,
            {
              backgroundColor: colors.secondary,
              ...Shadows.sm,
            },
            showIndicator && styles.containerHighlight,
            style,
          ]}
          activeOpacity={0.85}
          onPress={onPress}
        >
          {/* "Start Here" Badge for First-Time Users */}
          {showIndicator && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>👉 Start Here!</Text>
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Personalize Your Reading Level</Text>
              <Text style={styles.subtitle}>Choose how you want to read research</Text>
            </View>
            <View>
              <Image
                source={require('@/assets/images/icon-tab/klik-personalize.png')}
                style={{ width: 50, height: 50 }}
                contentFit="contain"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'visible',
  },
  containerHighlight: {
    borderWidth: 3,
    borderColor: '#FFC107',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 12,
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
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
});
