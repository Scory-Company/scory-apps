# AI Academic Paper Simplification - Backend Request

## Overview

Request untuk implementasi fitur **AI-powered simplification** untuk academic papers dari Google Scholar. Fitur ini akan mengubah paper akademik yang kompleks menjadi versi yang lebih mudah dipahami sesuai reading level user (Beginner, Intermediate, Advanced).

---

## 🎯 Problem Statement

**Challenge:**
- Academic papers dari Google Scholar sangat teknis dan sulit dipahami
- User dengan berbagai level pemahaman perlu versi yang sesuai
- Processing AI mahal jika dilakukan setiap request
- Perlu strategi caching untuk optimize cost

**Solution:**
- Lazy processing: Hanya process saat user request
- Smart caching: Save hasil AI ke database
- Progressive processing: Process one level at a time
- Cache hit rate target: 80%+

---

## 🏗️ Database Schema

### Table: `academic_papers`

```sql
CREATE TABLE academic_papers (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Google Scholar Metadata
  scholar_id VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[], -- Array of author names
  abstract TEXT,
  publication_year INTEGER,
  publication_info TEXT, -- "Journal Name, Year"
  cited_by INTEGER DEFAULT 0,
  pdf_url TEXT,
  scholar_link TEXT,

  -- Simplified Versions (stored as JSON)
  simplified_versions JSONB DEFAULT '{}',
  /* Example structure:
  {
    "beginner": {
      "title": "Simple title version",
      "summary": "Easy to understand summary...",
      "key_points": [
        "Main point 1 in simple language",
        "Main point 2 in simple language",
        "Main point 3 in simple language"
      ],
      "glossary": {
        "term1": "definition",
        "term2": "definition"
      },
      "processed_at": "2025-11-27T10:00:00.000Z",
      "ai_model": "gpt-4o-mini",
      "tokens_used": 500
    },
    "intermediate": {
      "title": "...",
      "summary": "...",
      "key_points": [...],
      "methodology": "Brief explanation of methods",
      "results": "Key findings",
      "processed_at": "2025-11-27T10:00:00.000Z",
      "ai_model": "gpt-4o-mini",
      "tokens_used": 800
    },
    "advanced": {
      "title": "Original technical title",
      "summary": "Full technical summary",
      "key_points": [...],
      "methodology": "Detailed methodology",
      "results": "Comprehensive results",
      "implications": "Research implications",
      "processed_at": "2025-11-27T10:00:00.000Z",
      "ai_model": "gpt-4o-mini",
      "tokens_used": 1200
    }
  }
  */

  -- Processing Status
  is_processed BOOLEAN DEFAULT false,
  processing_status VARCHAR(50) DEFAULT 'pending',
  -- Values: 'pending', 'processing', 'completed', 'failed'
  processing_error TEXT,

  -- Cache Statistics
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,

  -- AI Processing Metadata
  total_tokens_used INTEGER DEFAULT 0,
  total_ai_cost DECIMAL(10,6) DEFAULT 0, -- In USD

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_scholar_id ON academic_papers(scholar_id);
CREATE INDEX idx_access_count ON academic_papers(access_count DESC);
CREATE INDEX idx_is_processed ON academic_papers(is_processed);
CREATE INDEX idx_processing_status ON academic_papers(processing_status);
CREATE INDEX idx_created_at ON academic_papers(created_at DESC);

-- Full-text search on title
CREATE INDEX idx_title_search ON academic_papers USING gin(to_tsvector('english', title));
```

### Table: `simplification_requests` (Analytics)

```sql
CREATE TABLE simplification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Request Info
  user_id UUID REFERENCES users(id),
  academic_paper_id UUID REFERENCES academic_papers(id),
  scholar_id VARCHAR(255),
  reading_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'

  -- Response Info
  from_cache BOOLEAN DEFAULT false,
  processing_time_ms INTEGER,

  -- AI Info (if not from cache)
  ai_model VARCHAR(50),
  tokens_used INTEGER,
  ai_cost DECIMAL(10,6),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_id ON simplification_requests(user_id);
CREATE INDEX idx_academic_paper_id ON simplification_requests(academic_paper_id);
CREATE INDEX idx_created_at_req ON simplification_requests(created_at DESC);
CREATE INDEX idx_from_cache ON simplification_requests(from_cache);
```

