# Quiz & Insights API Documentation

API endpoints untuk Quiz dan Key Insights pada artikel.

Base URL: `/api/v1`

---

## 📝 Quiz Endpoints

### 1. Get Quiz Questions

**Endpoint:** `GET /articles/:slug/quiz`

**Auth:** Optional (untuk mendapatkan reading level user)

**Description:** Ambil soal quiz untuk artikel tertentu (3 soal)

**Request:**
```http
GET /api/v1/articles/ai-in-healthcare/quiz
Authorization: Bearer <token> (optional)
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Quiz questions retrieved successfully",
  "data": {
    "articleId": "uuid-123",
    "articleTitle": "AI in Healthcare",
    "articleSlug": "ai-in-healthcare",
    "readingLevel": "SIMPLE",
    "questions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "questionId": "550e8400-e29b-41d4-a716-446655440001",
        "articleId": 1,
        "question": "What is the main focus of this AI research?",
        "options": [
          "Historical analysis only",
          "Cutting-edge developments and implications",
          "Personal opinions",
          "Unrelated topics"
        ],
        "correctIndex": 1,
        "order": 1
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "questionId": "550e8400-e29b-41d4-a716-446655440002",
        "articleId": 1,
        "question": "What methodology approach was used?",
        "options": ["Option A", "Option B", "Option C"],
        "correctIndex": 2,
        "order": 2
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "questionId": "550e8400-e29b-41d4-a716-446655440003",
        "articleId": 1,
        "question": "What was highlighted as essential?",
        "options": ["Option A", "Option B", "Option C"],
        "correctIndex": 1,
        "order": 3
      }
    ]
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Article not found"
}
```

---

### 2. Submit Quiz Attempt

**Endpoint:** `POST /articles/:slug/quiz`

**Auth:** Required

**Description:** Submit jawaban quiz dan dapatkan hasil grading

**Request:**
```http
POST /api/v1/articles/ai-in-healthcare/quiz
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "uuid-q1",
      "selectedAnswer": "B"
    },
    {
      "questionId": "uuid-q2",
      "selectedAnswer": "C"
    },
    {
      "questionId": "uuid-q3",
      "selectedAnswer": "A"
    }
  ]
}
```

**Validation:**
- `answers` harus array dengan exactly 3 items
- `questionId` required (UUID dari soal)
- `selectedAnswer` harus salah satu: "A", "B", "C", atau "D"

