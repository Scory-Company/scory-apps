import { Colors, Radius, Spacing } from '@/constants/theme';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Body, Heading } from '@/shared/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { fullName: string; nickname: string; avatarUrl: string }) => Promise<void>;
  initialData?: {
    fullName: string;
    nickname: string;
    avatarUrl: string;
  };
}

export function EditProfileModal({
  visible,
  onClose,
  onSave,
  initialData,
}: EditProfileModalProps) {
  const colors = Colors.light;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setNickname(initialData.nickname || '');
      setAvatarUrl(initialData.avatarUrl || '');
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    // Validation
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (nickname.trim() && (nickname.length < 2 || nickname.length > 20)) {
      setError('Nickname must be between 2-20 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        fullName: fullName.trim(),
        nickname: nickname.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="person-circle" size={24} color={colors.primary} />
              <Heading size="lg">Edit Profile</Heading>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Error Message */}
            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Body size="sm" color={colors.error}>
                  {error}
                </Body>
              </View>
            )}

            {/* Full Name Input */}
            <Input
              label="Full Name"
              icon="person"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!loading}
            />

            {/* Nickname Input */}
            <Input
              label="Nickname (optional)"
              icon="at"
              placeholder="Enter your nickname"
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
              editable={!loading}
            />

            {/* Avatar URL Input */}
            <Input
              label="Avatar URL (optional)"
              icon="image"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              autoCapitalize="none"
              keyboardType="url"
              editable={!loading}
            />

            {/* Info Text */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color={colors.info} />
              <Body size="xs" color={colors.textMuted} style={styles.infoText}>
                Nickname will be displayed publicly. Avatar URL should be a direct link to an
                image.
              </Body>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <View style={styles.buttonRow}>
              <View style={styles.buttonHalf}>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onPress={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </View>
              <View style={styles.buttonHalf}>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textwhite} size="small" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  formContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  buttonHalf: {
    flex: 1,
  },
});
