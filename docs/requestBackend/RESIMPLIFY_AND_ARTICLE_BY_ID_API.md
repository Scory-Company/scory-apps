# 🔄 Re-Simplify & Article By ID API Request

## Overview
Request untuk menambahkan 2 endpoint baru untuk mendukung fitur re-simplify artikel ke reading level yang berbeda.

**Status:** ⏳ Menunggu implementasi backend
**Priority:** 🔴 HIGH - Fitur sudah diimplementasi di frontend
**Created:** 2025-12-04

---

## Problem Statement

### Current Issue:
Ketika user simplify paper dari Google Scholar/OpenAlex, artikel hanya tersedia dalam **1 reading level** (biasanya EXPERT).

Jika user preference adalah **STUDENT** level, mereka akan melihat:
```
⚠️ Fallback to EXPERT (STUDENT not found)
```

User terpaksa membaca konten yang terlalu sulit untuk level mereka.

### Desired Solution:
User dapat meng-generate ulang artikel ke reading level yang diinginkan dengan **1 klik button**.

---

## API Endpoints Required

### 1. Re-Simplify Article to Different Level

#### Endpoint:
```
POST /api/v1/simplify/{articleId}/resimplify
```

#### Description:
Re-generate simplified content untuk artikel yang sudah ada ke reading level yang berbeda.

#### Path Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `articleId` | String (UUID) | ✅ Yes | ID artikel yang akan di-re-simplify |

#### Request Headers:
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Request Body:
```json
{
  "readingLevel": "STUDENT"
}
```

**Field Details:**
| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `readingLevel` | String (Enum) | ✅ Yes | `SIMPLE`, `STUDENT`, `ACADEMIC`, `EXPERT` | Target reading level |

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "Article re-simplified successfully",
  "data": {
    "articleId": "123e4567-e89b-12d3-a456-426614174000",
    "isNewSimplification": true,
    "isCached": false,
    "content": [
      {
        "type": "heading",
        "data": {
          "level": 2,
          "text": "Introduction to the Study"
        }
      },
      {
        "type": "text",
        "data": {
          "text": "This research explores..."
        }
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is the main focus of this study?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "The study focuses on...",
        "order": 1
      }
    ],
    "insights": [
      {
        "id": "i1",
        "title": "Key Takeaway",
        "content": "This study demonstrates...",
        "icon": "lightbulb",
        "order": 1
      }
    ],
    "metadata": {
      "extractionMethod": "pdf",
      "aiCost": 0.05,
      "processingTime": 25000,
      "readingLevel": "STUDENT"
    }
  }
}
```

#### Error Responses:

**400 Bad Request - Invalid Reading Level:**
```json
{
  "success": false,
  "message": "Invalid reading level. Must be one of: SIMPLE, STUDENT, ACADEMIC, EXPERT",
  "error": "INVALID_READING_LEVEL"
}
```

**404 Not Found - Article Not Found:**
```json
{
  "success": false,
  "message": "Article not found",
  "error": "ARTICLE_NOT_FOUND"
}
```

**409 Conflict - Level Already Exists:**
```json
{
  "success": false,
  "message": "Article already has content for STUDENT level",
  "error": "LEVEL_ALREADY_EXISTS",
  "data": {
    "existingContentId": "abc-def-123"
  }
}
```
**Note:** This should still return 200 OK and return the existing content, not an error.

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to re-simplify article",
  "error": "SIMPLIFICATION_FAILED"
}
```

---

### 2. Get Article By ID

#### Endpoint:
```
GET /api/v1/articles/by-id/{id}
```

#### Description:
Fetch artikel menggunakan ID (UUID) instead of slug. Ini untuk fallback ketika artikel baru di-simplify dan belum punya slug.

#### Path Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String (UUID) | ✅ Yes | Article ID |

#### Request Headers:
```http
Authorization: Bearer {token}
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "Article retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Protist literacy: A novel concept of protist learning in higher education",
    "slug": "protist-literacy-novel-concept-2024",
    "excerpt": "This study introduces the concept of protist literacy...",
    "imageUrl": "https://example.com/image.jpg",
    "authorName": "John Doe et al.",
    "authorAvatar": null,
    "category": {
      "id": "cat-123",
      "name": "Education",
      "slug": "education"
    },
    "rating": 4.5,
    "totalRatings": 10,
    "viewCount": 250,
    "readTimeMinutes": 8,
    "publishedAt": "2024-12-04T10:00:00.000Z",
    "contents": [
      {
        "id": "content-123",
        "articleId": "123e4567-e89b-12d3-a456-426614174000",
        "readingLevel": "EXPERT",
        "blocks": [
          {
            "type": "heading",
            "data": {
              "level": 2,
              "text": "Introduction"
            }
          },
          {
            "type": "text",
            "data": {
              "text": "This research investigates..."
            }
          }
        ],
        "createdAt": "2024-12-04T10:00:00.000Z",
        "updatedAt": "2024-12-04T10:00:00.000Z"
      },
      {
        "id": "content-456",
        "articleId": "123e4567-e89b-12d3-a456-426614174000",
        "readingLevel": "STUDENT",
        "blocks": [
          {
            "type": "heading",
            "data": {
              "level": 2,
              "text": "Introduction"
            }
          },
          {
            "type": "text",
            "data": {
              "text": "This study looks at how students learn about protists..."
            }
          }
        ],
        "createdAt": "2024-12-04T10:15:00.000Z",
        "updatedAt": "2024-12-04T10:15:00.000Z"
      }
    ]
  }
}
```

