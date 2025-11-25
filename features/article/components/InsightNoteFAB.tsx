import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface InsightNoteFABProps {
  articleTitle: string;
  onSaveNote: (note: string) => void;
}

export const InsightNoteFAB: React.FC<InsightNoteFABProps> = ({ articleTitle, onSaveNote }) => {
  const colors = Colors.light;
  const [modalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (note.trim()) {
      onSaveNote(note.trim());
      setNote('');
      setModalVisible(false);
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
        <Ionicons name="bulb-outline" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
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
                      { backgroundColor: note.trim() ? colors.primary : colors.border },
                    ]}
                    onPress={handleSave}
                    disabled={!note.trim()}
                  >
                    <Ionicons name="checkmark" size={18} color={colors.text} />
                    <Text style={[styles.saveButtonText, { color: colors.text }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
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
    minHeight: 120,
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
