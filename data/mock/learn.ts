// Centralized learn/study data

export const studyCollections = [
  {
    id: 1,
    title: 'Introduction to AI & Machine Learning',
    articlesCount: 12,
    progress: 6,
    category: 'Technology',
    color: '#667eea',
    icon: 'hardware-chip' as const,
  },
  {
    id: 2,
    title: 'Climate Science Fundamentals',
    articlesCount: 8,
    progress: 3,
    category: 'Environment',
    color: '#43e97b',
    icon: 'leaf' as const,
  },
  {
    id: 3,
    title: 'Modern Finance & Economics',
    articlesCount: 15,
    progress: 0,
    category: 'Finance',
    color: '#fa709a',
    icon: 'trending-up' as const,
  },
];

export const weeklyGoal = {
  target: 7,
  completed: 3,
  daysLeft: 4,
};

// Note: Labels are now handled by i18n in the component
// These mock values are fallbacks and will be translated when used
export const learningStats = [
  {
    id: 1,
    icon: 'flame' as const,
    value: 0,
    label: 'Day Streak', // Will be translated via t('learn.stats.dayStreak')
  },
  {
    id: 2,
    icon: 'book' as const,
    value: 0,
    label: 'Articles Read', // Will be translated via t('learn.stats.articlesRead')
  },
  {
    id: 3,
    icon: 'time' as const,
    value: 0,
    label: 'Minutes', // Will be translated via t('learn.stats.minutes')
  },
];

export const readingInsights = [
  {
    id: 1,
    articleTitle: 'The Future of Artificial Intelligence',
    note: 'AI ethics is becoming crucial as technology advances. Need to balance innovation with responsibility.',
    date: '2 hours ago',
    tags: ['AI', 'Ethics'],
  },
  {
    id: 2,
    articleTitle: 'Sustainable Energy Solutions',
    note: 'Solar energy costs have decreased by 89% in the last decade. This makes it more accessible for developing countries.',
    date: '1 day ago',
    tags: ['Energy', 'Sustainability'],
  },
  {
    id: 3,
    articleTitle: 'Mental Health in Digital Age',
    note: 'Screen time management is key. Taking regular breaks improves focus and reduces anxiety.',
    date: '2 days ago',
    tags: ['Health', 'Wellbeing'],
  },
  {
    id: 4,
    articleTitle: 'Blockchain Technology Explained',
    note: 'Decentralization is the key advantage. Removes need for intermediaries in transactions.',
    date: '3 days ago',
    tags: ['Technology', 'Finance'],
  },
];
