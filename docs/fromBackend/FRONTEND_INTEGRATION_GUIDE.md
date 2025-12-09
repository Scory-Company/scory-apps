# Scory API - Frontend Integration Guide

Panduan integrasi API Scory untuk Frontend Developer.

**Base URL:** `http://localhost:5000/api/v1`

---

## 🚀 Quick Start

### 1. Authentication Flow
```typescript
// Login
POST /auth/login
Body: { email: string, password: string }
Response: { success: true, data: { user: {...}, token: string } }

// Register
POST /auth/register
Body: { email: string, password: string, fullName: string }
Response: Same as login

// Setup Personalization (WAJIB setelah register/login pertama kali)
POST /personalization
Headers: { Authorization: "Bearer {token}" }
Body: {
  readingLevel: "SIMPLE" | "STUDENT" | "ACADEMIC" | "EXPERT",
  purpose: "curious" | "student" | "professional" | "researcher"
}
```

### 2. Search Papers
```typescript
// Unified Search
GET /search?q={query}&sources={source}&page={page}&limit={limit}

Query Params:
- q: string (search query)
- sources: "auto" | "internal" | "openalex" | "scholar" | "all" (default: auto)
- page: number (default: 1)
- limit: number (default: 20, max: 50)
- year: number (filter by year)
- openAccess: boolean
- language: string (2-letter code)

Response:
{
  success: true,
  query: "machine learning",
  data: {
    results: [
      {
        id: string,
        title: string,
        excerpt: string,
        authors: string[],
        year: number,
        source: "internal" | "openalex" | "scholar",
        citations: number,
        pdfUrl: string | null,
        doi: string | null,

        // ⭐ PENTING: Metadata untuk simplified papers
        metadata: {
          isSimplified: boolean,      // Sudah di-simplify atau belum?
          isExternal: boolean,         // Paper eksternal atau internal?
          articleId: string,           // ID artikel jika sudah simplified
          externalId: string,          // ID dari OpenAlex/Scholar
          externalSource: "openalex" | "scholar"
        }
      }
    ],
    meta: {
      total: number,
      page: number,
      limit: number,
      sources: { internal: 0, openalex: 5, scholar: 0 },
      scholarUsed: boolean,
      searchTime: "4.2s"
    }
  }
}
```

### 3. Simplification Flow

#### A. Check Cache (Optional tapi recommended)
```typescript
GET /simplify/check-cache/:externalId

// PENTING: externalId harus di-encode!
const encodedId = encodeURIComponent("https://openalex.org/W123");

Response (if cached):
{
  success: true,
  data: {
    isCached: true,
    articleId: "uuid",
    articleSlug: "paper-title-slug",
    availableLevels: ["SIMPLE", "STUDENT"],
    isPublished: true
  }
}

Response (if not cached):
{
  success: true,
  data: {
    isCached: false,
    externalId: "https://openalex.org/W123"
  }
}
```

#### B. Simplify Paper
```typescript
POST /simplify/external
Headers: { Authorization: "Bearer {token}" }
Body: {
  externalId: string,              // Required
  source: "openalex" | "scholar",  // Required
  title: string,                   // Required
  authors: string[],               // Required (1-50)
  year: number,                    // Required (1900-now)
  abstract?: string,               // Recommended
  pdfUrl?: string,                 // Recommended (untuk ekstraksi konten)
  doi?: string,
  landingPageUrl?: string,
  readingLevel?: "SIMPLE" | "STUDENT" | "ACADEMIC" | "EXPERT",  // Optional
  categoryName?: string            // Optional (auto-create jika tidak ada)
}

Response:
{
  success: true,
  message: "Paper simplified successfully",
  data: {
    articleId: "uuid",
    isNewSimplification: true,     // true = baru di-AI, false = dari cache
    isCached: false,
    content: [
      { type: "heading", data: { level: 1, text: "..." } },
      { type: "text", data: { text: "..." } },
      { type: "list", data: { style: "unordered", items: [...] } },
      { type: "quote", data: { text: "...", caption: "..." } },
      { type: "callout", data: { text: "...", variant: "info" } },
      { type: "divider", data: {} }
    ],
    quiz: [
      {
        question: string,
        options: string[],
        correctAnswer: string,       // "A", "B", "C", dll
        explanation: string
      }
    ],
    insights: [
      {
        title: string,
        content: string,
        icon: "lightbulb" | "rocket" | "star"
      }
    ],
    metadata: {
      extractionMethod: "pdf" | "html" | "abstract",
      aiCost: 0.078,               // USD
      processingTime: 22000,       // milliseconds
      readingLevel: "SIMPLE"
    }
  }
}
```

