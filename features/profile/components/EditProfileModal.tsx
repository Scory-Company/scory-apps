import { Colors, Radius, Spacing } from "@/constants/theme";
import { BottomSheetModal } from "@/features/shared/components/BottomSheetModal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Body, Heading } from "@/shared/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from 'react-i18next';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    fullName: string;
    nickname: string;
    avatarUrl: string;
  }) => Promise<void>;
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
  const { t } = useTranslation();

  // Form state
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || "");
      setNickname(initialData.nickname || "");
      setAvatarUrl(initialData.avatarUrl || "");
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError(t('profile.form.fullNameRequired'));
      return;
    }

    if (nickname.trim() && (nickname.length < 2 || nickname.length > 20)) {
      setError(t('profile.form.nicknameLength'));
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
      setError(err.message || t('profile.form.updateError'));
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
    <BottomSheetModal visible={visible} onClose={handleClose} height="70%">
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="person-circle" size={24} color={colors.primary} />
            <Heading size="lg">{t('profile.menu.editProfile')}</Heading>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            disabled={loading}
            style={styles.closeButton}
          >
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
            <View
              style={[
                styles.errorBox,
                { backgroundColor: colors.error + "15" },
              ]}
            >
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Body size="sm" color={colors.error}>
                {error}
              </Body>
            </View>
          )}

          {/* Full Name Input */}
          <Input
            label={t('profile.form.fullName')}
            icon="person"
            placeholder={t('profile.form.fullNamePlaceholder')}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            editable={!loading}
          />

          {/* Nickname Input */}
          <Input
            label={t('profile.form.nickname')}
            icon="at"
            placeholder={t('profile.form.nicknamePlaceholder')}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Avatar URL Input */}
          {/* <Input
            label={t('profile.form.avatarUrl')}
            icon="image"
            placeholder={t('profile.form.avatarUrlPlaceholder')}
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            autoCapitalize="none"
            keyboardType="url"
            editable={!loading}
          /> */}

          {/* Info Text */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color={colors.info} />
            <Body size="xs" color={colors.textMuted} style={styles.infoText}>
              {t('profile.form.nicknameInfo')}
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
                {t('common.cancel')}
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
                  t('common.saveChanges')
                )}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flexDirection: "column",
    minHeight: 400,
    maxHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 10,
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  formContainer: {
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 0,
    marginTop: -10,
    marginBottom: 15,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  buttonHalf: {
    flex: 1,
  },
});
