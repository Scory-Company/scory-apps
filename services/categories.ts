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

export interface CategoriesListResponse {
  data: CategoryResponse[];
  message: string;
  success: boolean;
}

export interface SingleCategoryResponse {
  data: CategoryResponse;
  message: string;
  success: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

export const categoriesApi = {
  getAll: () => api.get<CategoriesListResponse>('/categories'),
  getBySlug: (slug: string) => api.get<SingleCategoryResponse>(`/categories/${slug}`),
};
