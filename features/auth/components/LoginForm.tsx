import { Colors, Spacing } from '@/constants/theme';
import { Button, ButtonLink } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Body } from '@/shared/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSubmit, onSwitchToRegister }: LoginFormProps) {
  const colors = Colors.light;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = () => {
    onSubmit(email, password, rememberMe);
  };

  return (
    <View style={styles.formSection}>
      {/* Email Input */}
      <Input
        label="Email"
        icon="mail-outline"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <Input
        label="Password"
        icon="lock-closed-outline"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        isPassword
      />

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionsRow}>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
          <View
            style={[
              styles.checkbox,
              { borderColor: colors.border },
              rememberMe && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Body size="sm">Remember me</Body>
        </TouchableOpacity>
        <ButtonLink onPress={() => console.log('Forgot password')}>
          <Body size="sm" color={colors.primary}>
            Forgot Password?
          </Body>
        </ButtonLink>
      </View>

      {/* Sign In Button */}
      <Button variant="primary" size="lg" fullWidth onPress={handleSubmit}>
        Sign In
      </Button>

      {/* Switch to Register */}
      <View style={styles.switchAuth}>
        <Body size="sm" color={colors.textSecondary}>
          Don&apos;t have an account?{' '}
        </Body>
        <ButtonLink onPress={onSwitchToRegister}>
          <Body size="sm" color={colors.primary} weight="semibold">
            Sign Up
          </Body>
        </ButtonLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: Spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchAuth: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