**Response Success (201):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "attemptId": "uuid-attempt-123",
    "score": 2,
    "totalQuestions": 3,
    "percentage": 67,
    "answers": [
      {
        "questionId": "uuid-q1",
        "question": "What is the main focus?",
        "selectedAnswer": "B",
        "correctAnswer": "B",
        "isCorrect": true,
        "explanation": "This is the correct answer because..."
      },
      {
        "questionId": "uuid-q2",
        "question": "What methodology?",
        "selectedAnswer": "C",
        "correctAnswer": "C",
        "isCorrect": true,
        "explanation": "Mixed methods..."
      },
      {
        "questionId": "uuid-q3",
        "question": "What was highlighted?",
        "selectedAnswer": "A",
        "correctAnswer": "B",
        "isCorrect": false,
        "explanation": "The correct answer is B because..."
      }
    ],
    "completedAt": "2025-12-07T10:30:00Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Expected 3 answers, got 2"
}
```

---

### 3. Get User Quiz Attempts

**Endpoint:** `GET /articles/quiz/attempts`

**Auth:** Required

**Description:** Ambil semua quiz attempts user

**Request:**
```http
GET /api/v1/articles/quiz/attempts
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Quiz attempts retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "articleId": 1,
      "score": 3,
      "totalQuestions": 3,
      "completedAt": "2025-11-20T10:30:00Z"
    },
    {
      "id": 2,
      "userId": 1,
      "articleId": 1,
      "score": 2,
      "totalQuestions": 3,
      "completedAt": "2025-11-19T14:15:00Z"
    }
  ]
}
```

---

### 4. Get User Quiz Attempts by Article

**Endpoint:** `GET /articles/:slug/quiz/attempts`

**Auth:** Required

**Description:** Ambil quiz attempts user untuk artikel tertentu

**Request:**
```http
GET /api/v1/articles/ai-in-healthcare/quiz/attempts
Authorization: Bearer <token>
```

**Response:** Same format as endpoint #3

---

## 💡 Insights Endpoints

### 1. Get Key Insights

**Endpoint:** `GET /articles/:slug/insights`

**Auth:** Optional (untuk mendapatkan reading level user)

**Description:** Ambil key insights untuk artikel tertentu (3 insights)

**Request:**
```http
GET /api/v1/articles/ai-in-healthcare/insights
Authorization: Bearer <token> (optional)
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Insights retrieved successfully",
  "data": {
    "articleId": "uuid-123",
    "articleTitle": "AI in Healthcare",
    "articleSlug": "ai-in-healthcare",
    "readingLevel": "SIMPLE",
    "insights": [
      {
        "id": 1,
        "articleId": 1,
        "content": "Cross-disciplinary collaboration is essential for breakthrough discoveries in AI.",
        "order": 1,
        "title": "Key Insight #1",
        "icon": "lightbulb"
      },
      {
        "id": 2,
        "articleId": 1,
        "content": "Mixed-methods research provides both statistical significance and contextual meaning.",
        "order": 2,
        "title": "Key Insight #2",
        "icon": "rocket"
      },
      {
        "id": 3,
        "articleId": 1,
        "content": "Real-world applications of AI research show promising results.",
        "order": 3,
        "title": "Key Insight #3",
        "icon": "star"
      }
    ]
  }
}
```

**Note:**
- `title` dan `icon` adalah bonus info dari backend
- Frontend bisa pakai atau ignore sesuai kebutuhan
- Yang penting adalah `content`

---

### 2. Save Insight Note

**Endpoint:** `POST /articles/:slug/notes`

**Auth:** Required

**Description:** Simpan catatan insight user (bisa dari suggestion atau custom)

**Request:**
```http
POST /api/v1/articles/ai-in-healthcare/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "I need to reduce my carbon footprint by using public transport.",
  "isCustom": true
}
```

**Validation:**
- `content` required, min 5 chars, max 1000 chars
- `isCustom` optional (default: false)
  - `false` = user memilih dari insight suggestions
  - `true` = user menulis sendiri

**Response Success (201):**
```json
{
  "success": true,
  "message": "Insight note saved successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "articleId": 1,
    "content": "I need to reduce my carbon footprint by using public transport.",
    "isCustom": true,
    "createdAt": "2025-11-19T14:20:00Z"
  }
}
```

**Note:**
- Jika user sudah pernah save note untuk artikel yang sama, note akan di-UPDATE (tidak create baru)

---

### 3. Get User Insight Notes

**Endpoint:** `GET /articles/notes`

**Auth:** Required

**Description:** Ambil semua insight notes user

**Request:**
```http
GET /api/v1/articles/notes
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Insight notes retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "articleId": 1,
      "content": "Cross-disciplinary collaboration is essential for AI.",
      "isCustom": false,
      "createdAt": "2025-11-20T10:35:00Z"
    },
    {
      "id": 2,
      "userId": 1,
      "articleId": 1,
      "content": "I need to reduce my carbon footprint.",
      "isCustom": true,
      "createdAt": "2025-11-19T14:20:00Z"
    }
  ]
}
```

---

### 4. Get User Insight Notes by Article

**Endpoint:** `GET /articles/:slug/notes`

**Auth:** Required

**Description:** Ambil insight notes user untuk artikel tertentu

**Request:**
```http
GET /api/v1/articles/ai-in-healthcare/notes
Authorization: Bearer <token>
```

**Response:** Same format as endpoint #3

---

### 5. Delete Insight Note

**Endpoint:** `DELETE /articles/notes/:noteId`

**Auth:** Required

**Description:** Hapus insight note user

**Request:**
```http
DELETE /api/v1/articles/notes/uuid-note-123
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Insight note deleted successfully",
  "data": {
    "success": true,
    "message": "Note deleted successfully"
  }
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "You are not authorized to delete this note"
}
```

---

## 🔑 Reading Level System

Backend otomatis menyesuaikan quiz & insights berdasarkan **reading level** user:

1. **Jika user login:** Ambil dari `UserPersonalization.readingLevel`
2. **Jika user tidak login:** Default ke `SIMPLE`

Reading levels yang tersedia:
- `SIMPLE` - Konten paling sederhana
- `STUDENT` - Untuk pelajar/mahasiswa
- `ACADEMIC` - Untuk akademisi
- `EXPERT` - Untuk expert/researcher

Frontend **tidak perlu** kirim parameter reading level, backend yang handle otomatis!

---

## 📋 Data Mapping (Backend → Frontend)

### Question ID Format
**PENTING:** Backend return 2 field untuk question ID:
- `id` - UUID string (e.g., `"550e8400-e29b-41d4-a716-446655440001"`)
- `questionId` - Alias untuk clarity, sama dengan `id`

**Untuk submit quiz, gunakan field `id` atau `questionId` (keduanya sama):**
```json
{
  "answers": [
    {
      "questionId": "550e8400-e29b-41d4-a716-446655440001",  // ✅ UUID dari response GET
      "selectedAnswer": "B"
    }
  ]
}
```

### Quiz Questions
Backend menyimpan `correctAnswer` sebagai string ("A", "B", "C"), tapi frontend menerima `correctIndex` (0, 1, 2).

**Backend transform:**
```typescript
"A" → 0
"B" → 1
"C" → 2
"D" → 3
```

### Options Cleaning
Backend menyimpan `["A. Option 1", "B. Option 2"]`, tapi frontend menerima `["Option 1", "Option 2"]` (prefix dihapus).

---

## ⚠️ Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Article not found"
}
```

**404 Quiz/Insights Not Available:**
```json
{
  "success": false,
  "message": "Quiz not available for this article"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to retrieve quiz questions"
}
```

---

## 🧪 Testing Tips

1. **Get Quiz:** Test dengan dan tanpa auth token untuk lihat reading level berbeda
2. **Submit Quiz:** Pastikan kirim exactly 3 answers
3. **Save Note:** Test save 2x untuk artikel sama, harusnya update bukan create baru
4. **Delete Note:** Test delete note milik user lain, harusnya error 403

---

## 📝 Notes untuk Frontend

1. **Question ID Format:** Gunakan `id` atau `questionId` (UUID string) saat submit quiz
   ```typescript
   // ✅ Correct
   const questionId = question.id; // atau question.questionId

   // ❌ Wrong - jangan pakai index atau number lain
   const questionId = index + 1;
   ```

2. **Quiz correctIndex:** Jangan tampilkan ke user sebelum submit! Ini untuk grading aja.

3. **Insights title & icon:** Optional, bisa pakai atau ignore

4. **Reading Level:** Otomatis dari backend, frontend nggak perlu kirim parameter

5. **Quiz Explanation:** Tampilkan setelah user submit quiz, bukan saat get questions

---

Selesai! 🚀 Kalau ada pertanyaan, ping saya!
