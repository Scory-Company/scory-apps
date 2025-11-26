import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  ProfileHeader,
  StatCard,
  SettingGroup,
  LogoutButton,
  EditProfileModal,
} from '@/features/profile/components';
import { getProfile, updateProfile, logout, User } from '@/services/auth';
import { personalizationApi } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { quickStats, settingsMenu as settingsMenuData } from '@/data/mock';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAlert } from '@/features/shared/hooks/useAlert';
import { useToast } from '@/features/shared/hooks/useToast';
import { LanguageModal } from '@/features/settings/components/LanguageModal';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const router = useRouter();
  const alert = useAlert();
  const toast = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
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
      t('auth.logout'),
      t('auth.logoutConfirm'),
      async () => {
        try {
          await logout();
          router.replace('/(auth)/login');
        } catch (error) {
          alert.error(t('common.error'), t('auth.logoutError'));
        }
      }
    );
  };

  // Debug: Reset personalization (deletes backend data)
  const handleResetPersonalization = () => {
    alert.confirm(
      'Reset Personalization',
      'This will delete all your personalization data (reading level & topic interests). You will need to complete the onboarding quiz again. Continue?',
      async () => {
        try {
          console.log('[Debug] Resetting personalization...');

          // 1. Call backend API to delete personalization
          await personalizationApi.resetPersonalization();
          console.log('[Debug] ✅ Backend personalization deleted');

          // 2. Clear local AsyncStorage flag
          await AsyncStorage.removeItem('hasSeenPersonalizationTutorial');
          console.log('[Debug] ✅ Local tutorial flag cleared');

          toast.success('Personalization reset! Navigate to Home to see PersonalizationCard.');
        } catch (error: any) {
          console.error('[Debug] ❌ Error resetting personalization:', error);
          alert.error('Error', `Failed to reset: ${error?.message || 'Unknown error'}`);
        }
      }
    );
  };

  // Debug: Show onboarding again (keeps backend data)
  const handleShowOnboarding = async () => {
    try {
      console.log('[Debug] Triggering onboarding display...');

      // Clear only local flag (backend data stays intact)
      await AsyncStorage.removeItem('hasSeenPersonalizationTutorial');
      console.log('[Debug] ✅ Tutorial flag cleared');

      toast.success('Onboarding triggered! Navigate to Home to see PersonalizationCard.');
    } catch (error: any) {
      console.error('[Debug] ❌ Error triggering onboarding:', error);
      alert.error('Error', `Failed: ${error?.message || 'Unknown error'}`);
    }
  };

  // Debug: Reset welcome screen and logout
  const handleResetWelcomeScreen = () => {
    alert.confirm(
      'Reset Welcome Screen',
      'This will reset the welcome onboarding screen and logout. You will see the 3-slide carousel when you restart the app. Continue?',
      async () => {
        try {
          console.log('[Debug] Resetting welcome screen...');

          // 1. Clear welcome onboarding flag
          await AsyncStorage.removeItem('onboarding_completed');
          console.log('[Debug] ✅ Welcome onboarding flag cleared');

          // 2. Logout user
          await logout();
          console.log('[Debug] ✅ User logged out');

          // 3. Navigate to login (Welcome will show on next app start)
          router.replace('/(auth)/login');

          toast.success('Welcome screen reset! Restart app to see welcome onboarding.');
        } catch (error: any) {
          console.error('[Debug] ❌ Error resetting welcome screen:', error);
          alert.error('Error', `Failed: ${error?.message || 'Unknown error'}`);
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
        setShowLanguageModal(true);
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.quickStats')}</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat) => (
              <StatCard
                key={stat.id}
                icon={stat.icon}
                value={stat.value}
                labelKey={stat.labelKey}
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
              titleKey={section.titleKey}
              icon={section.icon}
              items={section.items}
            />
          ))}
        </View>

        {/* Logout Button */}
        <LogoutButton onPress={handleLogout} />

        {/* Debug: Reset Personalization Button */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={[styles.debugLabel, { color: colors.textMuted }]}>
              🐛 Debug Tools
            </Text>
            <TouchableOpacity
              style={[styles.debugButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
              onPress={handleResetPersonalization}
              activeOpacity={0.7}
            >
              <Text style={[styles.debugButtonText, { color: colors.error }]}>
                Reset Personalization
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.debugButton, { backgroundColor: colors.third + '20', borderColor: colors.third, marginTop: Spacing.sm }]}
              onPress={handleShowOnboarding}
              activeOpacity={0.7}
            >
              <Text style={[styles.debugButtonText, { color: colors.third }]}>
                Trigger Onboarding
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.debugButton, { backgroundColor: '#FF9500' + '20', borderColor: '#FF9500', marginTop: Spacing.sm }]}
              onPress={handleResetWelcomeScreen}
              activeOpacity={0.7}
            >
              <Text style={[styles.debugButtonText, { color: '#FF9500' }]}>
                Reset Welcome Screen + Logout
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>{t('profile.version')} 1.0.0</Text>

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

      {/* Language Modal */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

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
  debugSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  debugLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  debugButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});