import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';

interface PersonalizationPromptProps {
  onSetupPress?: () => void;
  showIndicator?: boolean;
}

export const PersonalizationPrompt: React.FC<PersonalizationPromptProps> = ({
  onSetupPress,
  showIndicator = false
}) => {
  const colors = Colors.light;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      <View style={[styles.wrapper, Shadows.md, showIndicator && styles.wrapperHighlight]}>
        {showIndicator && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>👉 Start Here!</Text>
          </View>
        )}
        <View style={styles.container}>
        {/* Dot Pattern Overlay */}
        <View style={styles.dotPattern} />

        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <Image
            source={require('@/assets/images/icon-categories/icon-personalize.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <Text style={styles.title}>
          Personalize Your Feed
        </Text>
        <Text style={styles.message}>
          Set your interests to get article recommendations tailored for you
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={onSetupPress}
        >
          <Text style={[styles.buttonText, { color: colors.primaryDark }]}>
            Get Started
          </Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  wrapperHighlight: {
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
    top: 12,
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
  container: {
    backgroundColor: '#1A1A1A',
    padding: Spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  dotPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    color: '#FFFFFF',
  },
  message: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
    maxWidth: 260,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  buttonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});
