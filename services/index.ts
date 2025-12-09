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

export { default as simplifyApi } from './simplifyApi';
export type {
  ExternalSource,
  SimplifyCacheCheckResponse,
  SimplifyExternalRequest,
  SimplifyExternalResponse,
  GetSimplifiedArticleResponse,
  ContentBlock as SimplifyContentBlock,
  QuizQuestion,
  Insight,
} from './simplifyApi';

export { default as searchApi } from './searchApi';
export type {
  SearchSource,
  SearchOptions,
  SearchResult,
  SearchResultMetadata,
  SearchMeta,
  SearchResponse,
} from './searchApi';

export { quizApi } from './quizApi';
export type {
  QuizQuestion as QuizApiQuestion,
  QuizQuestionsResponse,
  QuizAnswer,
  QuizSubmitRequest,
  QuizAnswerResult,
  QuizSubmitResponse,
  QuizAttempt,
} from './quizApi';

export { insightsApi } from './insightsApi';
export type {
  Insight as InsightApiInsight,
  InsightsResponse,
  SaveInsightNoteRequest,
  InsightNote,
} from './insightsApi';

export { standaloneNotesApi } from './standaloneNotesApi';
export type {
  StandaloneNote,
  CreateStandaloneNoteRequest,
  UpdateStandaloneNoteRequest,
} from './standaloneNotesApi';
