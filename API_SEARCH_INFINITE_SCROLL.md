# Search API - Infinite Scroll Implementation Guide

## Overview

Search API mendukung **infinite scroll** dengan strategi pagination yang smart:
- **Page 1**: Database Internal (full) + OpenAlex (20 results)
- **Page 2+**: OpenAlex incremental loading
- **Fallback**: Google Scholar ketika OpenAlex habis

## Endpoint

```
GET /api/v1/search
```

## Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` atau `query` | string | **required** | Search query |
| `sources` | string | `auto` | Source selection: `auto`, `internal`, `openalex`, `scholar`, `all` |
| `useScholar` | boolean | `false` | Enable Google Scholar fallback (only for `auto` mode) |
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `20` | Results per page (max: 50) |
| `year` | number | - | Filter by publication year |
| `openAccess` | boolean | - | Filter by open access status |
| `language` | string | - | Filter by language |

## Response Format

```json
{
  "success": true,
  "query": "machine learning",
  "data": {
    "results": [
      {
        "id": "W1234567890",
        "title": "Paper Title",
        "excerpt": "Abstract or description",
        "authors": ["Author 1", "Author 2"],
        "year": 2024,
        "source": "openalex",
        "type": "article",
        "link": "/articles/...",
        "pdfUrl": "https://...",
        "citations": 42,
        "isOpenAccess": true,
        "publisher": "Publisher Name",
        "doi": "10.1234/...",
        "language": "en",
        "metadata": {
          "isSimplified": false,
          "isExternal": true,
          "externalId": "W1234567890",
          "externalSource": "openalex"
        }
      }
    ],
    "meta": {
      "total": 20,
      "page": 1,
      "limit": 20,
      "hasMore": true,
      "sources": {
        "internal": 5,
        "openalex": 15,
        "scholar": 0
      },
      "scholarUsed": false,
      "searchTime": "0.45s"
    }
  }
}
```

## Key Fields

### `hasMore` (boolean)
Indicates whether there are more results to load. Use this to:
- Stop infinite scroll when `false`
- Show/hide "Load More" button
- Display end-of-results message

### `metadata.isSimplified` (boolean)
Indicates if the paper has already been simplified and exists in database.
- `true`: Paper sudah pernah disederhanakan, bisa langsung dibuka
- `false`: Paper baru, perlu simplify terlebih dahulu

### `source` (string)
Source of the result:
- `internal`: From local database
- `openalex`: From OpenAlex API
- `scholar`: From Google Scholar

## Pagination Strategy

### Page 1 (Initial Load)
```
Request:  GET /api/v1/search?q=AI&page=1&limit=20
Response: DB (50 max) + OpenAlex p1 (20) = ~70 results
          hasMore: true (if OpenAlex returned 20)
```

### Page 2+ (Incremental Load)
```
Request:  GET /api/v1/search?q=AI&page=2&limit=20
Response: OpenAlex p2 (20) only
          hasMore: true (if OpenAlex returned 20)

Request:  GET /api/v1/search?q=AI&page=3&limit=20
Response: OpenAlex p3 (20) only
          hasMore: true/false (based on results)
```

### Scholar Fallback
```
Request:  GET /api/v1/search?q=AI&page=5&useScholar=true
Response: If OpenAlex exhausted, Scholar kicks in
          hasMore: true (if Scholar returned 20)
```

## Frontend Implementation

### 1. React Example (Infinite Scroll)

```typescript
import { useState, useEffect, useRef } from 'react';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  // ... other fields
}

export function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');

  const observerTarget = useRef(null);

  // Initial search
  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
    setResults([]);
    await fetchResults(searchQuery, 1, true);
  };

  // Fetch results
  const fetchResults = async (
    searchQuery: string,
    pageNum: number,
    reset = false
  ) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/v1/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        setResults(prev =>
          reset ? data.data.results : [...prev, ...data.data.results]
        );
        setHasMore(data.data.meta.hasMore);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more (manual)
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchResults(query, nextPage);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  return (
    <div>
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search papers..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(e.currentTarget.value);
          }
        }}
      />

      {/* Results */}
      <div className="results">
        {results.map(result => (
          <ResultCard key={result.id} data={result} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} style={{ height: 20 }} />

      {/* Loading indicator */}
      {loading && <LoadingSpinner />}

      {/* Load more button (fallback) */}
      {hasMore && !loading && (
        <button onClick={loadMore}>
          Load More Results
        </button>
      )}

      {/* End message */}
      {!hasMore && results.length > 0 && (
        <div className="end-message">
          All results loaded ({results.length} papers found)
        </div>
      )}
    </div>
  );
}
```

### 2. Vue 3 Example (Composition API)

