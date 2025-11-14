// Mock data for Profile screen

export const quickStats = [
  {
    id: 1,
    icon: 'book' as const,
    value: '42',
    labelKey: 'profile.stats.articlesRead',
    color: '#7C3AED',
    bgColor: '#7C3AED20',
  },
  {
    id: 2,
    icon: 'flame' as const,
    value: '7',
    labelKey: 'profile.stats.dayStreak',
    color: '#F59E0B',
    bgColor: '#FEF3E2',
  },
  {
    id: 3,
    icon: 'time' as const,
    value: '340',
    labelKey: 'profile.stats.minutes',
    color: '#3B82F6',
    bgColor: '#E0F2FE',
  },
];

export const settingsMenu = [
  {
    id: 1,
    titleKey: 'profile.menu.accountSettings',
    icon: 'person' as const,
    items: [
      {
        id: 1,
        labelKey: 'profile.menu.editProfile',
        icon: 'create' as const,
        action: 'EDIT_PROFILE',
      },
      {
        id: 2,
        labelKey: 'profile.menu.changePassword',
        icon: 'lock-closed' as const,
        action: 'CHANGE_PASSWORD',
      },
      {
        id: 3,
        labelKey: 'profile.menu.emailPreferences',
        icon: 'mail' as const,
        action: 'EMAIL_PREFERENCES',
      },
    ],
  },
  {
    id: 2,
    titleKey: 'profile.menu.preferences',
    icon: 'settings' as const,
    items: [
      {
        id: 1,
        labelKey: 'profile.menu.readingGoals',
        icon: 'flag' as const,
        action: 'READING_GOALS',
      },
      {
        id: 2,
        labelKey: 'profile.menu.topicInterests',
        icon: 'heart' as const,
        action: 'TOPIC_INTERESTS',
      },
      {
        id: 3,
        labelKey: 'profile.menu.notifications',
        icon: 'notifications' as const,
        action: 'NOTIFICATIONS',
      },
      {
        id: 4,
        labelKey: 'profile.menu.language',
        icon: 'language' as const,
        action: 'LANGUAGE',
      },
    ],
  },
  {
    id: 3,
    titleKey: 'profile.menu.about',
    icon: 'information-circle' as const,
    items: [
      {
        id: 1,
        labelKey: 'profile.menu.helpSupport',
        icon: 'help-circle' as const,
        action: 'HELP_SUPPORT',
      },
      {
        id: 2,
        labelKey: 'profile.menu.privacyPolicy',
        icon: 'shield-checkmark' as const,
        action: 'PRIVACY_POLICY',
      },
      {
        id: 3,
        labelKey: 'profile.menu.termsService',
        icon: 'document-text' as const,
        action: 'TERMS_SERVICE',
      },
      {
        id: 4,
        labelKey: 'profile.menu.aboutScory',
        icon: 'information' as const,
        action: 'ABOUT_SCORY',
      },
    ],
  },
];
