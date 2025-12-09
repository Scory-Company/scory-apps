# 🔍 Unified Search API Documentation

API untuk mencari artikel dari berbagai sumber: database internal, OpenAlex (artikel ilmiah), dan Google Scholar (opsional).

---

## 📋 Table of Contents

- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [Search](#1-search)
  - [Health Check](#2-health-check)
- [Search Strategies](#search-strategies)
- [Response Format](#response-format)
- [Examples](#examples)
- [Error Handling](#error-handling)

---

## 🌐 Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://api.scory.app/api/v1
```

---

## 🎯 Endpoints

### 1. Search

**Endpoint:** `GET /search`

**Description:** Mencari artikel dari database internal, OpenAlex API, dan Google Scholar (opsional).

#### Query Parameters

| Parameter     | Type                                                      | Required | Default | Description                                          |
| ------------- | --------------------------------------------------------- | -------- | ------- | ---------------------------------------------------- |
| `q`           | string                                                    | ✅       | -       | Query pencarian (alternatif: gunakan `query`)       |
| `query`       | string                                                    | ✅       | -       | Query pencarian (alternatif: gunakan `q`)           |
| `sources`     | `auto` \| `internal` \| `openalex` \| `scholar` \| `all` | ❌       | `auto`  | Sumber data yang akan dicari                         |
| `useScholar`  | `true` \| `false`                                         | ❌       | `false` | Izinkan fallback ke Google Scholar                   |
| `page`        | integer                                                   | ❌       | `1`     | Nomor halaman                                        |
| `limit`       | integer (1-50)                                            | ❌       | `20`    | Jumlah hasil per halaman (maksimal 50)               |
| `year`        | integer (YYYY)                                            | ❌       | -       | Filter berdasarkan tahun publikasi                   |
| `openAccess`  | `true` \| `false`                                         | ❌       | -       | Filter hanya artikel open access                     |
| `language`    | string (2 huruf)                                          | ❌       | -       | Filter berdasarkan bahasa (contoh: `en`, `id`)      |

#### Sources Options

- **`auto`** (default): Cari di database + OpenAlex dulu, fallback ke Scholar jika hasil kurang dari 5
- **`internal`**: Hanya cari di database internal
- **`openalex`**: Hanya cari di OpenAlex API (artikel ilmiah gratis)
- **`scholar`**: Hanya cari di Google Scholar (berbayar, perlu diaktifkan)
- **`all`**: Cari di semua sumber secara paralel

---

### 2. Health Check

**Endpoint:** `GET /search/health`

**Description:** Cek status kesehatan search service dan koneksi ke external APIs.

**Response:**

```json
{
  "success": true,
  "message": "Search service is healthy",
  "data": {
    "database": true,
    "external": {
      "openAlex": true,
      "scholar": false,
      "scholarEnabled": false
    }
  }
}
```

---

## 🧠 Search Strategies

### Strategy 1: Auto (Smart Search) - RECOMMENDED ⭐

```
GET /search?q=machine learning&sources=auto
```

**Alur:**
1. Cari di **Database** + **OpenAlex** secara paralel (gratis)
2. Jika hasil < 5, fallback ke **Google Scholar** (opsional)
3. Merge & sort by relevance

**Kecepatan:** ~1-2 detik
**Biaya:** Gratis (Scholar hanya dipanggil jika perlu)

---

### Strategy 2: Internal Only

```
GET /search?q=machine learning&sources=internal
```

**Alur:** Hanya cari di database internal

**Kecepatan:** ~200-500ms
**Biaya:** Gratis

---

### Strategy 3: OpenAlex Only

```
GET /search?q=machine learning&sources=openalex
```

**Alur:** Hanya cari artikel ilmiah di OpenAlex

**Kecepatan:** ~1-2 detik
**Biaya:** Gratis

---

### Strategy 4: All Sources

```
GET /search?q=machine learning&sources=all
```

**Alur:** Cari di semua sumber (Database + OpenAlex + Scholar) secara paralel

**Kecepatan:** ~2-3 detik
**Biaya:** Berbayar (Scholar)

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "query": "machine learning",
  "data": {
    "results": [
      {
        "id": "article-uuid-or-doi",
        "title": "Introduction to Machine Learning",
        "excerpt": "This paper introduces fundamental concepts...",
        "authors": ["John Doe", "Jane Smith"],
        "year": 2023,
        "source": "internal",
        "type": "article",
        "link": "/articles/intro-to-ml",
        "pdfUrl": null,
        "citations": 0,
        "isOpenAccess": true,
        "publisher": null,
        "doi": null,
        "language": "id"
      },
      {
        "id": "https://openalex.org/W2741809807",
        "title": "Deep Learning for Computer Vision",
        "excerpt": "We present a comprehensive survey...",
        "authors": ["Alice Johnson", "Bob Williams"],
        "year": 2022,
        "source": "openalex",
        "type": "journal-article",
        "link": "https://doi.org/10.1234/example",
        "pdfUrl": "https://arxiv.org/pdf/1234.5678",
        "citations": 150,
        "isOpenAccess": true,
        "publisher": "Nature",
        "doi": "https://doi.org/10.1234/example",
        "language": "en"
      }
    ],
    "meta": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "sources": {
        "internal": 5,
        "openalex": 18,
        "scholar": 2
      },
      "scholarUsed": true,
      "searchTime": "1.5s"
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Search query is required (use ?q= or ?query=)"
}
```

---

## 💡 Examples

### 1. Simple Search

```bash
GET /api/v1/search?q=artificial intelligence
```

```javascript
// JavaScript/TypeScript
const response = await fetch('http://localhost:3000/api/v1/search?q=artificial intelligence');
const data = await response.json();

console.log(data.data.results); // Array of results
console.log(data.data.meta.total); // Total results
```

---

### 2. Search with Filters

```bash
GET /api/v1/search?q=covid&year=2023&openAccess=true&limit=10
```

```javascript
// JavaScript/TypeScript
const params = new URLSearchParams({
  q: 'covid',
  year: '2023',
  openAccess: 'true',
  limit: '10'
});

const response = await fetch(`http://localhost:3000/api/v1/search?${params}`);
const data = await response.json();
```

---

### 3. Search Internal Database Only

```bash
GET /api/v1/search?q=teknologi&sources=internal
```

```javascript
// React Example
import { useState, useEffect } from 'react';

function SearchComponent() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchArticles = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/search?q=${encodeURIComponent(query)}&sources=internal`
      );
      const data = await response.json();
      setResults(data.data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        onChange={(e) => searchArticles(e.target.value)}
        placeholder="Search..."
      />
      {loading && <p>Loading...</p>}
      {results.map(result => (
        <div key={result.id}>
          <h3>{result.title}</h3>
          <p>{result.excerpt}</p>
          <small>Source: {result.source}</small>
        </div>
      ))}
    </div>
  );
}
```

---

### 4. Search with Pagination

```bash
GET /api/v1/search?q=machine learning&page=2&limit=20
```

```javascript
// Pagination Example
async function fetchPage(query, page = 1, limit = 20) {
  const response = await fetch(
    `http://localhost:3000/api/v1/search?q=${query}&page=${page}&limit=${limit}`
  );
  const data = await response.json();

  return {
    results: data.data.results,
    currentPage: data.data.meta.page,
    totalResults: data.data.meta.total,
    totalPages: Math.ceil(data.data.meta.total / data.data.meta.limit)
  };
}

// Usage
const page1 = await fetchPage('AI', 1, 20);
const page2 = await fetchPage('AI', 2, 20);
```

---

### 5. Search All Sources

```bash
GET /api/v1/search?q=neural networks&sources=all
```

```javascript
// Advanced search with all sources
const searchAllSources = async (query) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/search?q=${encodeURIComponent(query)}&sources=all`
  );
  const data = await response.json();

  // Group by source
  const grouped = data.data.results.reduce((acc, item) => {
    if (!acc[item.source]) acc[item.source] = [];
    acc[item.source].push(item);
    return acc;
  }, {});

  console.log('Internal articles:', grouped.internal?.length || 0);
  console.log('OpenAlex papers:', grouped.openalex?.length || 0);
  console.log('Scholar papers:', grouped.scholar?.length || 0);

  return data;
};
```

---

### 6. Filter Open Access Only

```bash
GET /api/v1/search?q=covid&openAccess=true&sources=openalex
```

```javascript
// Search for open access papers only
const searchOpenAccess = async (query) => {
  const params = new URLSearchParams({
    q: query,
    sources: 'openalex',
    openAccess: 'true'
  });

  const response = await fetch(`http://localhost:3000/api/v1/search?${params}`);
  const data = await response.json();

  // Filter only papers with PDF
  const withPdf = data.data.results.filter(r => r.pdfUrl !== null);

  return withPdf;
};
```

---

## 🚨 Error Handling

### Common Errors

#### 1. Missing Query

```json
{
  "success": false,
  "message": "Search query is required (use ?q= or ?query=)"
}
```

**Solution:** Pastikan parameter `q` atau `query` diberikan.

---

#### 2. Validation Error

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "limit": ["Limit must be between 1 and 50"],
    "year": ["Year must be a 4-digit number"]
  }
}
```

**Solution:** Perbaiki parameter yang tidak valid.

---

#### 3. Search Failed

```json
{
  "success": false,
  "message": "Search failed"
}
```

**Solution:** Coba lagi atau cek status dengan `/search/health`.

---

## 🔧 TypeScript Interface

```typescript
// Search Result Interface
interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  authors: string[];
  year: number | null;
  source: 'internal' | 'openalex' | 'scholar';
  type: 'article' | 'paper' | 'preprint' | 'journal-article';
  link: string;
  pdfUrl: string | null;
  citations: number;
  isOpenAccess: boolean;
  publisher: string | null;
  doi: string | null;
  language: string | null;
}

// Search Response Interface
interface SearchResponse {
  success: boolean;
  query: string;
  data: {
    results: SearchResult[];
    meta: {
      total: number;
      page: number;
      limit: number;
      sources: {
        internal: number;
        openalex: number;
        scholar: number;
      };
      scholarUsed: boolean;
      searchTime: string;
    };
  };
}

// Search Function
async function search(
  query: string,
  options?: {
    sources?: 'auto' | 'internal' | 'openalex' | 'scholar' | 'all';
    useScholar?: boolean;
    page?: number;
    limit?: number;
    year?: number;
    openAccess?: boolean;
    language?: string;
  }
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    ...Object.fromEntries(
      Object.entries(options || {}).map(([k, v]) => [k, String(v)])
    )
  });

  const response = await fetch(`/api/v1/search?${params}`);
  return response.json();
}
```

---

## 📊 Performance Tips

### 1. Use `sources=internal` for Fast Search

Jika hanya perlu artikel internal, gunakan `sources=internal` untuk response paling cepat (~200-500ms).

```javascript
GET /search?q=teknologi&sources=internal
```

---

### 2. Cache Results di Frontend

Simpan hasil pencarian di state atau localStorage untuk menghindari request berulang.

```javascript
const cache = new Map();

async function cachedSearch(query) {
  if (cache.has(query)) {
    return cache.get(query);
  }

  const result = await fetch(`/api/v1/search?q=${query}`);
  const data = await result.json();

  cache.set(query, data);
  return data;
}
```

---

### 3. Debounce Search Input

Gunakan debounce untuk menghindari terlalu banyak request saat user mengetik.

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const response = await fetch(`/api/v1/search?q=${query}`);
  const data = await response.json();
  // Update UI
}, 300);

// Usage
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

---

### 4. Progressive Loading

Tampilkan hasil internal dulu, lalu external:

```javascript
async function progressiveSearch(query) {
  // 1. Fetch internal first (fast)
  const internalPromise = fetch(`/api/v1/search?q=${query}&sources=internal`);

  // 2. Show internal results immediately
  const internalData = await internalPromise;
  updateUI(internalData.data.results);

  // 3. Fetch external in background
  const externalData = await fetch(`/api/v1/search?q=${query}&sources=openalex`);
  updateUI([...internalData.data.results, ...externalData.data.results]);
}
```

---

## 🔐 Environment Configuration

Pastikan backend sudah dikonfigurasi dengan benar di `.env`:

```env
# OpenAlex API (GRATIS)
OPENALEX_API_URL=https://api.openalex.org
OPENALEX_TIMEOUT=10000

# SerpAPI - Google Scholar (BERBAYAR, opsional)
SERPAPI_KEY=your-serpapi-key-here
SERPAPI_ENABLED=false  # Set true untuk enable Scholar
SERPAPI_TIMEOUT=10000

# Search Configuration
SEARCH_MIN_RESULTS=5  # Minimal hasil sebelum fallback ke Scholar
```

---

🎉 Testing Search API - SELESAI!
Semua testing berhasil dilakukan! Berikut ringkasan hasil testing:
✅ Yang Berhasil Ditest:
Registration & Authentication
User berhasil register: tiko.test@scory.app
Token JWT berhasil didapatkan
Health Check Endpoint (GET /search/health)
Status: ✅ Healthy
Database: Connected
OpenAlex: Available
Scholar: Available (tapi disabled)
Search Endpoints: a) Auto Search (default, recommended)
Query: "machine learning"
Hasil: 20 artikel dari OpenAlex
Speed: ~2.5s
b) Internal Only
Query: "teknologi", "kesehatan"
Hasil: 0 (database masih kosong untuk keyword ini)
Speed: ~0.18s (sangat cepat!)
c) OpenAlex dengan Filters
Query: "covid"
Filters: year=2023, openAccess=true, limit=10
Hasil: 10 artikel open access tahun 2023
Speed: ~2.2s
d) Pagination
Query: "artificial intelligence"
Page: 2, Limit: 5
Hasil: 1 artikel (ada 1 artikel internal tentang AI!)
Total: 6 hasil (1 internal + 5 openalex)
Validation:
✅ Empty query → Error validation
✅ Limit > 50 → Error validation
✅ Parameter query bekerja sebagai alternatif q
🔧 Yang Diperbaiki:
Route Registration - Search route belum terdaftar di [index.ts](e:\01_KULIAH\SEMESTER 5\Pengembangan Aplikasi Bergerak\scory\scory-backend\src\routes\index.ts:34)
Added: import searchRoute from './searchRoute'
Added: router.use('/search', searchRoute)
📊 Performance Summary:
Source Strategy	Speed	Cost	Results Quality
internal	~0.2s	Free	Best for local content
openalex	~2.0s	Free	Great for academic papers
auto	~2.5s	Free	Smart fallback strategy
🎯 Rekomendasi:
Untuk production: Gunakan sources=auto (default) - balance antara speed, cost, dan hasil
Untuk fast search: Gunakan sources=internal jika cukup artikel internal
Untuk research: Gunakan sources=openalex dengan filter openAccess=true untuk paper gratis
API sudah siap digunakan! 🚀

