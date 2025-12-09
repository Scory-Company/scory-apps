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
  Alert,
} from 'react-native';
import { BottomSheetModal, Toast } from '@/features/shared/components';
import { standaloneNotesApi } from '@/services';

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onNoteAdded?: () => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ visible, onClose, onNoteAdded }) => {
  const colors = Colors.light;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setTitle('');
      setContent('');
    }
  }, [visible]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter your note content');
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
        setToastType('success');
        setToastMessage('Note saved successfully!');
        setToastVisible(true);

        // Trigger refresh
        if (onNoteAdded) {
          console.log('[ADD_NOTE_MODAL] Triggering refresh...');
          onNoteAdded();
        }
      } else {
        console.log('[ADD_NOTE_MODAL] ❌ Save failed:', response.message);
        setToastType('error');
        setToastMessage(response.message || 'Failed to save note');
        setToastVisible(true);
      }
    } catch (error: any) {
      console.error('[ADD_NOTE_MODAL] ❌ Error saving note:', error);
      console.error('[ADD_NOTE_MODAL] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      setToastType('error');

      // Better error messages
      let errorMsg = 'Failed to save note';
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Server is taking too long to respond.';
      } else if (error.message === 'Network Error') {
        errorMsg = 'Backend is slow or not responding. Please try again.';
      } else if (error.response?.status === 404) {
        errorMsg = 'Endpoint not found. Backend may not be running.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setToastMessage(errorMsg);
      setToastVisible(true);
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Learning Note</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <Text style={[styles.label, { color: colors.text }]}>Title (Optional)</Text>
          <TextInput
            style={[
              styles.titleInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="e.g., My Learning Note"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
          />

          {/* Content Input */}
          <Text style={[styles.label, { color: colors.text }]}>Your Note</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="What did you learn today? Write your thoughts here..."
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
                Cancel
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
                  <Text style={[styles.saveButtonText, { color: colors.text }]}>Saving...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={colors.text} />
                  <Text style={[styles.saveButtonText, { color: colors.text }]}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>

      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        position="top"
        duration={3000}
        onHide={() => setToastVisible(false)}
      />
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
