import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar: ImageSourcePropType;
  onEditPress?: () => void;
  onAvatarEditPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  avatar,
  onEditPress,
  onAvatarEditPress,
}) => {
  const colors = Colors.light;
  const { t } = useTranslation();

  return (
    <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarWrapper, { borderColor: colors.primary }]}>
          <Image source={avatar} style={styles.avatar} />
        </View>
        <TouchableOpacity
          style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={onAvatarEditPress}
        >
          <Ionicons name="camera" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.userName, { color: colors.text }]}>{name}</Text>
      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{email}</Text>

      <TouchableOpacity
        style={[styles.editProfileButton, { borderColor: colors.border }]}
        activeOpacity={0.8}
        onPress={onEditPress}
      >
        <Ionicons name="create-outline" size={18} color={colors.text} />
        <Text style={[styles.editProfileText, { color: colors.text }]}>{t('profile.menu.editProfile')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarWrapper: {
    borderWidth: 3,
    borderRadius: 60,
    padding: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  editProfileText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});