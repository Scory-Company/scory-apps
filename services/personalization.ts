import api from './api';

// ============================================
// API FUNCTIONS
// ============================================

export const personalizationApi = {
  // Get user's reading level setting
  getSettings: () => api.get('/personalization'),

  // Save reading level
  saveSettings: (readingLevel: string) =>
    api.post('/personalization', { readingLevel }),

  // Get user's topic interests
  getTopicInterests: () => api.get('/personalization/topics'),

  // Save topic interests
  saveTopicInterests: (topicIds: string[]) =>
    api.post('/personalization/topics', { topicIds }),

  // Reset personalization (DELETE - for testing/debugging)
  resetPersonalization: () => api.delete('/personalization'),
};
