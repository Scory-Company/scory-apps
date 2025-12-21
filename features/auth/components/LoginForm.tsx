import { Colors, Spacing } from '@/constants/theme';
import { Button, ButtonLink } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Body } from '@/shared/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => void;
  onSwitchToRegister: () => void;
  onGoogleSignIn?: () => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, onSwitchToRegister, onGoogleSignIn, isLoading = false }: LoginFormProps) {
  const { t } = useTranslation();
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
        label={t('auth.email')}
        icon="mail-outline"
        placeholder={t('auth.enterEmail')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <Input
        label={t('auth.password')}
        icon="lock-closed-outline"
        placeholder={t('auth.enterPassword')}
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
        <ButtonLink onPress={() => {/* TODO: Implement forgot password */}}>
          <Body size="sm" color={colors.primary}>
            {t('auth.forgotPassword')}
          </Body>
        </ButtonLink>
      </View>

      {/* Sign In Button */}
      <Button variant="primary" size="lg" fullWidth onPress={handleSubmit} loading={isLoading} disabled={isLoading}>
        {t('auth.login')}
      </Button>

      {/* Switch to Register */}
      <View style={styles.switchAuth}>
        <Body size="sm" color={colors.textSecondary}>
          {t('auth.noAccount')}{' '}
        </Body>
        <ButtonLink onPress={onSwitchToRegister}>
          <Body size="sm" color={colors.primary} weight="semiBold">
            {t('auth.register')}
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  switchAuth: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
