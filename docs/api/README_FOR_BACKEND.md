# 📦 File Paket untuk Backend Developer

Halo Backend Team! 👋

Frontend sudah selesai implementasi **Article Feedback System** dengan mock data. Sekarang tinggal backend bikin endpoint-nya.

## 📁 File yang Perlu Dibaca

Kirim file-file ini ke backend developer:

### 1. **FEEDBACK_API_SPEC.md** ⭐ PALING PENTING
```
docs/api/FEEDBACK_API_SPEC.md
```

**Isi:**
- ✅ Endpoint specification lengkap (POST /api/v1/feedback/article)
- ✅ Request/Response format dengan examples
- ✅ Validation rules detail
- ✅ Database schema recommendation (PostgreSQL)
- ✅ Business logic requirements
- ✅ Error handling specification
- ✅ Testing checklist

**Baca file ini dulu!** Semua yang backend butuh ada di sini.

---

### 2. **feedback-types.ts** (Optional tapi Sangat Membantu)
```
docs/api/feedback-types.ts
```

**Isi:**
- ✅ TypeScript types untuk DTOs
- ✅ Database entity types
- ✅ Validation helpers
- ✅ Error messages constants
- ✅ Contoh NestJS decorators
- ✅ Contoh TypeORM entity

**Gunakan ini jika backend pakai TypeScript/NestJS!**

---

### 3. **feedback-postman-collection.json** (Untuk Testing)
```
docs/api/feedback-postman-collection.json
```

**Isi:**
- ✅ Postman/Insomnia collection siap pakai
- ✅ Sample requests untuk semua test cases
- ✅ Error testing scenarios

**Import ke Postman/Insomnia untuk testing endpoint!**

---

### 4. **Frontend Implementation Reference** (Optional)
Jika backend ingin lihat bagaimana frontend menggunakan API:

```
features/article/types/feedback.ts         # TypeScript types
features/article/hooks/useArticleFeedback.ts  # Main logic
services/feedbackService.ts                # Mock service (yang akan diganti API call)
```

---

## 🚀 Quick Start untuk Backend

### Step 1: Baca Spec
Buka `docs/api/FEEDBACK_API_SPEC.md` dan baca:
1. Endpoint overview
2. Request body structure
3. Validation rules
4. Database schema

### Step 2: Setup Database
Copy-paste SQL schema dari spec:
```sql
CREATE TABLE article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  -- ... (lengkapnya di FEEDBACK_API_SPEC.md)
);
```

### Step 3: Implement Endpoint
Buat endpoint:
```
POST /api/v1/feedback/article
```

Dengan validation:
- ✅ Rating: 1-5 (required)
- ✅ ArticleId: Valid UUID (required)
- ✅ Trigger: enum 'quiz_completion' | 'exit_intent' | 'manual' (required)
- ✅ ImprovementText: Max 500 chars (optional)
- ✅ Duplicate check: 1 feedback per user per article

### Step 4: Test dengan Postman
1. Import `feedback-postman-collection.json` ke Postman
2. Set variables (`base_url`, `access_token`)
3. Test semua scenarios:
   - ✅ Happy path (201 Created)
   - ✅ Invalid rating (400 Bad Request)
   - ✅ Duplicate feedback (409 Conflict)
   - ✅ Article not found (404 Not Found)
   - ✅ Unauthorized (401 Unauthorized)

### Step 5: Notify Frontend
Kasih tau frontend tim bahwa endpoint sudah ready dengan:
- Base URL
- Endpoint path
- Sample token untuk testing

Frontend tinggal update 1 function di `services/feedbackService.ts`:

```typescript
// DARI:
export const submitArticleFeedback = async (params) => {
  // Mock with AsyncStorage
}

// KE:
export const submitArticleFeedback = async (params) => {
  const response = await api.post('/feedback/article', params);
  return response.data;
}
```

---

## 📊 Expected API Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "uuid-here",
    "articleId": "uuid-here",
    "userId": "uuid-here",
    "rating": 5,
    "trigger": "quiz_completion",
    "createdAt": "2025-12-17T10:30:00.000Z"
  }
}
```

### Error Response (400/401/404/409/500)
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ]
}
```

---

## ⚠️ Important Notes

### 1. Authentication Required ✅
Endpoint ini **HARUS authenticated**. Extract `userId` dari JWT token, JANGAN trust dari request body.

### 2. One Feedback Per User Per Article ✅
Database constraint:
```sql
CONSTRAINT unique_user_article_feedback UNIQUE (user_id, article_id)
```

Return **409 Conflict** jika user sudah pernah submit feedback.

### 3. Article Validation ✅
Validate bahwa `articleId` exist di database. Return **404** jika tidak ada.

### 4. Optional Fields ✅
Fields berikut boleh `null`:
- `quizRelevant`
- `improvementText`
- `quizScore`
- `readingTime`

### 5. CORS ✅
Pastikan CORS allow origin dari frontend (mobile app).

---

## 📞 Questions?

Kalau ada yang kurang jelas, contact frontend team atau lihat:
1. `FEEDBACK_API_SPEC.md` - Spec lengkap
2. `feedback-types.ts` - TypeScript types
3. `services/feedbackService.ts` - Frontend implementation

---

## ✅ Checklist untuk Backend

- [ ] Read FEEDBACK_API_SPEC.md
- [ ] Create database table with schema
- [ ] Implement POST /api/v1/feedback/article endpoint
- [ ] Add validation (rating 1-5, max 500 chars, etc)
- [ ] Add authentication middleware
- [ ] Add duplicate check (409 if already submitted)
- [ ] Test with Postman collection
- [ ] Verify all error cases (400, 401, 404, 409, 500)
- [ ] Deploy to staging/production
- [ ] Notify frontend team with endpoint URL

---

**Status Frontend**: ✅ **READY TO INTEGRATE**

Frontend sudah production-ready dengan mock data. Tinggal ganti mock service dengan real API call begitu endpoint ready!

Good luck! 🚀
