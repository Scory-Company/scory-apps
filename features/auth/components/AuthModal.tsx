import { Colors, Spacing } from '@/constants/theme';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { BottomSheetModal } from '@/features/shared/components/BottomSheetModal';
import { Title } from '@/shared/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  visible: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: () => void;
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  onRegister: (name: string, email: string, password: string) => void;
}

export function AuthModal({
  visible,
  mode,
  onClose,
  onSwitchMode,
  onLogin,
  onRegister,
}: AuthModalProps) {
  const { t } = useTranslation();
  const colors = Colors.light;

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <ScrollView
        style={styles.modalContent}
        contentContainerStyle={styles.modalScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Title>{mode === 'login' ? t('auth.login') : t('auth.createAccount')}</Title>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Auth Form */}
        {mode === 'login' ? (
          <LoginForm onSubmit={onLogin} onSwitchToRegister={onSwitchMode} />
        ) : (
          <RegisterForm onSubmit={onRegister} onSwitchToLogin={onSwitchMode} />
        )}
      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    maxHeight: '100%',
  },
  modalScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  closeButton: {
    padding: Spacing.xs,
  },
});
