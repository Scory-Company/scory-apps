# 🚀 Quick API Request Summary

**Status:** ⏳ Menunggu Backend Implementation
**Priority:** 🔴 HIGH
**Date:** 2025-12-04

---

## TL;DR

Frontend sudah implement fitur **re-simplify artikel ke reading level berbeda**, tapi butuh **2 endpoint baru** dari backend:

1. ✅ `POST /api/v1/simplify/{articleId}/resimplify` - Re-generate content ke level baru
2. ✅ `GET /api/v1/articles/by-id/{id}` - Fetch article by ID (fallback)

---

## Problem

User simplify paper → dapat level EXPERT only.
User preference → STUDENT level.
Result → User harus baca level yang terlalu sulit ❌

**Solution:** User klik 1 button → artikel di-generate ulang ke level STUDENT ✅

---

## API 1: Re-Simplify Article

### Request:
```http
POST /api/v1/simplify/123e4567-e89b-12d3-a456-426614174000/resimplify
Content-Type: application/json
Authorization: Bearer {token}

{
  "readingLevel": "STUDENT"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "articleId": "123e4567-e89b-12d3-a456-426614174000",
    "isNewSimplification": true,
    "content": [...],
    "quiz": [...],
    "insights": [...],
    "metadata": {
      "readingLevel": "STUDENT",
      "processingTime": 25000
    }
  }
}
```

### Logic:
1. Check if `readingLevel` already exists → return cached
2. If not → generate new content with AI
3. Save to database
4. Return result

---

## API 2: Get Article By ID

### Request:
```http
GET /api/v1/articles/by-id/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {token}
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Article Title",
    "slug": "article-slug",
    "contents": [
      {
        "readingLevel": "EXPERT",
        "blocks": [...]
      },
      {
        "readingLevel": "STUDENT",
        "blocks": [...]
      }
    ]
  }
}
```

### Logic:
Same as `GET /api/v1/articles/{slug}` tapi pakai ID instead of slug.

---

## Database Schema

```sql
-- Add if not exists
CREATE TABLE article_contents (
  id UUID PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id),
  reading_level VARCHAR(20) NOT NULL,
  blocks JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, reading_level)
);

CREATE INDEX idx_article_contents_article_level
ON article_contents(article_id, reading_level);
```

---

## Frontend Implementation

**Already done!** ✅

- Auto-detect level mismatch
- Show banner: "Student level not available"
- Button: "Generate Student"
- Loading state while processing
- Auto-reload after success

**Frontend code location:**
- Hook: `hooks/useResimplify.ts`
- UI: `app/article/[slug].tsx`
- API: `services/simplifyApi.ts`

---

## Testing Commands

```bash
# Test re-simplify
curl -X POST http://localhost:5000/api/v1/simplify/ARTICLE_ID/resimplify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"readingLevel": "STUDENT"}'

# Test get by ID
curl -X GET http://localhost:5000/api/v1/articles/by-id/ARTICLE_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Checklist untuk Backend

- [ ] Add `POST /simplify/:articleId/resimplify` endpoint
- [ ] Add `GET /articles/by-id/:id` endpoint
- [ ] Ensure `article_contents` table has `UNIQUE(article_id, reading_level)`
- [ ] Add caching logic (don't regenerate if level exists)
- [ ] Test with STUDENT, ACADEMIC, EXPERT levels
- [ ] Deploy to staging
- [ ] Notify frontend team when ready

---

## Expected Timeline

**Estimated:** 1-1.5 days
- Database migration: 1 hour
- Re-simplify endpoint: 4 hours
- Get by ID endpoint: 1 hour
- Testing: 3 hours
- Review & fixes: 2 hours

---

## Full Documentation

📄 Lihat dokumentasi lengkap: [RESIMPLIFY_AND_ARTICLE_BY_ID_API.md](./RESIMPLIFY_AND_ARTICLE_BY_ID_API.md)

---

**Questions?** Contact frontend team
**Updated:** 2025-12-04
