import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { BottomSheetModal } from '@/features/shared/components';
import { standaloneNotesApi } from '@/services';
import { useToast } from '@/features/shared/hooks/useToast';
import { useTranslation } from 'react-i18next';

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onNoteAdded?: () => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ visible, onClose, onNoteAdded }) => {
  const { t } = useTranslation();
  const colors = Colors.light;
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setTitle('');
      setContent('');
    }
  }, [visible]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error(t('learn.components.addNoteModal.validation.emptyContent'), 2500);
      return;
    }

    console.log('[ADD_NOTE_MODAL] Starting save...');
    console.log('[ADD_NOTE_MODAL] Title:', title.trim() || '(empty)');
    console.log('[ADD_NOTE_MODAL] Content length:', content.trim().length);

    setIsSaving(true);

    try {
      console.log('[ADD_NOTE_MODAL] Calling API...');
      const startTime = Date.now();

      const response = await standaloneNotesApi.createStandaloneNote(
        title.trim() || undefined,
        content.trim()
      );

      const endTime = Date.now();
      console.log('[ADD_NOTE_MODAL] API response received in', endTime - startTime, 'ms');
      console.log('[ADD_NOTE_MODAL] Response:', response);

      if (response.success) {
        console.log('[ADD_NOTE_MODAL] ✅ Save successful!');
        setTitle('');
        setContent('');
        onClose();

        // Show success toast
        toast.success(t('learn.components.addNoteModal.success'), 2500);

        // Trigger refresh
        if (onNoteAdded) {
          console.log('[ADD_NOTE_MODAL] Triggering refresh...');
          onNoteAdded();
        }
      } else {
        console.log('[ADD_NOTE_MODAL] ❌ Save failed:', response.message);
        toast.error(response.message || t('learn.components.addNoteModal.errors.failed'), 3000);
      }
    } catch (error: any) {
      console.error('[ADD_NOTE_MODAL] ❌ Error saving note:', error);
      console.error('[ADD_NOTE_MODAL] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Better error messages
      let errorMsg = t('learn.components.addNoteModal.errors.failed');
      if (error.code === 'ECONNABORTED') {
        errorMsg = t('learn.components.addNoteModal.errors.timeout');
      } else if (error.message === 'Network Error') {
        errorMsg = t('learn.components.addNoteModal.errors.network');
      } else if (error.response?.status === 404) {
        errorMsg = t('learn.components.addNoteModal.errors.notFound');
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg, 3000);
    } finally {
      setIsSaving(false);
      console.log('[ADD_NOTE_MODAL] Save process completed');
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <>
      <BottomSheetModal
        visible={visible}
        onClose={handleClose}
        height="75%"
        showHandle={true}
        enableSwipeToDismiss={true}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('learn.components.addNoteModal.title')}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <Text style={[styles.label, { color: colors.text }]}>{t('learn.components.addNoteModal.titleLabel')}</Text>
          <TextInput
            style={[
              styles.titleInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder={t('learn.components.addNoteModal.titlePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
          />

          {/* Content Input */}
          <Text style={[styles.label, { color: colors.text }]}>{t('learn.components.addNoteModal.contentLabel')}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder={t('learn.components.addNoteModal.contentPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                {t('learn.components.addNoteModal.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: content.trim() ? colors.primary : colors.border,
                  opacity: isSaving ? 0.5 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={!content.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color={colors.text} />
                  <Text style={[styles.saveButtonText, { color: colors.text }]}>{t('learn.components.addNoteModal.saving')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={colors.text} />
                  <Text style={[styles.saveButtonText, { color: colors.text }]}>{t('learn.components.addNoteModal.save')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>

      {/* Toast Notifications */}
      <toast.ToastComponent />
    </>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 150,
    maxHeight: 300,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});
