import axios from 'axios';

// ============================================
// CONFIGURATION
// ============================================

const SERPAPI_KEY = 'aa2ac5239676cd359d6a0da68a1f57cbbe232ed6d3d5dfa7220d76ae222ae303';
const SERPAPI_URL = 'https://serpapi.com/search.json';

// ============================================
// TYPES
// ============================================

export interface ScholarAuthor {
  name: string;
  author_id?: string;
  link?: string;
}

export interface ScholarPublicationInfo {
  summary: string;
  authors?: ScholarAuthor[];
}

export interface ScholarInlineLinks {
  cited_by?: {
    total: number;
    link: string;
    cites_id?: string;
  };
  versions?: {
    total: number;
    link: string;
    cluster_id?: string;
  };
  related_articles_link?: string;
}

export interface ScholarResource {
  title: string;
  file_format?: string;
  link: string;
}

export interface ScholarArticle {
  position: number;
  title: string;
  result_id: string;
  link?: string;
  snippet?: string;
  publication_info?: ScholarPublicationInfo;
  inline_links?: ScholarInlineLinks;
  resources?: ScholarResource[];
}

export interface ScholarSearchResponse {
  search_metadata: {
    id: string;
    status: string;
    created_at: string;
    processed_at: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    hl: string;
  };
  search_information: {
    total_results: number;
    time_taken_displayed: number;
    query_displayed: string;
  };
  organic_results: ScholarArticle[];
}

// ============================================
// API FUNCTIONS
// ============================================

export const scholarApi = {
  /**
   * Search academic papers on Google Scholar
   * @param query - Search query string
   * @param page - Page number (0-indexed)
   * @param limit - Number of results per page (max 20)
   */
  searchPapers: async (
    query: string,
    page: number = 0,
    limit: number = 10
  ): Promise<ScholarSearchResponse> => {
    try {
      const response = await axios.get<ScholarSearchResponse>(SERPAPI_URL, {
        params: {
          engine: 'google_scholar',
          q: query,
          api_key: SERPAPI_KEY,
          start: page * limit,
          num: Math.min(limit, 20), // Max 20 results per request
          hl: 'en', // Language: English
        },
      });
      return response.data;
    } catch (error) {
      console.error('Scholar API Error:', error);
      throw error;
    }
  },

  /**
   * Search papers by specific author
   * @param authorId - Google Scholar author ID
   */
  searchByAuthor: async (authorId: string) => {
    try {
      const response = await axios.get(SERPAPI_URL, {
        params: {
          engine: 'google_scholar_author',
          author_id: authorId,
          api_key: SERPAPI_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Scholar Author API Error:', error);
      throw error;
    }
  },

  /**
   * Get papers that cite a specific paper
   * @param citesId - Citation ID from inline_links.cited_by.cites_id
   */
  getCitedByPapers: async (citesId: string) => {
    try {
      const response = await axios.get(SERPAPI_URL, {
        params: {
          engine: 'google_scholar',
          cites: citesId,
          api_key: SERPAPI_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Scholar Citations API Error:', error);
      throw error;
    }
  },

  /**
   * Search papers by year range
   * @param query - Search query
   * @param yearStart - Start year (e.g., 2020)
   * @param yearEnd - End year (e.g., 2024)
   */
  searchByYear: async (query: string, yearStart: number, yearEnd: number) => {
    try {
      const response = await axios.get<ScholarSearchResponse>(SERPAPI_URL, {
        params: {
          engine: 'google_scholar',
          q: query,
          api_key: SERPAPI_KEY,
          as_ylo: yearStart,
          as_yhi: yearEnd,
          hl: 'en',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Scholar Year Search Error:', error);
      throw error;
    }
  },
};
