import api from './api';

// ============================================
// API FUNCTIONS
// ============================================

export const personalizationApi = {
  // Get user's reading level setting
  getSettings: () => api.get('/personalization/settings'),

  // Save reading level
  saveSettings: (readingLevel: string) =>
    api.post('/personalization/settings', { readingLevel }),

  // Get user's topic interests
  getTopicInterests: () => api.get('/personalization/topic-interests'),

  // Save topic interests
  saveTopicInterests: (topicIds: string[]) =>
    api.post('/personalization/topic-interests', { topicIds }),
};