#### Error Responses:

**404 Not Found:**
```json
{
  "success": false,
  "message": "Article not found",
  "error": "ARTICLE_NOT_FOUND"
}
```

---

## Implementation Details

### Backend Logic Flow

#### Re-Simplify Endpoint:

```mermaid
graph TD
    A[POST /simplify/:articleId/resimplify] --> B{Article exists?}
    B -->|No| C[Return 404]
    B -->|Yes| D{Level already exists?}
    D -->|Yes| E[Return existing content]
    D -->|No| F[Get original paper metadata]
    F --> G[Call AI service to generate content]
    G --> H[Parse & structure content]
    H --> I[Generate quiz questions]
    I --> J[Generate insights]
    J --> K[Save new content to DB]
    K --> L[Return success response]
```

#### Database Schema:

**Table: `article_contents`**
```sql
CREATE TABLE article_contents (
  id UUID PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id),
  reading_level VARCHAR(20) NOT NULL,
  blocks JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, reading_level)
);
```

**Note:** `UNIQUE(article_id, reading_level)` mencegah duplikat level untuk artikel yang sama.

---

## Testing

### Manual Test Cases

#### Test Case 1: Re-simplify to new level
```bash
# 1. Simplify a paper (will create EXPERT level)
curl -X POST http://localhost:5000/api/v1/simplify/external \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "externalId": "https://openalex.org/W2964146389",
    "source": "openalex",
    "title": "Test Paper",
    "authors": ["Author Name"],
    "year": 2024,
    "readingLevel": "EXPERT"
  }'

# Expected: Returns articleId with EXPERT content

# 2. Re-simplify to STUDENT level
curl -X POST http://localhost:5000/api/v1/simplify/{articleId}/resimplify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "readingLevel": "STUDENT"
  }'

# Expected: Returns same articleId with new STUDENT content
```

#### Test Case 2: Re-simplify to existing level
```bash
curl -X POST http://localhost:5000/api/v1/simplify/{articleId}/resimplify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "readingLevel": "EXPERT"
  }'

# Expected: Returns existing EXPERT content (no new generation)
```

#### Test Case 3: Get article by ID
```bash
curl -X GET http://localhost:5000/api/v1/articles/by-id/{articleId} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Returns article with all available reading levels
```

---

## Frontend Integration

### Current Implementation Status:
✅ **Frontend sudah ready!** Berikut yang sudah diimplementasi:

1. **Auto-detect level mismatch:**
   ```typescript
   const isViewingFallback = !isPreferredLevelAvailable &&
                             article?.contents &&
                             article.contents.length > 0;
   ```

2. **Banner UI dengan button:**
   ```tsx
   {isViewingFallback && (
     <Banner>
       <Text>Student level not available</Text>
       <Button onPress={handleResimplify}>
         Generate Student
       </Button>
     </Banner>
   )}
   ```

3. **Re-simplify function:**
   ```typescript
   const handleResimplify = async () => {
     const success = await resimplify(article.id, 'STUDENT');
     if (success) {
       await fetchArticle(); // Reload to show new content
     }
   };
   ```

4. **Loading state:**
   ```tsx
   {isResimplifying && (
     <Banner>
       <ActivityIndicator />
       <Text>Simplifying to STUDENT level...</Text>
       <Text>This may take 20-30 seconds...</Text>
     </Banner>
   )}
   ```

### Frontend Expectations:

**Request akan seperti ini:**
```typescript
POST /api/v1/simplify/123e4567-e89b-12d3-a456-426614174000/resimplify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "readingLevel": "STUDENT"
}
```

**Response yang diharapkan:**
```json
{
  "success": true,
  "data": {
    "articleId": "123e4567-e89b-12d3-a456-426614174000",
    "content": [...],
    "metadata": {
      "readingLevel": "STUDENT",
      "processingTime": 25000
    }
  }
}
```