#### C. Get Simplified Article
```typescript
GET /simplify/:articleId?readingLevel={level}&includeQuiz={bool}&includeInsights={bool}
Headers: { Authorization: "Bearer {token}" }

Query Params:
- readingLevel: "SIMPLE" | "STUDENT" | "ACADEMIC" | "EXPERT" (default: user's preference)
- includeQuiz: "true" | "false" (default: false)
- includeInsights: "true" | "false" (default: false)

Response:
{
  success: true,
  data: {
    article: {
      id: string,
      title: string,
      slug: string,
      excerpt: string,
      authorName: string,
      imageUrl: string | null,
      readTimeMinutes: number,
      viewCount: number,
      isExternal: boolean,
      publishedAt: string,
      category: { id, name, slug }
    },
    content: [...],              // Array of ContentBlock
    quiz: [...],                 // If includeQuiz=true
    insights: [...],             // If includeInsights=true
    externalMetadata: {
      source: "openalex" | "scholar",
      externalId: string,
      doi: string,
      pdfUrl: string,
      year: number,
      extractionMethod: "pdf" | "html" | "abstract"
    },
    readingLevel: "SIMPLE"
  }
}
```

---

## 📦 TypeScript Types

```typescript
// types/scory-api.ts

export type ReadingLevel = 'SIMPLE' | 'STUDENT' | 'ACADEMIC' | 'EXPERT';
export type Purpose = 'curious' | 'student' | 'professional' | 'researcher';
export type ExternalSource = 'openalex' | 'scholar';

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  authors: string[];
  year: number | null;
  source: 'internal' | 'openalex' | 'scholar';
  type: 'article' | 'paper' | 'preprint' | 'review';
  link: string;
  pdfUrl: string | null;
  citations: number;
  isOpenAccess: boolean;
  doi: string | null;
  language: string;
  metadata?: {
    isSimplified: boolean;
    isExternal: boolean;
    articleId?: string;
    externalId?: string;
    externalSource?: ExternalSource;
  };
}

export interface ContentBlock {
  type: 'heading' | 'text' | 'list' | 'quote' | 'callout' | 'divider' | 'code';
  data: {
    // For heading
    level?: number;
    text?: string;

    // For list
    style?: 'ordered' | 'unordered';
    items?: string[];

    // For quote
    caption?: string;

    // For callout
    variant?: 'info' | 'warning' | 'success' | 'error';
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  order: number;
}

export interface Insight {
  id: string;
  title: string;
  content: string;
  icon: 'lightbulb' | 'rocket' | 'star';
  order: number;
}

export interface SimplifyExternalRequest {
  externalId: string;
  source: ExternalSource;
  title: string;
  authors: string[];
  year: number;
  abstract?: string;
  pdfUrl?: string;
  landingPageUrl?: string;
  doi?: string;
  readingLevel?: ReadingLevel;
  categoryName?: string;
}
```

---

## 💡 Implementation Examples

### 1. Search dengan Badge "Already Simplified"
```typescript
function SearchResultCard({ result }: { result: SearchResult }) {
  const isSimplified = result.metadata?.isSimplified;
  const articleId = result.metadata?.articleId;

  return (
    <div className="card">
      <h3>{result.title}</h3>
      <p>{result.excerpt}</p>
      <div className="meta">
        {result.authors.join(', ')} • {result.year} • {result.citations} citations
      </div>

      {/* Show badge jika sudah simplified */}
      {isSimplified && (
        <span className="badge badge-success">
          ✓ Already Simplified
        </span>
      )}

      {/* Button action */}
      {isSimplified ? (
        <button onClick={() => navigate(`/articles/${articleId}`)}>
          Read Simplified Version
        </button>
      ) : (
        <button onClick={() => handleSimplify(result)}>
          Simplify This Paper
        </button>
      )}
    </div>
  );
}
```

