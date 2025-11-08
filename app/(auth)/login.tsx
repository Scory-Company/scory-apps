import { Colors, Spacing } from '@/constants/theme';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { Button } from '@/shared/components/ui/Button';
import { Body, Heading } from '@/shared/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

type AuthMode = 'login' | 'register';

export default function LoginScreen() {
  const router = useRouter();
  const colors = Colors.light;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const handleLogin = (email: string, password: string, rememberMe: boolean) => {
    // TODO: Implement login logic
    console.log('Login:', { email, password, rememberMe });
    router.replace('/(tabs)');
  };

  const handleRegister = (name: string, email: string, password: string) => {
    // TODO: Implement register logic
    console.log('Register:', { name, email, password });
    router.replace('/(tabs)');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign in logic
    console.log('Google sign in');
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
        <Button variant="google" size="md" fullWidth onPress={handleGoogleSignIn}>
          <View style={styles.googleButtonContent}>
            <Ionicons name="logo-google" size={20} color={colors.text} />
            <Body>Continue with Google</Body>
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