---

## 🔌 API Endpoints

### 1. **POST /api/v1/academic/simplify**

Simplify academic paper untuk specific reading level.

#### Request Body

```json
{
  "scholar_id": "abc123xyz",
  "reading_level": "beginner",
  "force_refresh": false
}
```

**Parameters:**
- `scholar_id` (required): Google Scholar result ID
- `reading_level` (required): "beginner" | "intermediate" | "advanced"
- `force_refresh` (optional): Force re-process dengan AI (ignore cache)

#### Success Response (200 OK)

**From Cache:**
```json
{
  "success": true,
  "data": {
    "title": "Understanding Machine Learning in Simple Terms",
    "summary": "Machine learning adalah cara komputer belajar dari data tanpa diprogram secara eksplisit. Bayangkan seperti anak kecil yang belajar mengenali kucing dari melihat banyak gambar kucing...",
    "key_points": [
      "Komputer belajar dari contoh (data)",
      "Semakin banyak data, semakin pintar",
      "Digunakan di banyak aplikasi sehari-hari seperti rekomendasi YouTube"
    ],
    "glossary": {
      "Algorithm": "Langkah-langkah yang diikuti komputer untuk menyelesaikan masalah",
      "Training": "Proses mengajari komputer dengan memberikan banyak contoh"
    }
  },
  "metadata": {
    "from_cache": true,
    "cached_at": "2025-11-27T10:00:00.000Z",
    "reading_level": "beginner",
    "processing_time_ms": 45,
    "scholar_info": {
      "title": "Machine Learning: Trends, perspectives, and prospects",
      "authors": ["MI Jordan", "TM Mitchell"],
      "year": 2015,
      "citations": 13278
    }
  }
}
```

**Freshly Processed (AI):**
```json
{
  "success": true,
  "data": {
    "title": "...",
    "summary": "...",
    "key_points": [...]
  },
  "metadata": {
    "from_cache": false,
    "processed_at": "2025-11-27T10:05:30.000Z",
    "reading_level": "beginner",
    "processing_time_ms": 3450,
    "ai_model": "gpt-4o-mini",
    "tokens_used": 500,
    "estimated_cost_usd": 0.001,
    "scholar_info": {
      "title": "...",
      "authors": [...],
      "year": 2015,
      "citations": 13278
    }
  }
}
```

#### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_READING_LEVEL",
    "message": "Reading level must be one of: beginner, intermediate, advanced"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "PAPER_NOT_FOUND",
    "message": "Academic paper with scholar_id 'abc123' not found"
  }
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded your daily limit of 20 simplifications. Please try again tomorrow.",
    "retry_after": 43200
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "AI_PROCESSING_FAILED",
    "message": "Failed to process paper with AI. Please try again.",
    "details": "OpenAI API timeout"
  }
}
```

---

### 2. **GET /api/v1/academic/:scholar_id**

Get academic paper details with cached simplifications (if any).

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "scholar_id": "abc123xyz",
    "title": "Machine Learning: Trends, perspectives, and prospects",
    "authors": ["MI Jordan", "TM Mitchell"],
    "abstract": "Original abstract text...",
    "publication_year": 2015,
    "publication_info": "Science, 2015",
    "cited_by": 13278,
    "pdf_url": "https://...",
    "scholar_link": "https://scholar.google.com/...",

    "available_levels": ["beginner", "intermediate"],
    "simplified_versions": {
      "beginner": {
        "title": "...",
        "summary": "...",
        "processed_at": "2025-11-27T10:00:00.000Z"
      },
      "intermediate": {
        "title": "...",
        "summary": "...",
        "processed_at": "2025-11-27T10:05:00.000Z"
      }
    },

    "stats": {
      "access_count": 145,
      "last_accessed_at": "2025-11-27T14:30:00.000Z"
    },

    "created_at": "2025-11-25T08:00:00.000Z",
    "updated_at": "2025-11-27T10:05:00.000Z"
  }
}
```

---

### 3. **GET /api/v1/academic/popular**

Get most accessed academic papers (for pre-caching).

#### Query Parameters