### 2. Simplify Workflow
```typescript
async function handleSimplify(result: SearchResult) {
  // 1. Check cache terlebih dahulu (optional tapi recommended)
  const encodedId = encodeURIComponent(result.id);
  const cacheCheck = await fetch(
    `${API_BASE}/simplify/check-cache/${encodedId}`
  );
  const cache = await cacheCheck.json();

  if (cache.data.isCached) {
    // Langsung navigate ke artikel
    navigate(`/articles/${cache.data.articleId}`);
    return;
  }

  // 2. Simplify paper
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE}/simplify/external`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        externalId: result.id,
        source: result.source,
        title: result.title,
        authors: result.authors,
        year: result.year,
        abstract: result.excerpt,
        pdfUrl: result.pdfUrl,
        doi: result.doi
      })
    });

    const data = await response.json();

    if (data.success) {
      showToast(
        data.data.isCached
          ? 'Paper already simplified!'
          : `Paper simplified in ${data.data.metadata.processingTime}ms!`
      );
      navigate(`/articles/${data.data.articleId}`);
    }
  } catch (error) {
    showToast('Failed to simplify paper', 'error');
  } finally {
    setLoading(false);
  }
}
```

### 3. Display Simplified Content
```typescript
function ArticleContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="article-content">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            const HeadingTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
            return <HeadingTag key={index}>{block.data.text}</HeadingTag>;

          case 'text':
            return <p key={index}>{block.data.text}</p>;

          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag key={index}>
                {block.data.items?.map((item, i) => <li key={i}>{item}</li>)}
              </ListTag>
            );

          case 'quote':
            return (
              <blockquote key={index}>
                {block.data.text}
                {block.data.caption && <cite>{block.data.caption}</cite>}
              </blockquote>
            );

          case 'callout':
            return (
              <div key={index} className={`callout callout-${block.data.variant}`}>
                {block.data.text}
              </div>
            );

          case 'divider':
            return <hr key={index} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
```

### 4. Quiz Component
```typescript
function QuizSection({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  return (
    <div className="quiz-section">
      <h2>Test Your Understanding</h2>
      {questions.map((q) => (
        <div key={q.id} className="quiz-question">
          <h4>{q.question}</h4>
          {q.options.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={q.id}
                value={option}
                onChange={() => handleAnswer(q.id, option)}
                disabled={showResults}
              />
              {option}
              {showResults && option === q.correctAnswer && ' ✓'}
            </label>
          ))}
          {showResults && answers[q.id] !== q.correctAnswer && (
            <div className="explanation">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}
      {!showResults && (
        <button onClick={checkAnswers}>Check Answers</button>
      )}
    </div>
  );
}
```

---

## ⚠️ Error Handling

```typescript
// Error Response Format
{
  success: false,
  message: string,
  error?: string,              // Detailed error
  errors?: Record<string, string[]>  // Validation errors
}

// Common Status Codes
// 400: Validation error
// 401: Unauthorized (token invalid/expired)
// 403: Forbidden
// 404: Not found
// 500: Server error

// Handling Example
async function apiCall(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return;
      }

      if (data.errors) {
        // Show validation errors
        Object.entries(data.errors).forEach(([field, messages]) => {
          showFieldError(field, messages[0]);
        });
      } else {
        showToast(data.message || 'An error occurred', 'error');
      }
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## 🎯 Workflow Lengkap

```
1. User Login/Register
   ↓
2. Setup Personalization (reading level & purpose)
   ↓
3. Search Papers
   ↓
4. Display Results dengan Badge "Already Simplified"
   ↓
5a. Jika sudah simplified → Navigate ke artikel
   ↓
5b. Jika belum simplified:
    - Check cache (optional)
    - Show "Simplify" button
    - Call simplify endpoint
    - Show loading state (proses ~20-30 detik)
    - Navigate ke artikel hasil simplifikasi
   ↓
6. Display Article:
   - Content blocks
   - Quiz (optional)
   - Insights (optional)
   - Reading level switcher
```

---

## 📝 Important Notes

1. **Token Management**: Simpan token di localStorage dan include di setiap request yang butuh auth
2. **URL Encoding**: External IDs untuk check-cache harus di-encode dengan `encodeURIComponent()`
3. **Loading States**: Simplifikasi butuh waktu 20-30 detik, pastikan ada loading indicator
4. **Category Auto-Create**: Category akan otomatis dibuat jika belum ada
5. **Cache**: Paper yang sudah di-simplify akan di-cache, tidak perlu AI lagi
6. **Reading Levels**: User bisa switch reading level di artikel yang sama
7. **Content in Bahasa Indonesia**: Semua konten hasil simplifikasi dalam Bahasa Indonesia

---

## 🔗 Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login user |
| POST | `/auth/register` | ❌ | Register user |
| POST | `/personalization` | ✅ | Setup reading preference |
| GET | `/search` | ✅ | Search papers |
| GET | `/simplify/check-cache/:id` | ❌ | Check if paper cached |
| POST | `/simplify/external` | ✅ | Simplify external paper |
| GET | `/simplify/:articleId` | ✅ | Get simplified article |
| GET | `/simplify/health` | ❌ | Health check |

---

**Need Help?** Check server logs untuk detailed error messages atau hubungi backend team.

Happy Coding! 🚀
