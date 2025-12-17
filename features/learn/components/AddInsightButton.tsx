import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface AddInsightButtonProps {
  onPress?: () => void;
}

export const AddInsightButton: React.FC<AddInsightButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[styles.addInsightButton, { borderColor: colors.border }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name="add-circle-outline" size={24} color={colors.third} />
      <Text style={[styles.addInsightText, { color: colors.third }]}>{t('learn.components.addInsightButton')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addInsightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    borderStyle: 'dashed',
    gap: Spacing.xs,
  },
  addInsightText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
  },
});
