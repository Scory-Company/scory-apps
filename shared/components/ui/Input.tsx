import { Colors, Spacing } from '@/constants/theme';
import { Body } from '@/shared/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, icon, error, isPassword, style, ...props }: InputProps) {
  const colors = Colors.light;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputGroup}>
      {label && <Body style={styles.label}>{label}</Body>}
      <View style={[styles.inputContainer, { borderColor: error ? colors.error : colors.border }]}>
        {icon && <Ionicons name={icon} size={20} color={colors.textSecondary} />}
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Body size="sm" color={colors.error}>
          {error}
        </Body>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
