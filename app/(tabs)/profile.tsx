/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  ProfileHeader,
  StatCard,
  SettingGroup,
  LogoutButton,
  EditProfileModal,
} from '@/features/profile/components';
import { SetWeeklyGoalModal } from '@/features/learn/components';
import { getProfile, updateProfile, logout, User } from '@/services/auth';
import { quickStats as quickStatsMock, settingsMenu as settingsMenuData } from '@/data/mock';
import React, { useEffect, useState } from 'react';
import { useGamificationStats } from '@/hooks/useGamificationStats';
import { useWeeklyGoal } from '@/hooks/useWeeklyGoal';
 
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
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
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch gamification stats from API
  const {
    stats: gamificationStats,
    isLoading: isLoadingStats,
    fetchStats,
  } = useGamificationStats();

  // Fetch weekly goal from API
  const {
    goal: weeklyGoal,
    updateGoal,
    invalidateCache: invalidateGoalCache,
  } = useWeeklyGoal();

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const loadUserProfile = async () => {
    try {
      const profile = await getProfile();
      if (profile) {
        setUserData(profile);
      }
    } catch (error) {
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

  // Handle menu item actions
  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'EDIT_PROFILE':
        setShowEditModal(true);
        break;
      case 'READING_GOALS':
        setShowGoalModal(true);
        break;
      case 'PERSONALIZATION':
        router.push('/personalization');
        break;
      case 'LANGUAGE':
        setShowLanguageModal(true);
        break;
      case 'HELP_SUPPORT':
        router.push('/help-support');
        break;
      case 'PRIVACY_POLICY':
        router.push('/privacy-policy');
        break;
      case 'TERMS_SERVICE':
        router.push('/terms-service');
        break;
      case 'ABOUT_SCORY':
        router.push('/about');
        break;
      default:
        // Unknown action
        break;
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

  // Transform API data to quickStats format, fallback to mock if not available
  const quickStats = React.useMemo(() => {
    if (gamificationStats) {
      return [
        {
          id: 1,
          icon: 'book' as const,
          value: gamificationStats.articlesRead.total.toString(),
          labelKey: 'profile.stats.articlesRead',
          color: '#7C3AED',
          bgColor: '#7C3AED20',
        },
        {
          id: 2,
          icon: 'flame' as const,
          value: gamificationStats.streak.current.toString(),
          labelKey: 'profile.stats.dayStreak',
          color: '#F59E0B',
          bgColor: '#FEF3E2',
        },
        {
          id: 3,
          icon: 'time' as const,
          value: gamificationStats.readingTime.totalMinutes.toString(),
          labelKey: 'profile.stats.minutes',
          color: '#3B82F6',
          bgColor: '#E0F2FE',
        },
      ];
    }
    return quickStatsMock;
  }, [gamificationStats]);

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

      {/* Set Weekly Goal Modal */}
      <SetWeeklyGoalModal
        visible={showGoalModal}
        currentTarget={weeklyGoal?.target}
        onClose={() => setShowGoalModal(false)}
        onGoalSet={async (target) => {
          await updateGoal(target);
          invalidateGoalCache(); // Refresh stats after goal update
          fetchStats(); // Refresh gamification stats
        }}
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
});