```vue
<template>
  <div>
    <!-- Search bar -->
    <input
      v-model="searchQuery"
      @keydown.enter="handleSearch"
      placeholder="Search papers..."
    />

    <!-- Results -->
    <div class="results">
      <ResultCard
        v-for="result in results"
        :key="result.id"
        :data="result"
      />
    </div>

    <!-- Infinite scroll trigger -->
    <div ref="observerTarget" style="height: 20px"></div>

    <!-- Loading -->
    <LoadingSpinner v-if="loading" />

    <!-- Load more button -->
    <button v-if="hasMore && !loading" @click="loadMore">
      Load More Results
    </button>

    <!-- End message -->
    <div v-if="!hasMore && results.length > 0" class="end-message">
      All results loaded ({{ results.length }} papers)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const results = ref([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);
const searchQuery = ref('');
const observerTarget = ref(null);

let observer: IntersectionObserver | null = null;

const fetchResults = async (query: string, pageNum: number, reset = false) => {
  loading.value = true;

  try {
    const response = await fetch(
      `/api/v1/search?q=${encodeURIComponent(query)}&page=${pageNum}&limit=20`
    );
    const data = await response.json();

    if (data.success) {
      results.value = reset
        ? data.data.results
        : [...results.value, ...data.data.results];
      hasMore.value = data.data.meta.hasMore;
    }
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  results.value = [];
  fetchResults(searchQuery.value, 1, true);
};

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    page.value++;
    fetchResults(searchQuery.value, page.value);
  }
};

onMounted(() => {
  observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasMore.value && !loading.value) {
        loadMore();
      }
    },
    { threshold: 0.5 }
  );

  if (observerTarget.value) {
    observer.observe(observerTarget.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>
```

### 3. Vanilla JavaScript Example

```javascript
class InfiniteSearchScroll {
  constructor() {
    this.results = [];
    this.page = 1;
    this.loading = false;
    this.hasMore = true;
    this.query = '';

    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore && !this.loading) {
          this.loadMore();
        }
      },
      { threshold: 0.5 }
    );

    const trigger = document.getElementById('scroll-trigger');
    if (trigger) {
      observer.observe(trigger);
    }
  }

  async search(query) {
    this.query = query;
    this.page = 1;
    this.results = [];
    await this.fetchResults(query, 1, true);
  }

  async fetchResults(query, page, reset = false) {
    this.loading = true;
    this.updateLoadingUI(true);

    try {
      const response = await fetch(
        `/api/v1/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        this.results = reset
          ? data.data.results
          : [...this.results, ...data.data.results];
        this.hasMore = data.data.meta.hasMore;
        this.renderResults();
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      this.loading = false;
      this.updateLoadingUI(false);
    }
  }

  loadMore() {
    if (!this.loading && this.hasMore) {
      this.page++;
      this.fetchResults(this.query, this.page);
    }
  }

  renderResults() {
    const container = document.getElementById('results-container');
    if (!container) return;

    // Append new results
    this.results.forEach(result => {
      const card = this.createResultCard(result);
      container.appendChild(card);
    });

    // Update end message
    this.updateEndMessage();
  }

  createResultCard(result) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <h3>${result.title}</h3>
      <p>${result.excerpt}</p>
      <div class="meta">
        <span>${result.authors.join(', ')}</span>
        <span>${result.year}</span>
        <span class="badge">${result.source}</span>
      </div>
    `;
    return card;
  }

  updateLoadingUI(isLoading) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.style.display = isLoading ? 'block' : 'none';
    }
  }

  updateEndMessage() {
    const endMsg = document.getElementById('end-message');
    if (endMsg) {
      endMsg.style.display = !this.hasMore && this.results.length > 0
        ? 'block'
        : 'none';
      endMsg.textContent = `All results loaded (${this.results.length} papers)`;
    }
  }
}

// Initialize
const searchScroll = new InfiniteSearchScroll();

// Bind search input
document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchScroll.search(e.target.value);
  }
});
```

## Best Practices

### 1. Debounce Search Input
```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query: string) => {
  handleSearch(query);
}, 300);
```

### 2. Cache Results
```typescript
const searchCache = new Map();

const fetchWithCache = async (query: string, page: number) => {
  const cacheKey = `${query}-${page}`;

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const response = await fetch(`/api/v1/search?q=${query}&page=${page}`);
  const data = await response.json();

  searchCache.set(cacheKey, data);
  return data;
};
```

### 3. Error Handling
```typescript
const fetchResults = async () => {
  try {
    // ... fetch logic
  } catch (error) {
    // Show error message to user
    setError('Failed to load results. Please try again.');

    // Log to monitoring service
    console.error('Search error:', error);
  }
};
```

### 4. Loading States
```typescript
// Show skeleton loading
<div className="results">
  {loading && results.length === 0 ? (
    <SkeletonLoader count={5} />
  ) : (
    results.map(result => <ResultCard key={result.id} data={result} />)
  )}
</div>

// Show "Loading more..." at bottom
{loading && results.length > 0 && (
  <div className="loading-more">Loading more results...</div>
)}
```

## Testing

### Test Scenarios

1. **Initial Search**
   - Query: "machine learning"
   - Expected: DB results + OpenAlex page 1, hasMore: true

2. **Pagination**
   - Load page 2, 3, 4...
   - Expected: Only OpenAlex results, hasMore based on results count

3. **End of Results**
   - Keep loading until hasMore: false
   - Expected: No more results, show end message

4. **Scholar Fallback**
   - Query with useScholar=true
   - Expected: Scholar results when OpenAlex exhausted

5. **Empty Results**
   - Query: "asdfjkl12345"
   - Expected: Empty array, hasMore: false

## Performance Tips

1. **Limit per page**: Keep it between 10-20 for optimal performance
2. **Debounce search**: 300ms debounce for search input
3. **Virtual scrolling**: Use libraries like `react-window` for thousands of results
4. **Lazy load images**: Use `loading="lazy"` attribute
5. **Cancel requests**: Cancel pending requests when new search initiated

## Support

For issues or questions, please contact the backend team or check the main API documentation.
