// Base API client
export { default as api, API_URL } from './api';

// Feature APIs
export { articlesApi, ReadingLevel } from './articles';
export type { ArticleListParams, ArticleResponse, PaginatedResponse, ContentBlock, ArticleContent } from './articles';

export { categoriesApi } from './categories';
export type { CategoryResponse } from './categories';

export { topicsApi } from './topics';
export type { TopicResponse } from './topics';

export { personalizationApi } from './personalization';

export { scholarApi } from './scholar';
export type { ScholarArticle, ScholarSearchResponse } from './scholar';
