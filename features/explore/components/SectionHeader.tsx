import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onViewAllPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  iconColor,
  onViewAllPress,
}) => {
  const colors = Colors.light;

  return (
    <View style={styles.sectionHeaderContainer}>
      <View style={styles.sectionTitleWithIcon}>
        {icon && <Ionicons name={icon} size={20} color={iconColor || colors.primary} />}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {onViewAllPress && (
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});
