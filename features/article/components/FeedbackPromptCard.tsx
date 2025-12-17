import { Colors, Radius, Spacing, Typography, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface FeedbackPromptCardProps {
  onPress: () => void;
  visible: boolean; // Hide if user already gave feedback
}

export const FeedbackPromptCard: React.FC<FeedbackPromptCardProps> = ({
  onPress,
  visible,
}) => {
  const colors = Colors.light;

  if (!visible) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          Share your feedback
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Help us improve your experience
        </Text>
      </View>

      {/* CTA Button */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.ctaButton,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.ctaText, { color: colors.textwhite }]}>
          Give Feedback
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={colors.textwhite}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,

    borderRadius: Radius.xl,
    borderWidth: 1,

    ...Shadows.sm,
  },

  textContainer: {
    marginBottom: Spacing.md,
  },

  title: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },

  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.fontSize.sm * 1.5,
  },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,

    borderRadius: Radius.full,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },

  ctaText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
});
