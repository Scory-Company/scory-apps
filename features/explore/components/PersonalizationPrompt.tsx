import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface PersonalizationPromptProps {
  onSetupPress?: () => void;
}

export const PersonalizationPrompt: React.FC<PersonalizationPromptProps> = ({ onSetupPress }) => {
  const colors = Colors.light;

  return (
    <View style={[styles.wrapper, Shadows.md]}>
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
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
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