## ❓ FAQ

### Q: Apa bedanya `sources=auto` dan `sources=all`?

**A:**
- `auto`: Cari DB + OpenAlex dulu, Scholar hanya jika hasil < 5 (hemat)
- `all`: Langsung cari semua (DB + OpenAlex + Scholar) secara paralel

---

### Q: Apakah Google Scholar berbayar?

**A:** Ya, Google Scholar menggunakan SerpAPI yang berbayar. Defaultnya dimatikan (`SERPAPI_ENABLED=false`). OpenAlex gratis dan tidak perlu API key.

---

### Q: Bagaimana cara sorting hasil?

**A:** Hasil otomatis di-sort berdasarkan relevance score yang mempertimbangkan:
- Title match
- Excerpt match
- Source priority (internal > scholar > openalex)
- Citation count
- Publication year (recent = higher)
- Open access status

---

### Q: Apakah bisa search dalam bahasa Indonesia?

**A:** Ya! Database internal mendukung pencarian dalam bahasa Indonesia. OpenAlex dan Scholar kebanyakan bahasa Inggris, tapi bisa dicoba.

---

## 📞 Support

Jika ada masalah atau pertanyaan:
- Cek health endpoint: `GET /api/v1/search/health`
- Lihat logs di backend console
- Report issue di GitHub repository

---

**Happy Searching! 🚀**
