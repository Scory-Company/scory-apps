import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useInsights } from '@/hooks/useInsights';
import { BottomSheetModal, Toast } from '@/features/shared/components';

interface InsightNoteFABProps {
  articleSlug: string;
  articleTitle: string;
  onSaveNote: (note: string) => void;
}

export const InsightNoteFAB: React.FC<InsightNoteFABProps> = ({
  articleSlug,
  articleTitle,
  onSaveNote,
}) => {
  const colors = Colors.light;
  const [modalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Use insights hook for saving
  const { saveNote: saveNoteApi, isSavingNote } = useInsights(articleSlug);

  const handleSave = async () => {
    if (!note.trim()) return;

    // Save to API (custom note = true)
    const success = await saveNoteApi(note.trim(), true);

    if (success) {
      onSaveNote(note.trim());
      setNote('');
      setModalVisible(false);

      // Show success toast
      setToastType('success');
      setToastMessage('Note saved successfully!');
      setToastVisible(true);
    } else {
      // Show error toast
      setToastType('error');
      setToastMessage('Failed to save note. Please try again.');
      setToastVisible(true);
    }
  };

  const handleClose = () => {
    setNote('');
    setModalVisible(false);
  };

  return (
    <>
      {/* FAB Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={28} color={colors.text} />
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={handleClose}
        height="75%"
        showHandle={true}
        enableSwipeToDismiss={true}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Insight Note</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Article Reference */}
          <View style={[styles.articleRef, { backgroundColor: colors.surface }]}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <Text
              style={[styles.articleRefText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {articleTitle}
            </Text>
          </View>

          {/* Note Input */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="What insight did you get from this article?"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            value={note}
            onChangeText={setNote}
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
                  backgroundColor: note.trim() ? colors.primary : colors.border,
                  opacity: isSavingNote ? 0.5 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={!note.trim() || isSavingNote}
            >
              {isSavingNote ? (
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
        id={`insight-toast-${Date.now()}`}
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
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
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
  articleRef: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  articleRefText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 200,
    maxHeight: 400,
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
