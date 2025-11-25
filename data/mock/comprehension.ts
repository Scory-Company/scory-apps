// Mock data for article comprehension features (quiz & key insights)

export interface QuizQuestion {
  id: number;
  articleId: number;
  question: string;
  options: string[];
  correctIndex: number;
  order: number;
}

export interface KeyInsight {
  id: number;
  articleId: number;
  content: string;
  order: number;
}

export interface UserQuizAttempt {
  id: number;
  userId: number;
  articleId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface UserInsightNote {
  id: number;
  userId: number;
  articleId: number;
  content: string;
  isCustom: boolean; // true if user wrote their own, false if selected from suggestions
  createdAt: string;
}

// Quiz questions per article
export const quizQuestions: QuizQuestion[] = [
  // Article 1 - AI in Healthcare
  {
    id: 1,
    articleId: 1,
    question: 'What is the main focus of this AI research?',
    options: [
      'Historical analysis only',
      'Cutting-edge developments and implications',
      'Personal opinions',
      'Unrelated topics',
    ],
    correctIndex: 1,
    order: 1,
  },
  {
    id: 2,
    articleId: 1,
    question: 'What methodology approach was used in this study?',
    options: [
      'Only qualitative methods',
      'Only quantitative methods',
      'Mixed-methods approach',
      'No methodology mentioned',
    ],
    correctIndex: 2,
    order: 2,
  },
  {
    id: 3,
    articleId: 1,
    question: 'What was highlighted as essential for breakthrough discoveries?',
    options: [
      'Working in isolation',
      'Cross-disciplinary collaboration',
      'Avoiding new methods',
      'Ignoring context',
    ],
    correctIndex: 1,
    order: 3,
  },
  // Article 2 - Climate Science
  {
    id: 4,
    articleId: 2,
    question: 'What is the primary concern addressed in this climate research?',
    options: [
      'Economic growth',
      'Environmental sustainability',
      'Political policies',
      'Entertainment industry',
    ],
    correctIndex: 1,
    order: 1,
  },
  {
    id: 5,
    articleId: 2,
    question: 'How does the study recommend addressing climate challenges?',
    options: [
      'Ignoring the problem',
      'Individual action only',
      'Collective and systemic changes',
      'Waiting for technology',
    ],
    correctIndex: 2,
    order: 2,
  },
  {
    id: 6,
    articleId: 2,
    question: 'What evidence supports the research findings?',
    options: [
      'Anecdotal stories',
      'Long-term data analysis',
      'Social media trends',
      'Personal beliefs',
    ],
    correctIndex: 1,
    order: 3,
  },
  // Article 3 - Psychology
  {
    id: 7,
    articleId: 3,
    question: 'What aspect of human behavior does this study examine?',
    options: [
      'Physical fitness',
      'Cognitive patterns and decision-making',
      'Fashion choices',
      'Food preferences',
    ],
    correctIndex: 1,
    order: 1,
  },
  {
    id: 8,
    articleId: 3,
    question: 'What research method was primarily used?',
    options: [
      'Observation only',
      'Controlled experiments',
      'Mixed-methods with surveys and experiments',
      'No specific method',
    ],
    correctIndex: 2,
    order: 2,
  },
  {
    id: 9,
    articleId: 3,
    question: 'What practical application does the research suggest?',
    options: [
      'No practical use',
      'Improving mental health interventions',
      'Building faster computers',
      'Creating new foods',
    ],
    correctIndex: 1,
    order: 3,
  },
];

// Key insights per article
export const keyInsights: KeyInsight[] = [
  // Article 1 - AI in Healthcare
  {
    id: 1,
    articleId: 1,
    content: 'Cross-disciplinary collaboration is essential for breakthrough discoveries in AI.',
    order: 1,
  },
  {
    id: 2,
    articleId: 1,
    content: 'Mixed-methods research provides both statistical significance and contextual meaning.',
    order: 2,
  },
  {
    id: 3,
    articleId: 1,
    content: 'Real-world applications of AI research show promising results across diverse contexts.',
    order: 3,
  },
  // Article 2 - Climate Science
  {
    id: 4,
    articleId: 2,
    content: 'Climate action requires both individual responsibility and systemic policy changes.',
    order: 1,
  },
  {
    id: 5,
    articleId: 2,
    content: 'Long-term environmental data reveals accelerating patterns that demand urgent attention.',
    order: 2,
  },
  {
    id: 6,
    articleId: 2,
    content: 'Sustainable practices in daily life can collectively create significant environmental impact.',
    order: 3,
  },
  // Article 3 - Psychology
  {
    id: 7,
    articleId: 3,
    content: 'Understanding cognitive biases helps improve personal decision-making processes.',
    order: 1,
  },
  {
    id: 8,
    articleId: 3,
    content: 'Mental health interventions are more effective when tailored to individual patterns.',
    order: 2,
  },
  {
    id: 9,
    articleId: 3,
    content: 'Self-awareness of behavioral patterns is the first step toward positive change.',
    order: 3,
  },
];

// User quiz attempts (sample data)
export const userQuizAttempts: UserQuizAttempt[] = [
  {
    id: 1,
    userId: 1,
    articleId: 1,
    score: 3,
    totalQuestions: 3,
    completedAt: '2025-11-20T10:30:00Z',
  },
  {
    id: 2,
    userId: 1,
    articleId: 2,
    score: 2,
    totalQuestions: 3,
    completedAt: '2025-11-19T14:15:00Z',
  },
];

// User saved insight notes (sample data)
export const userInsightNotes: UserInsightNote[] = [
  {
    id: 1,
    userId: 1,
    articleId: 1,
    content: 'Cross-disciplinary collaboration is essential for breakthrough discoveries in AI.',
    isCustom: false,
    createdAt: '2025-11-20T10:35:00Z',
  },
  {
    id: 2,
    userId: 1,
    articleId: 2,
    content: 'I need to reduce my carbon footprint by using public transport more often.',
    isCustom: true,
    createdAt: '2025-11-19T14:20:00Z',
  },
];

// Helper functions
export const getQuizByArticleId = (articleId: number): QuizQuestion[] => {
  return quizQuestions.filter((q) => q.articleId === articleId).sort((a, b) => a.order - b.order);
};

export const getInsightsByArticleId = (articleId: number): KeyInsight[] => {
  return keyInsights.filter((i) => i.articleId === articleId).sort((a, b) => a.order - b.order);
};

export const getUserQuizAttempts = (userId: number): UserQuizAttempt[] => {
  return userQuizAttempts.filter((a) => a.userId === userId);
};

export const getUserInsightNotes = (userId: number): UserInsightNote[] => {
  return userInsightNotes.filter((n) => n.userId === userId);
};
