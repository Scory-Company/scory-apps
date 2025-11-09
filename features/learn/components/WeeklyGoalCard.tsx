import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from './ProgressBar';

interface WeeklyGoalCardProps {
  completed: number;
  target: number;
  daysLeft: number;
  onContinuePress?: () => void;
  onSetGoalPress?: () => void;
}

export const WeeklyGoalCard: React.FC<WeeklyGoalCardProps> = ({
  completed,
  target,
  daysLeft,
  onContinuePress,
  onSetGoalPress,
}) => {
  const colors = Colors.light;

  // Determine states
  const hasGoal = target > 0;
  const isNotStarted = completed === 0;

  // Determine button config
  let buttonText = 'Set Goal';
  let buttonIcon: keyof typeof Ionicons.glyphMap = 'settings-outline';
  let buttonAction = onSetGoalPress;

  if (hasGoal && isNotStarted) {
    buttonText = 'Start Reading';
    buttonIcon = 'book-outline';
    buttonAction = onContinuePress;
  } else if (hasGoal && !isNotStarted) {
    buttonText = 'Continue Reading';
    buttonIcon = 'arrow-forward';
    buttonAction = onContinuePress;
  }

  // Determine title text
  const titleText = hasGoal
    ? `${completed} of ${target} articles completed`
    : 'Set your weekly reading goal';

  return (
    <View style={[styles.goalCard, Shadows.md, { backgroundColor: colors.surface }]}>
      <View style={styles.goalHeader}>
        <Text style={[styles.goalTitle, { color: hasGoal ? colors.text : colors.textSecondary }]}>
          {titleText}
        </Text>
        {hasGoal && (
          <Text style={[styles.goalDays, { color: colors.textSecondary }]}>
            {daysLeft} days left
          </Text>
        )}
      </View>

      <ProgressBar current={completed} total={hasGoal ? target : 5} />

      {!hasGoal && (
        <View style={styles.motivationBadge}>
          <Ionicons name="bulb-outline" size={16} color={colors.warning} />
          <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
            Challenge yourself! Set a realistic weekly target
          </Text>
        </View>
      )}

      {hasGoal && isNotStarted && (
        <View style={styles.motivationBadge}>
          <Ionicons name="rocket-outline" size={16} color={colors.primary} />
          <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
            Start your reading journey this week!
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.goalButton}
        activeOpacity={0.8}
        onPress={buttonAction}
      >
        <LinearGradient
          colors={[colors.primary, colors.success, colors.third]}
          start={{ x: 2, y: 0 }}
          end={{ x: 0, y: 2 }}
          style={styles.gradientButton}
        >
          <View style={styles.shimmerOverlay} />
          <Text style={[styles.goalButtonText, { color: colors.textwhite }]}>
            {buttonText}
          </Text>
          <Ionicons name={buttonIcon} size={16} color={colors.textwhite} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  goalHeader: {
    marginBottom: Spacing.md,
  },
  goalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  goalDays: {
    fontSize: Typography.fontSize.sm,
  },
  goalButton: {
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ skewX: '-20deg' }],
  },
  goalButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  motivationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  motivationText: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
});