import { Colors, Spacing } from '@/constants/theme';
import { Button, ButtonLink } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Body } from '@/shared/components/ui/Typography';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import {
  calculatePasswordStrength,
  isPasswordStrong,
} from '../utils/passwordValidation';

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => void;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, onSwitchToLogin, isLoading = false }: RegisterFormProps) {
  const { t } = useTranslation();
  const colors = Colors.light;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Calculate password strength in real-time
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  // Check if passwords match
  const passwordsMatch = password === confirmPassword;
  const showPasswordMismatch = confirmPassword.length > 0 && !passwordsMatch;

  // Validation state
  const isPasswordValid = isPasswordStrong(password);
  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    isPasswordValid &&
    passwordsMatch &&
    confirmPassword.length > 0;

  const handleSubmit = () => {
    if (!isFormValid) {
      if (!isPasswordValid) {
        alert(t('auth.weakPassword'));
      } else if (!passwordsMatch) {
        alert(t('auth.passwordsNotMatch'));
      }
      return;
    }
    onSubmit(name, email, password);
  };

  return (
    <View style={styles.formSection}>
      {/* Name Input */}
      <Input
        label={t('auth.fullName')}
        icon="person-outline"
        placeholder={t('auth.enterName')}
        value={name}
        onChangeText={setName}
      />

      {/* Email Input */}
      <Input
        label={t('auth.email')}
        icon="mail-outline"
        placeholder={t('auth.enterEmail')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <View>
        <Input
          label={t('auth.password')}
          icon="lock-closed-outline"
          placeholder={t('auth.createPassword')}
          value={password}
          onChangeText={setPassword}
          isPassword
        />
        {password.length > 0 && (
          <View style={styles.strengthIndicator}>
            <PasswordStrengthIndicator strength={passwordStrength} />
          </View>
        )}
      </View>

      {/* Confirm Password Input */}
      <View>
        <Input
          label={t('auth.confirmPassword')}
          icon="lock-closed-outline"
          placeholder={t('auth.confirmYourPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
        />
        {showPasswordMismatch && (
          <View style={styles.errorMessage}>
            <Body size="xs" color={colors.error}>
              {t('auth.passwordsNotMatch')}
            </Body>
          </View>
        )}
      </View>

      {/* Sign Up Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleSubmit}
        disabled={!isFormValid || isLoading}
        loading={isLoading}
      >
        {t('auth.createAccount')}
      </Button>

      {/* Switch to Login */}
      <View style={styles.switchAuth}>
        <Body size="sm" color={colors.textSecondary}>
          {t('auth.haveAccount')}{' '}
        </Body>
        <ButtonLink onPress={onSwitchToLogin}>
          <Body size="sm" color={colors.primary} weight="semiBold">
            {t('auth.login')}
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
  strengthIndicator: {
    marginTop: Spacing.sm,
  },
  errorMessage: {
    marginTop: Spacing.xs,
  },
});
