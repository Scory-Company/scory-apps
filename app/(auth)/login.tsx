import { Colors, Spacing } from '@/constants/theme';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { Button } from '@/shared/components/ui/Button';
import { Body, Heading } from '@/shared/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { loginWithEmail, registerWithEmail } from '@/services/auth';
import { signInWithGoogle } from '@/services/googleAuth';
import { useToast } from '@/features/shared/hooks/useToast';

type AuthMode = 'login' | 'register';

export default function LoginScreen() {
  const router = useRouter();
  const colors = Colors.light;
  const toast = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (email: string, password: string, _rememberMe: boolean) => {
    setAuthLoading(true);
    try {
      await loginWithEmail(email, password);
      closeAuthModal();
      toast.success('Login successful!');
      router.replace('/(tabs)');
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setAuthLoading(true);
    try {
      await registerWithEmail(email, password, name);
      closeAuthModal();
      toast.success('Account created successfully!');
      router.replace('/(tabs)');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Google Sign In successful!');
      router.replace('/(tabs)');
    } catch (error: any) {
      toast.error(error.message || 'Google Sign In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <Image
          source={require('@/assets/images/onboarding/logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Heading size="3xl" align="center">
          Welcome to Scory
        </Heading>
        <Body size="base" align="center" style={styles.heroDescription}>
          Manage your tasks and boost your productivity
        </Body>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaSection}>
        {/* Email Sign In */}
        <Button variant="primary" size="md" fullWidth onPress={() => openAuthModal('login')}>
          Sign In with Email
        </Button>
        <Button variant="secondary" size="md" fullWidth onPress={() => openAuthModal('register')}>
          Create Account
        </Button>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Body size="sm" color={colors.textSecondary}>
            or continue with
          </Body>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Google Sign In */}
        <Button
          variant="google"
          size="md"
          fullWidth
          onPress={handleGoogleSignIn}
          disabled={googleLoading}
        >
          <View style={styles.googleButtonContent}>
            <Ionicons name="logo-google" size={20} color={colors.text} />
            <Body>{googleLoading ? 'Signing in...' : 'Continue with Google'}</Body>
          </View>
        </Button>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        mode={authMode}
        onClose={closeAuthModal}
        onSwitchMode={switchAuthMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Toast Component */}
      <toast.ToastComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  logoSection: {
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
  },
  logo: {
    width: 120,
    height: 52,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['2xl'],
  },
  heroDescription: {
    lineHeight: 24,
  },
  ctaSection: {
    gap: Spacing.md,
    paddingBottom: Spacing['3xl'],
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
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
