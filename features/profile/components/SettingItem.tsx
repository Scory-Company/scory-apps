import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SettingItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  showBorder?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  label,
  icon,
  onPress,
  showBorder = false,
}) => {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        showBorder && {
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
      ]}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <Text style={[styles.settingItemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingItemLabel: {
    fontSize: Typography.fontSize.base,
  },
});