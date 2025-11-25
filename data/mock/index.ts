// Centralized mock data exports
// All mock data is organized here for easy sharing across features

export {
  forYouArticles,
  recentlyAddedArticles,
  topRatedArticles,
  popularArticles,
} from './articles';

export {
  categoryList,
  categoryCards,
} from './categories';

export {
  trendingTopics,
} from './topics';

export {
  studyCollections,
  weeklyGoal,
  learningStats,
  readingInsights,
} from './learn';

export {
  quickStats,
  settingsMenu,
} from './profile';

export {
  PERSONALIZATION_QUIZ,
  LEVEL_EMOJIS,
} from './personalization';

export {
  notifications,
  getUnreadCount,
  getTimeAgo,
} from './notifications';

export type { Notification } from './notifications';

export {
  quizQuestions,
  keyInsights,
  userQuizAttempts,
  userInsightNotes,
  getQuizByArticleId,
  getInsightsByArticleId,
  getUserQuizAttempts,
  getUserInsightNotes,
} from './comprehension';

export type {
  QuizQuestion,
  KeyInsight,
  UserQuizAttempt,
  UserInsightNote,
} from './comprehension';
