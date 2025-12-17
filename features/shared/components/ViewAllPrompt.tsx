import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ViewAllPromptProps {
  count: number;
  label?: string;
  onPress?: () => void;
}

export const ViewAllPrompt: React.FC<ViewAllPromptProps> = ({
  count,
  label = 'item',
  onPress
}) => {
  const { t } = useTranslation();
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons name="arrow-forward-circle-outline" size={20} color={colors.textMuted} />
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {t('learn.components.viewAllPrompt', { count, label })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  text: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});
