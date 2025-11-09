import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  ProfileHeader,
  StatCard,
  SettingGroup,
  LogoutButton,
} from '@/features/profile/components';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colors = Colors.light;

  // User Data
  const userData = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: require('@/assets/images/dummy/news/education.png'),
  };

  // Quick Stats
  const quickStats = [
    {
      id: 1,
      icon: 'book' as const,
      value: '42',
      label: 'Articles Read',
      color: colors.primary,
      bgColor: colors.primary + '20',
    },
    {
      id: 2,
      icon: 'flame' as const,
      value: '7',
      label: 'Day Streak',
      color: colors.warning,
      bgColor: '#FEF3E2',
    },
    {
      id: 3,
      icon: 'time' as const,
      value: '340',
      label: 'Minutes',
      color: colors.info,
      bgColor: '#E0F2FE',
    },
  ];

  // Settings Menu
  const settingsMenu = [
    {
      id: 1,
      title: 'Account Settings',
      icon: 'person' as const,
      items: [
        {
          id: 1,
          label: 'Edit Profile',
          icon: 'create' as const,
          onPress: () => console.log('Edit Profile'),
        },
        {
          id: 2,
          label: 'Change Password',
          icon: 'lock-closed' as const,
          onPress: () => console.log('Change Password'),
        },
        {
          id: 3,
          label: 'Email Preferences',
          icon: 'mail' as const,
          onPress: () => console.log('Email Preferences'),
        },
      ],
    },
    {
      id: 2,
      title: 'Preferences',
      icon: 'settings' as const,
      items: [
        {
          id: 1,
          label: 'Reading Goals',
          icon: 'flag' as const,
          onPress: () => console.log('Reading Goals'),
        },
        {
          id: 2,
          label: 'Topic Interests',
          icon: 'heart' as const,
          onPress: () => console.log('Topic Interests'),
        },
        {
          id: 3,
          label: 'Notifications',
          icon: 'notifications' as const,
          onPress: () => console.log('Notifications'),
        },
        {
          id: 4,
          label: 'Language',
          icon: 'language' as const,
          onPress: () => console.log('Language'),
        },
      ],
    },
    {
      id: 3,
      title: 'About',
      icon: 'information-circle' as const,
      items: [
        {
          id: 1,
          label: 'Help & Support',
          icon: 'help-circle' as const,
          onPress: () => console.log('Help & Support'),
        },
        {
          id: 2,
          label: 'Privacy Policy',
          icon: 'shield-checkmark' as const,
          onPress: () => console.log('Privacy Policy'),
        },
        {
          id: 3,
          label: 'Terms of Service',
          icon: 'document-text' as const,
          onPress: () => console.log('Terms of Service'),
        },
        {
          id: 4,
          label: 'About Scory',
          icon: 'information' as const,
          onPress: () => console.log('About Scory'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <ProfileHeader
          name={userData.name}
          email={userData.email}
          avatar={userData.avatar}
          onEditPress={() => console.log('Edit Profile')}
          onAvatarEditPress={() => console.log('Edit Avatar')}
        />

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
        <LogoutButton onPress={() => console.log('Logout')} />

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>Scory v1.0.0</Text>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
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