import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SettingItem } from './SettingItem';
import { useTranslation } from 'react-i18next';

interface SettingItemData {
  id: number;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

interface SettingGroupProps {
  titleKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: SettingItemData[];
}

export const SettingGroup: React.FC<SettingGroupProps> = ({ titleKey, icon, items }) => {
  const { t } = useTranslation();
  const colors = Colors.light;

  return (
    <View style={styles.settingGroup}>
      <View style={styles.settingGroupHeader}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <Text style={[styles.settingGroupTitle, { color: colors.text }]}>{t(titleKey)}</Text>
      </View>

      <View style={[styles.settingGroupContent, { backgroundColor: colors.surface }]}>
        {items.map((item, index) => (
          <SettingItem
            key={item.id}
            labelKey={item.labelKey}
            icon={item.icon}
            onPress={item.onPress}
            showBorder={index !== items.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settingGroup: {
    marginBottom: Spacing.lg,
  },
  settingGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  settingGroupTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  settingGroupContent: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
});