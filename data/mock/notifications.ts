export interface Notification {
  id: string;
  type: 'article' | 'achievement' | 'system' | 'social';
  title: string;
  message: string;
  timestamp: string; // ISO format
  isRead: boolean;
  icon: string; // Ionicons name
  iconColor: string;
  actionUrl?: string; // Optional deep link
}

export const notifications: Notification[] = [
  {
    id: 'notif_1',
    type: 'article',
    title: 'New Article in Finance',
    message: 'Check out "The Future of Cryptocurrency" by Dr. Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    isRead: false,
    icon: 'document-text',
    iconColor: '#20B548',
    actionUrl: '/article/article_1',
  },
  {
    id: 'notif_2',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You\'ve read 10 articles this week. Keep it up!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
    icon: 'trophy',
    iconColor: '#F59E0B',
  },
  {
    id: 'notif_3',
    type: 'social',
    title: 'New Comment',
    message: 'John Doe replied to your comment on "Machine Learning Basics"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    isRead: true,
    icon: 'chatbubble',
    iconColor: '#3B82F6',
    actionUrl: '/article/article_2',
  },
  {
    id: 'notif_4',
    type: 'system',
    title: 'System Update',
    message: 'New features available! Check out our latest updates.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    icon: 'information-circle',
    iconColor: '#8B5CF6',
  },
  {
    id: 'notif_5',
    type: 'article',
    title: 'Trending Topic Alert',
    message: '"Artificial Intelligence" is trending. Explore related articles now!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    isRead: true,
    icon: 'flame',
    iconColor: '#EF4444',
  },
  {
    id: 'notif_6',
    type: 'achievement',
    title: 'Milestone Reached',
    message: 'You\'ve completed 50 articles! Amazing progress.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    isRead: true,
    icon: 'star',
    iconColor: '#F59E0B',
  },
  {
    id: 'notif_7',
    type: 'article',
    title: 'Recommended for You',
    message: 'Based on your interests: "Quantum Computing Explained"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    isRead: true,
    icon: 'sparkles',
    iconColor: '#20B548',
    actionUrl: '/article/article_5',
  },
  {
    id: 'notif_8',
    type: 'social',
    title: 'New Follower',
    message: 'Dr. Michael Chen started following you.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    isRead: true,
    icon: 'person-add',
    iconColor: '#3B82F6',
  },
];

// Helper function to get unread count
export const getUnreadCount = (): number => {
  return notifications.filter(n => !n.isRead).length;
};

// Helper function to format time ago
export const getTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
};
