import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  const colors = Colors.light;

  return (
    <View style={[styles.chip, { backgroundColor: colors.surfaceSecondary }]}>
      <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Ionicons name="close" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.xs,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
});
