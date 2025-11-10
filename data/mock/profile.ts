// Mock data for Profile screen

export const quickStats = [
  {
    id: 1,
    icon: 'book' as const,
    value: '42',
    label: 'Articles Read',
    color: '#7C3AED',
    bgColor: '#7C3AED20',
  },
  {
    id: 2,
    icon: 'flame' as const,
    value: '7',
    label: 'Day Streak',
    color: '#F59E0B',
    bgColor: '#FEF3E2',
  },
  {
    id: 3,
    icon: 'time' as const,
    value: '340',
    label: 'Minutes',
    color: '#3B82F6',
    bgColor: '#E0F2FE',
  },
];

export const settingsMenu = [
  {
    id: 1,
    title: 'Account Settings',
    icon: 'person' as const,
    items: [
      {
        id: 1,
        label: 'Edit Profile',
        icon: 'create' as const,
        action: 'EDIT_PROFILE',
      },
      {
        id: 2,
        label: 'Change Password',
        icon: 'lock-closed' as const,
        action: 'CHANGE_PASSWORD',
      },
      {
        id: 3,
        label: 'Email Preferences',
        icon: 'mail' as const,
        action: 'EMAIL_PREFERENCES',
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
        action: 'READING_GOALS',
      },
      {
        id: 2,
        label: 'Topic Interests',
        icon: 'heart' as const,
        action: 'TOPIC_INTERESTS',
      },
      {
        id: 3,
        label: 'Notifications',
        icon: 'notifications' as const,
        action: 'NOTIFICATIONS',
      },
      {
        id: 4,
        label: 'Language',
        icon: 'language' as const,
        action: 'LANGUAGE',
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
        action: 'HELP_SUPPORT',
      },
      {
        id: 2,
        label: 'Privacy Policy',
        icon: 'shield-checkmark' as const,
        action: 'PRIVACY_POLICY',
      },
      {
        id: 3,
        label: 'Terms of Service',
        icon: 'document-text' as const,
        action: 'TERMS_SERVICE',
      },
      {
        id: 4,
        label: 'About Scory',
        icon: 'information' as const,
        action: 'ABOUT_SCORY',
      },
    ],
  },
];
