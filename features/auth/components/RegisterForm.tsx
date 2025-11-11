import { Colors, Spacing } from '@/constants/theme';
import { Button, ButtonLink } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Body } from '@/shared/components/ui/Typography';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSubmit, onSwitchToLogin }: RegisterFormProps) {
  const colors = Colors.light;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    // TODO: Add validation
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSubmit(name, email, password);
  };

  return (
    <View style={styles.formSection}>
      {/* Name Input */}
      <Input
        label="Full Name"
        icon="person-outline"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

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
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        isPassword
      />

      {/* Confirm Password Input */}
      <Input
        label="Confirm Password"
        icon="lock-closed-outline"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
      />

      {/* Sign Up Button */}
      <Button variant="primary" size="lg" fullWidth onPress={handleSubmit}>
        Create Account
      </Button>

      {/* Switch to Login */}
      <View style={styles.switchAuth}>
        <Body size="sm" color={colors.textSecondary}>
          Already have an account?{' '}
        </Body>
        <ButtonLink onPress={onSwitchToLogin}>
          <Body size="sm" color={colors.primary} weight="semiBold">
            Sign In
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
  switchAuth: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