- `limit` (optional): Number of results (default: 20, max: 100)

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "papers": [
      {
        "scholar_id": "abc123",
        "title": "...",
        "authors": [...],
        "cited_by": 13278,
        "access_count": 245,
        "available_levels": ["beginner", "intermediate", "advanced"],
        "last_accessed_at": "2025-11-27T14:30:00.000Z"
      }
    ],
    "total": 1523
  }
}
```

---

## 🤖 AI Processing Logic

### AI Provider: OpenAI GPT-4o-mini

**Why GPT-4o-mini:**
- ✅ Cheap: ~$0.15 per 1M input tokens
- ✅ Fast: ~1-3 seconds response time
- ✅ Good quality for summarization
- ✅ Supports Indonesian language

**Alternative:** Claude 3 Haiku (backup)

### Prompt Templates

#### **Beginner Level:**

```
System: You are an expert at explaining complex academic concepts in simple, easy-to-understand language for beginners.

User:
Sederhanakan paper akademik berikut untuk pembaca pemula yang tidak memiliki background teknis.

RULES:
1. Gunakan bahasa Indonesia yang sangat sederhana
2. Hindari jargon teknis, atau jelaskan dengan analogi sederhana
3. Maksimal 3 paragraf (300 kata)
4. Fokus pada "apa" dan "mengapa", bukan "bagaimana" teknis
5. Gunakan analogi dari kehidupan sehari-hari

PAPER INFO:
Title: {title}
Authors: {authors}
Abstract: {abstract}
Year: {year}

FORMAT OUTPUT (JSON):
{
  "title": "Judul yang disederhanakan (maksimal 10 kata)",
  "summary": "Ringkasan dalam 3 paragraf, bahasa sangat sederhana",
  "key_points": [
    "Poin penting 1 dalam satu kalimat sederhana",
    "Poin penting 2 dalam satu kalimat sederhana",
    "Poin penting 3 dalam satu kalimat sederhana"
  ],
  "glossary": {
    "istilah_teknis_1": "penjelasan sederhana",
    "istilah_teknis_2": "penjelasan sederhana"
  }
}
```

#### **Intermediate Level:**

```
System: You are an academic summarizer for intermediate readers with some technical background.

User:
Buat ringkasan paper akademik berikut untuk pembaca menengah yang sudah familiar dengan konsep dasar.

RULES:
1. Gunakan bahasa Indonesia yang jelas
2. Boleh gunakan istilah teknis tapi berikan konteks
3. Maksimal 5 paragraf (500 kata)
4. Fokus pada metodologi dan hasil utama
5. Sertakan implikasi praktis

PAPER INFO:
Title: {title}
Authors: {authors}
Abstract: {abstract}
Year: {year}

FORMAT OUTPUT (JSON):
{
  "title": "Judul ringkasan (maksimal 15 kata)",
  "summary": "Ringkasan dalam 5 paragraf",
  "key_points": [
    "Poin penting 1",
    "Poin penting 2",
    "Poin penting 3",
    "Poin penting 4"
  ],
  "methodology": "Penjelasan singkat metodologi yang digunakan",
  "results": "Hasil utama penelitian"
}
```

#### **Advanced Level:**

```
System: You are an academic summarizer for expert readers.

User:
Buat ringkasan teknis paper akademik berikut untuk pembaca ahli.

RULES:
1. Gunakan terminologi teknis yang tepat
2. Maksimal 7 paragraf (800 kata)
3. Fokus pada metodologi detail, hasil, dan implikasi teoritis
4. Sertakan limitasi penelitian
5. Bahasa formal akademik

PAPER INFO:
Title: {title}
Authors: {authors}
Abstract: {abstract}
Year: {year}

FORMAT OUTPUT (JSON):
{
  "title": "Judul teknis lengkap",
  "summary": "Ringkasan teknis dalam 7 paragraf",
  "key_points": [
    "Kontribusi utama penelitian",
    "Metodologi kunci",
    "Hasil utama",
    "Implikasi teoritis",
    "Limitasi"
  ],
  "methodology": "Penjelasan detail metodologi",
  "results": "Hasil komprehensif",
  "implications": "Implikasi untuk penelitian masa depan",
  "limitations": "Limitasi penelitian"
}
```

---

## 💰 Cost Optimization Strategies

### 1. **Progressive Processing**

```javascript
// DON'T: Process all levels at once
await processAllLevels(paper); // Costs 3x

