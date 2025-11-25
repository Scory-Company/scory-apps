import api from './api';

// ============================================
// TYPES
// ============================================

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  articleCount: number;
}

// ============================================
// API FUNCTIONS
// ============================================

export const categoriesApi = {
  getAll: () => api.get<CategoryResponse[]>('/categories'),
  getBySlug: (slug: string) => api.get<CategoryResponse>(`/categories/${slug}`),
};