Setelah itu, frontend akan:
1. Hide loading banner
2. Fetch article ulang: `GET /api/v1/articles/by-id/{articleId}`
3. Display content dengan STUDENT level

---

## Business Logic

### Reading Level Generation Strategy:

**Option 1: Generate on-demand (Recommended)**
- ✅ Lebih hemat AI cost
- ✅ User hanya bayar untuk level yang mereka pakai
- ❌ User harus wait 20-30 detik

**Option 2: Generate multiple levels upfront**
- ✅ User langsung bisa switch level
- ❌ Lebih mahal (4x AI cost per paper)
- ❌ Banyak level yang tidak terpakai

**Recommendation:** Start dengan Option 1, track usage, optimize nanti.

### Caching Strategy:

**Re-simplify result HARUS di-cache:**
```typescript
// Check if level already exists
const existingContent = await prisma.articleContent.findUnique({
  where: {
    articleId_readingLevel: {
      articleId: articleId,
      readingLevel: readingLevel
    }
  }
});

if (existingContent) {
  // Return cached content, don't generate again
  return existingContent;
}

// Generate new content...
```

---

## Performance Considerations

### Expected Load:
- **Simplify:** ~5-10 requests/minute
- **Re-simplify:** ~1-2 requests/minute
- **Processing time:** 20-30 seconds per request

### Optimization Tips:

1. **Queue system** untuk AI processing (e.g., Bull, BullMQ)
2. **Rate limiting** untuk prevent abuse
3. **Database indexing:**
   ```sql
   CREATE INDEX idx_article_contents_article_level
   ON article_contents(article_id, reading_level);
   ```

4. **Cache response** di Redis (optional)

---

## Error Handling

### Common Errors & Solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `ARTICLE_NOT_FOUND` | Article ID tidak ada di database | Return 404, frontend show error |
| `INVALID_READING_LEVEL` | Reading level bukan enum yang valid | Return 400, frontend validate input |
| `AI_SERVICE_ERROR` | AI service (OpenAI/Claude) error | Return 500, retry dengan exponential backoff |
| `TIMEOUT` | AI processing > 60 seconds | Return 504, queue untuk background processing |

---

## Monitoring & Logging

### Metrics to Track:

```typescript
// Log setiap request
logger.info('Re-simplify request', {
  articleId,
  targetLevel: readingLevel,
  userId: req.user.id,
  timestamp: new Date()
});

// Track processing time
const startTime = Date.now();
// ... AI processing ...
const processingTime = Date.now() - startTime;

logger.info('Re-simplify complete', {
  articleId,
  readingLevel,
  processingTime,
  aiCost: cost
});
```

### Alerts:
- ⚠️ Processing time > 45 seconds
- 🔴 Error rate > 10%
- 💰 AI cost > $X per day

---

## Migration & Rollback Plan

### Migration Steps:

1. **Add database migration:**
   ```sql
   -- If article_contents table doesn't exist
   CREATE TABLE IF NOT EXISTS article_contents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
     reading_level VARCHAR(20) NOT NULL CHECK (reading_level IN ('SIMPLE', 'STUDENT', 'ACADEMIC', 'EXPERT')),
     blocks JSONB NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(article_id, reading_level)
   );

   CREATE INDEX idx_article_contents_article_level
   ON article_contents(article_id, reading_level);
   ```

2. **Deploy API changes**
3. **Test with staging environment**
4. **Deploy to production**
5. **Enable frontend feature flag**

### Rollback Plan:

If issues occur:
1. Disable feature flag in frontend
2. Rollback API deployment
3. Keep database (data is safe)

---

## Timeline Estimate

| Task | Estimated Time |
|------|----------------|
| Database schema update | 1 hour |
| Re-simplify endpoint implementation | 4 hours |
| Get by ID endpoint implementation | 1 hour |
| Testing (unit + integration) | 3 hours |
| Code review & fixes | 2 hours |
| **Total** | **~1.5 days** |

---

## Questions for Backend Team

1. ✅ Apakah database sudah punya table `article_contents` dengan field `reading_level`?
2. ✅ Apakah AI service bisa handle multiple reading levels?
3. ✅ Berapa AI cost per simplification? (untuk calculate budget)
4. ✅ Apakah perlu rate limiting untuk prevent abuse?
5. ✅ Apakah perlu queue system untuk background processing?

---

## Contact

**Frontend Developer:** [Your Name]
**Issue:** Article Not Found after simplify
**Related Docs:**
- [DEBUG_SIMPLIFY.md](../DEBUG_SIMPLIFY.md)
- [RESIMPLIFY_FEATURE.md](../RESIMPLIFY_FEATURE.md)

---

**Last Updated:** 2025-12-04
**Status:** ⏳ Waiting for backend implementation
**Priority:** 🔴 HIGH