// DO: Process only requested level
if (!paper.simplified_versions[level]) {
  await processLevel(paper, level); // Cost 1x
}
```

### 2. **Smart Caching**

```javascript
// Check cache first
const cached = await getCachedSimplification(scholar_id, level);
if (cached) {
  return cached; // FREE!
}

// Only process if not cached
const result = await processWithAI(paper, level);
await saveToCache(scholar_id, level, result);
return result;
```

### 3. **Pre-processing Popular Papers**

```javascript
// Cron job: Every night at 2 AM
async function preProcessPopularPapers() {
  const popular = await db.academic_papers
    .where('access_count', '>=', 10)
    .where('is_processed', false)
    .limit(50);

  for (const paper of popular) {
    // Process all levels for popular papers
    await processAllLevels(paper);
  }
}
```

### 4. **Rate Limiting**

```javascript
// Per user per day
const DAILY_LIMIT = 20;

// Check user's request count today
const requestsToday = await countUserRequests(userId, 'today');
if (requestsToday >= DAILY_LIMIT) {
  throw new RateLimitError();
}
```

---

## 📊 Cost Estimation

### Pricing (OpenAI GPT-4o-mini)

- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens

### Average Paper Processing

- **Input tokens:** ~500 (abstract + metadata)
- **Output tokens:** ~300-1000 (depending on level)
- **Cost per request:** ~$0.0007 - $0.002

### Monthly Cost Projections

#### Scenario 1: 1000 users, 10 papers each, 80% cache hit

```
Total requests: 10,000
Cache hits: 8,000 (FREE)
AI processing: 2,000 × $0.001 = $2/month
```

#### Scenario 2: 5000 users, 20 papers each, 70% cache hit

```
Total requests: 100,000
Cache hits: 70,000 (FREE)
AI processing: 30,000 × $0.001 = $30/month
```

#### Scenario 3: Without caching (worst case)

```
Total requests: 100,000
AI processing: 100,000 × $0.001 = $100/month
```

**Savings with caching:** 70-80% cost reduction! 🎉

---

## 📈 Analytics & Monitoring

### Key Metrics to Track

```sql
-- 1. Cache Hit Rate
SELECT
  COUNT(*) FILTER (WHERE from_cache = true) * 100.0 / COUNT(*) AS cache_hit_rate
FROM simplification_requests
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 2. Daily AI Costs
SELECT
  DATE(created_at) as date,
  SUM(ai_cost) as daily_cost,
  COUNT(*) as requests,
  AVG(processing_time_ms) as avg_processing_time
FROM simplification_requests
WHERE from_cache = false
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 3. Popular Papers (for pre-caching)
SELECT
  scholar_id,
  title,
  access_count,
  array_length(array_remove(ARRAY[
    CASE WHEN simplified_versions ? 'beginner' THEN 'beginner' END,
    CASE WHEN simplified_versions ? 'intermediate' THEN 'intermediate' END,
    CASE WHEN simplified_versions ? 'advanced' THEN 'advanced' END
  ], NULL), 1) as cached_levels
FROM academic_papers
WHERE access_count > 5
ORDER BY access_count DESC
LIMIT 50;

-- 4. Reading Level Distribution
SELECT
  reading_level,
  COUNT(*) as requests,
  AVG(processing_time_ms) as avg_time
FROM simplification_requests
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY reading_level;
```

---

## 🔐 Security & Best Practices

### 1. **API Key Protection**

```javascript
// Environment variables (NEVER commit to git)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

// Use from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

### 2. **Rate Limiting**

```javascript
// Per user
app.use('/api/v1/academic/simplify', userRateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // Max 20 requests per day
}));

// Global (prevent abuse)
app.use('/api/v1/academic/*', globalRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Max 100 requests per minute
}));
```

### 3. **Input Validation**

```javascript
const schema = Joi.object({
  scholar_id: Joi.string().required().max(255),
  reading_level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  force_refresh: Joi.boolean().optional()
});
```

### 4. **Error Handling**

```javascript
try {
  const result = await processWithAI(paper, level);
  return result;
} catch (error) {
  if (error instanceof OpenAIError) {
    // Log to monitoring
    logger.error('OpenAI API error', { error, paper_id });

    // Return cached version if available
    if (oldCache) return oldCache;

    // Or throw user-friendly error
    throw new AIProcessingError('Failed to simplify paper');
  }
}
```

