import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LogoutButtonProps {
  onPress?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onPress }) => {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.error }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name="log-out-outline" size={20} color={colors.error} />
      <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  logoutText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});