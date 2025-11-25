import api from './api';

// ============================================
// TYPES
// ============================================

export interface TopicResponse {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const topicsApi = {
  getAll: (categoryId?: string) =>
    api.get<TopicResponse[]>('/topics', { params: { categoryId } }),
  getBySlug: (slug: string) => api.get<TopicResponse>(`/topics/${slug}`),
};