---

## 🚀 Implementation Phases

### Phase 1: Basic Infrastructure (Week 1)

- [ ] Create database tables
- [ ] Setup OpenAI API integration
- [ ] Implement basic caching logic
- [ ] Create `/simplify` endpoint

### Phase 2: AI Processing (Week 2)

- [ ] Implement prompt templates for all levels
- [ ] Test AI output quality
- [ ] Add error handling
- [ ] Implement rate limiting

### Phase 3: Optimization (Week 3)

- [ ] Add analytics tracking
- [ ] Implement pre-processing cron job
- [ ] Optimize cache hit rate
- [ ] Monitor costs

### Phase 4: Polish (Week 4)

- [ ] Add fallback AI provider (Claude)
- [ ] Improve error messages
- [ ] Add admin dashboard for monitoring
- [ ] Documentation & testing

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] Cache hit returns correct data
- [ ] Cache miss triggers AI processing
- [ ] Rate limiting works
- [ ] Input validation
- [ ] Error handling

### Integration Tests

- [ ] End-to-end simplification flow
- [ ] Database save/retrieve
- [ ] OpenAI API integration
- [ ] Multiple concurrent requests

### Performance Tests

- [ ] Response time < 3s for AI processing
- [ ] Response time < 500ms for cached
- [ ] Handle 100 concurrent requests
- [ ] Database query optimization

### User Acceptance Tests

- [ ] Beginner summary is truly simple
- [ ] Intermediate has good balance
- [ ] Advanced is technically accurate
- [ ] Indonesian language quality

---

## 📝 Frontend Integration Example

```typescript
// services/academicSimplify.ts
export const academicSimplifyApi = {
  simplify: async (scholarId: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    const response = await api.post('/academic/simplify', {
      scholar_id: scholarId,
      reading_level: level
    });
    return response.data;
  }
};

// Usage in component
const handleSimplify = async (level: string) => {
  setLoading(true);
  try {
    const result = await academicSimplifyApi.simplify(paperId, level);

    setSimplified(result.data);

    // Show cache indicator
    if (result.metadata.from_cache) {
      Toast.show('⚡ Loaded from cache (instant!)');
    } else {
      Toast.show('✨ Freshly generated by AI');
    }
  } catch (error) {
    Toast.show('Failed to simplify paper');
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 Success Metrics

### Target KPIs

1. **Cache Hit Rate:** > 80%
2. **Average Response Time (cached):** < 500ms
3. **Average Response Time (AI):** < 3s
4. **Monthly AI Cost:** < $50 for 10k users
5. **User Satisfaction:** > 4.5/5 stars
6. **Error Rate:** < 1%

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** High AI costs
**Solution:** Check cache hit rate, implement pre-processing for popular papers

**Issue:** Slow response times
**Solution:** Optimize database queries, add indexes, use connection pooling

**Issue:** AI output quality inconsistent
**Solution:** Refine prompts, add temperature control, implement output validation

**Issue:** Rate limit errors
**Solution:** Adjust limits, add user tiers, implement queuing system

---

## 📚 References

- **OpenAI API:** https://platform.openai.com/docs/api-reference
- **Claude API:** https://docs.anthropic.com/
- **Best Practices:** https://platform.openai.com/docs/guides/prompt-engineering

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** 📋 Planning / Ready for Implementation
**Priority:** 🔴 HIGH (Core Feature)
**Estimated Effort:** 4 weeks
**Cost Impact:** Medium (~$30-50/month for 10k users)

---

## 💡 Future Enhancements

1. **Multi-language Support:** English, Indonesian, Chinese
2. **Audio Summaries:** Text-to-speech untuk "dengarkan ringkasan"
3. **Visual Summaries:** Generate infographics dari key points
4. **Comparison Mode:** Compare multiple papers side-by-side
5. **Citation Network:** Show related papers and citation graph
6. **Export:** Download simplified version as PDF
7. **Sharing:** Share simplified version dengan teman

---

**Next Steps:**
1. Review documentation dengan team
2. Get approval dari dosen/supervisor
3. Setup OpenAI account & API key
4. Start Phase 1 implementation
5. Create proof of concept (1-2 papers)
6. Demo to stakeholders
7. Full implementation

Good luck dengan implementation! 🚀
