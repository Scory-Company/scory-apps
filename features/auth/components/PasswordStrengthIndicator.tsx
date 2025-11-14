import { Colors, Spacing } from '@/constants/theme';
import { Body } from '@/shared/components/ui/Typography';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PasswordStrength } from '../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showFeedback?: boolean;
}

export function PasswordStrengthIndicator({
  strength,
  showFeedback = true,
}: PasswordStrengthIndicatorProps) {
  const { t } = useTranslation();
  const colors = Colors.light;

  return (
    <View style={styles.container}>
      {/* Strength Bar */}
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            {
              width: `${(strength.score / 4) * 100}%` as any,
              backgroundColor: strength.color,
            },
          ]}
        />
      </View>

      {/* Strength Label */}
      <View style={styles.labelContainer}>
        <Body size="xs" color={strength.color} weight="medium">
          {t(`auth.passwordStrength.${strength.labelKey}`)}
        </Body>
      </View>

      {/* Feedback Messages */}
      {showFeedback && strength.feedbackKeys.length > 0 && (
        <View style={styles.feedbackContainer}>
          {strength.feedbackKeys.map((feedbackKey, index) => (
            <View key={index} style={styles.feedbackItem}>
              <Body size="xs" color={colors.textSecondary}>
                • {t(feedbackKey)}
              </Body>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  barContainer: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  feedbackContainer: {
    gap: Spacing.xxs,
    marginTop: Spacing.xxs,
  },
  feedbackItem: {
    flexDirection: 'row',
  },
});
