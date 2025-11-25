// Base API client
export { default as api, API_URL } from './api';

// Feature APIs
export { articlesApi } from './articles';
export type { ArticleListParams, ArticleResponse, PaginatedResponse } from './articles';

export { categoriesApi } from './categories';
export type { CategoryResponse } from './categories';

export { topicsApi } from './topics';
export type { TopicResponse } from './topics';

export { personalizationApi } from './personalization';
