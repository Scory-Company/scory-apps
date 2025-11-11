import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  ProfileHeader,
  StatCard,
  SettingGroup,
  LogoutButton,
  EditProfileModal,
} from '@/features/profile/components';
import { getProfile, updateProfile, logout, User } from '@/services/auth';
import { quickStats, settingsMenu as settingsMenuData } from '@/data/mock';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAlert } from '@/features/shared/hooks/useAlert';
import { useToast } from '@/features/shared/hooks/useToast';

export default function ProfileScreen() {
  const colors = Colors.light;
  const router = useRouter();
  const alert = useAlert();
  const toast = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getProfile();
      if (profile) {
        setUserData(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert.error('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: {
    fullName: string;
    nickname: string;
    avatarUrl: string;
  }) => {
    try {
      const updated = await updateProfile(data);
      if (updated) {
        setUserData(updated);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      throw error; // Let modal handle the error
    }
  };

  const handleLogout = () => {
    alert.confirm(
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        try {
          await logout();
          router.replace('/(auth)/login');
        } catch (error) {
          alert.error('Error', 'Failed to logout');
        }
      }
    );
  };

  // Handle menu item actions
  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'EDIT_PROFILE':
        setShowEditModal(true);
        break;
      case 'CHANGE_PASSWORD':
        console.log('Change Password');
        break;
      case 'EMAIL_PREFERENCES':
        console.log('Email Preferences');
        break;
      case 'READING_GOALS':
        console.log('Reading Goals');
        break;
      case 'TOPIC_INTERESTS':
        console.log('Topic Interests');
        break;
      case 'NOTIFICATIONS':
        console.log('Notifications');
        break;
      case 'LANGUAGE':
        console.log('Language');
        break;
      case 'HELP_SUPPORT':
        console.log('Help & Support');
        break;
      case 'PRIVACY_POLICY':
        console.log('Privacy Policy');
        break;
      case 'TERMS_SERVICE':
        console.log('Terms of Service');
        break;
      case 'ABOUT_SCORY':
        console.log('About Scory');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Map settings menu with action handlers
  const settingsMenu = settingsMenuData.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      onPress: () => handleMenuAction(item.action),
    })),
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        {userData && (
        <ProfileHeader
          name={userData.fullName}
          email={userData.email}
          avatar={
            userData.avatarUrl
              ? { uri: userData.avatarUrl }
              : {
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData.fullName
                  )}&background=random`,
                }
          }
          onEditPress={() => setShowEditModal(true)}
          onAvatarEditPress={() => setShowEditModal(true)}
        />
        )}

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat) => (
              <StatCard
                key={stat.id}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                color={stat.color}
                bgColor={stat.bgColor}
              />
            ))}
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.settingsSection}>
          {settingsMenu.map((section) => (
            <SettingGroup
              key={section.id}
              title={section.title}
              icon={section.icon}
              items={section.items}
            />
          ))}
        </View>

        {/* Logout Button */}
        <LogoutButton onPress={handleLogout} />

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>Scory v1.0.0</Text>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      {userData && (
        <EditProfileModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateProfile}
          initialData={{
            fullName: userData.fullName,
            nickname: userData.nickname || '',
            avatarUrl: userData.avatarUrl || '',
          }}
        />
      )}

      {/* Alert Component */}
      <alert.AlertComponent />

      {/* Toast Component */}
      <toast.ToastComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  settingsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  versionText: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});