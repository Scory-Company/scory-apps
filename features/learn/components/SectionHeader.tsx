import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SectionHeaderProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onViewAllPress?: () => void;
  showViewAll?: boolean;
  onAddPress?: () => void;
  showAddButton?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  iconColor,
  onViewAllPress,
  showViewAll = true,
  onAddPress,
  showAddButton = false,
}) => {
  const { t } = useTranslation();
  const colors = Colors.light;

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={20} color={iconColor || colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.actionsRow}>
        {showAddButton && (
          <TouchableOpacity
            onPress={onAddPress}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
        )}
        {showViewAll && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAllText, { color: colors.textMuted }]}>{t('learn.components.sectionHeader.viewAll')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});