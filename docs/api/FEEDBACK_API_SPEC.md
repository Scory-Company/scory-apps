# Article Feedback API Specification

## Overview
API endpoint untuk menerima feedback dari user terhadap artikel. Feedback dapat dipicu dari 3 trigger point:
1. **Quiz Completion** - Setelah user menyelesaikan quiz
2. **Exit Intent** - Ketika user menekan tombol back (minimal reading time 10 detik)
3. **Manual** - User klik feedback card secara manual

---

## Endpoint

### Submit Article Feedback

**POST** `/api/v1/feedback/article`

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body

```typescript
{
  articleId: string;          // UUID artikel yang diberi feedback
  rating: number;             // Rating 1-5 (REQUIRED)
  quizRelevant?: boolean;     // Apakah quiz relevan? (Optional, hanya untuk quiz_completion)
  improvementText?: string;   // Saran perbaikan (Optional, max 500 karakter)
  trigger: "quiz_completion" | "exit_intent" | "manual";  // Trigger point
  quizScore?: number;         // Quiz score jika ada (Optional)
  readingTime?: number;       // Waktu baca dalam detik (Optional)
}
```

#### Request Body Examples

**Example 1: Quiz Completion (Full Feedback)**
```json
{
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "rating": 5,
  "quizRelevant": true,
  "improvementText": "The article was very clear and the quiz questions were spot on!",
  "trigger": "quiz_completion",
  "quizScore": 5,
  "readingTime": 180
}
```

**Example 2: Exit Intent (Quick Rating)**
```json
{
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "rating": 4,
  "trigger": "exit_intent",
  "readingTime": 120
}
```

**Example 3: Manual (From Feedback Card)**
```json
{
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "rating": 3,
  "improvementText": "Would be better with more examples",
  "trigger": "manual",
  "readingTime": 95
}
```

#### Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `articleId` | string (UUID) | ✅ Yes | Must be valid article UUID |
| `rating` | number | ✅ Yes | Integer between 1-5 |
| `quizRelevant` | boolean | ❌ No | - |
| `improvementText` | string | ❌ No | Max 500 characters |
| `trigger` | enum | ✅ Yes | Must be: "quiz_completion", "exit_intent", or "manual" |
| `quizScore` | number | ❌ No | Integer (quiz total correct answers) |
| `readingTime` | number | ❌ No | Positive integer (seconds) |

#### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "feedback-uuid-here",
    "articleId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-uuid-here",
    "rating": 5,
    "quizRelevant": true,
    "improvementText": "The article was very clear...",
    "trigger": "quiz_completion",
    "quizScore": 5,
    "readingTime": 180,
    "createdAt": "2025-12-17T10:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ]
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "success": false,
  "message": "Unauthorized. Please login."
}
```

**404 Not Found** - Article not found
```json
{
  "success": false,
  "message": "Article not found"
}
```

**409 Conflict** - Duplicate feedback (user already gave feedback for this article)
```json
{
  "success": false,
  "message": "You have already submitted feedback for this article"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Database Schema Recommendation

### Table: `article_feedback`

```sql
CREATE TABLE article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quiz_relevant BOOLEAN,
  improvement_text TEXT CHECK (LENGTH(improvement_text) <= 500),
  trigger VARCHAR(20) NOT NULL CHECK (trigger IN ('quiz_completion', 'exit_intent', 'manual')),
  quiz_score INTEGER,
  reading_time INTEGER CHECK (reading_time > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraint: One feedback per user per article
  CONSTRAINT unique_user_article_feedback UNIQUE (user_id, article_id)
);

-- Indexes for better query performance
CREATE INDEX idx_article_feedback_article_id ON article_feedback(article_id);
CREATE INDEX idx_article_feedback_user_id ON article_feedback(user_id);
CREATE INDEX idx_article_feedback_trigger ON article_feedback(trigger);
CREATE INDEX idx_article_feedback_created_at ON article_feedback(created_at DESC);
```

---

## Business Logic Requirements

### 1. **One Feedback Per User Per Article**
- User hanya bisa submit feedback 1x per artikel
- Jika user sudah pernah submit, return **409 Conflict**
- Frontend sudah handle ini dengan AsyncStorage tracking

### 2. **User Authentication Required**
- Endpoint ini harus **authenticated**
- Extract `userId` dari JWT token
- Jangan trust `userId` dari request body

### 3. **Article Validation**
- Validasi bahwa `articleId` exist di database
- Return **404** jika artikel tidak ditemukan

### 4. **Optional Fields Logic**
- `quizRelevant` biasanya hanya ada untuk `trigger: "quiz_completion"`
- `quizScore` biasanya hanya ada untuk `trigger: "quiz_completion"`
- `improvementText` bisa ada untuk semua trigger
- `readingTime` bisa ada untuk semua trigger

### 5. **Analytics Tracking** (Optional but Recommended)
Backend bisa track metrik berikut untuk analytics:
- Average rating per article
- Average rating per trigger type
- Feedback completion rate (berapa % user yang kasih feedback)
- Most common trigger point
- Average reading time before feedback

---

## Additional Endpoints (Optional - For Future Features)

### Get User's Feedback History
**GET** `/api/v1/feedback/my-feedback?page=1&limit=10`

Response:
```json
{
  "success": true,
  "data": {
    "feedbacks": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Check If User Has Given Feedback for Article
**GET** `/api/v1/feedback/article/:articleId/status`

Response:
```json
{
  "success": true,
  "data": {
    "hasFeedback": true,
    "feedback": {
      "id": "...",
      "rating": 5,
      "createdAt": "2025-12-17T10:30:00.000Z"
    }
  }
}
```

---

## Testing Checklist

- [ ] Can submit feedback after quiz completion
- [ ] Can submit feedback on exit intent
- [ ] Can submit feedback manually from card
- [ ] Cannot submit duplicate feedback (409 error)
- [ ] Invalid rating returns 400 error
- [ ] Unauthenticated request returns 401 error
- [ ] Invalid articleId returns 404 error
- [ ] improvementText > 500 chars returns 400 error
- [ ] Rating outside 1-5 range returns 400 error
- [ ] All optional fields can be omitted
- [ ] Database constraint prevents duplicate entries

---

## Notes for Backend Developer

1. **IMPORTANT**: Frontend menggunakan **mock data** saat ini (stored di AsyncStorage). Begitu endpoint ini ready, tinggal update `services/feedbackService.ts` untuk hit API real.

2. **Migration Path**: Frontend sudah siap production. Yang perlu diganti hanya 1 function di `services/feedbackService.ts`:

```typescript
// SEKARANG (Mock)
export const submitArticleFeedback = async (params) => {
  // Mock implementation with AsyncStorage
}

// NANTI (Real API)
export const submitArticleFeedback = async (params) => {
  const response = await api.post('/feedback/article', params);
  return response.data;
}
```

3. **Frontend sudah handle**:
   - Duplicate prevention (via AsyncStorage check)
   - Form validation
   - Error handling & toast notifications
   - Loading states
   - Retry logic

4. **Rate Limiting** (Recommended):
   Consider adding rate limiting:
   - Max 10 feedback submissions per user per day
   - Prevent spam/abuse

5. **Monitoring** (Recommended):
   - Log average response time
   - Track error rates by error type
   - Monitor feedback submission patterns

---

**Contact**: Frontend tim sudah ready, tinggal backend implement endpoint ini! 🚀
