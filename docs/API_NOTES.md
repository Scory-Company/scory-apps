# Notes API Documentation

## Overview

Unified Notes API menggabungkan dua tipe notes:
1. **Article Notes** - Notes yang terkait dengan artikel tertentu (article-based)
2. **Standalone Notes** - Notes mandiri yang tidak terkait artikel

Semua endpoints menggunakan satu tabel `notes` dengan field `articleId` yang nullable.

---

## Base URL

```
http://localhost:5000/api/v1/notes
```

---

## Authentication

Semua endpoints memerlukan authentication menggunakan Bearer token di header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Create Note

Membuat note baru (standalone atau article-based).

**Endpoint:** `POST /api/v1/notes`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

**Untuk Standalone Note:**
```json
{
  "title": "My First Note",
  "content": "This is my standalone note content"
}
```

**Untuk Article Note:**
```json
{
  "content": "My insights about this article",
  "articleSlug": "quantum-computing-basics"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My First Note",
    "content": "This is my standalone note content",
    "articleId": null,
    "isCustom": true,
    "createdAt": "2024-12-09T10:30:00.000Z",
    "updatedAt": "2024-12-09T10:30:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Content is required"
}
```

---

### 2. Get All User Notes

Mendapatkan semua notes user dengan optional filtering.

**Endpoint:** `GET /api/v1/notes`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `articleSlug` | string | No | Filter notes by article slug |
| `standalone` | boolean | No | If `true`, only return standalone notes (articleId = null) |

**Examples:**

1. **Get all notes:**
   ```
   GET /api/v1/notes
   ```

2. **Get standalone notes only:**
   ```
   GET /api/v1/notes?standalone=true
   ```

3. **Get notes for specific article:**
   ```
   GET /api/v1/notes?articleSlug=quantum-computing-basics
   ```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "My Standalone Note",
      "content": "This is a standalone note",
      "isCustom": true,
      "articleId": null,
      "articleTitle": null,
      "articleSlug": null,
      "createdAt": "2024-12-09T10:30:00.000Z",
      "updatedAt": "2024-12-09T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": null,
      "content": "My insights about quantum computing",
      "isCustom": true,
      "articleId": "article-id-123",
      "articleTitle": "Quantum Computing Basics",
      "articleSlug": "quantum-computing-basics",
      "createdAt": "2024-12-09T11:00:00.000Z",
      "updatedAt": "2024-12-09T11:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Note by ID

Mendapatkan detail satu note berdasarkan ID.

**Endpoint:** `GET /api/v1/notes/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Note ID |

**Example:**
```
GET /api/v1/notes/550e8400-e29b-41d4-a716-446655440000
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My Note",
    "content": "Note content here",
    "isCustom": true,
    "articleId": null,
    "articleTitle": null,
    "articleSlug": null,
    "createdAt": "2024-12-09T10:30:00.000Z",
    "updatedAt": "2024-12-09T10:30:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Note not found"
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized to access this note"
}
```

---

### 4. Update Note

Update note yang sudah ada (title atau content).

**Endpoint:** `PUT /api/v1/notes/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Note ID |

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content here"
}
```

**Note:** Semua field di request body bersifat optional. Anda bisa update salah satu atau keduanya.

**Response Success (200):**
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Title",
    "content": "Updated content here",
    "articleId": null,
    "isCustom": true,
    "createdAt": "2024-12-09T10:30:00.000Z",
    "updatedAt": "2024-12-09T12:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Note not found"
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized to update this note"
}
```

---

### 5. Delete Note

Menghapus note.

**Endpoint:** `DELETE /api/v1/notes/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Note ID |

**Example:**
```
DELETE /api/v1/notes/550e8400-e29b-41d4-a716-446655440000
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Note not found"
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized to delete this note"
}
```

---

## Data Models

### Note Object

```typescript
interface Note {
  id: string;              // UUID
  title: string | null;    // Optional title (usually for standalone notes)
  content: string;         // Note content (required)
  isCustom: boolean;       // Always true (user-created)
  articleId: string | null;    // NULL = standalone, NOT NULL = article note
  articleTitle: string | null; // Article title (if articleId exists)
  articleSlug: string | null;  // Article slug (if articleId exists)
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

---

## Migration dari Old Endpoints

### Mapping Old → New Endpoints

| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `POST /api/v1/articles/:slug/notes` | `POST /api/v1/notes` | Tambahkan `articleSlug` di body |
| `GET /api/v1/articles/:slug/notes` | `GET /api/v1/notes?articleSlug=:slug` | Gunakan query param |
| `GET /api/v1/notes/user` | `GET /api/v1/notes?standalone=true` | Filter standalone notes |
| `PUT /api/v1/notes/:id` | `PUT /api/v1/notes/:id` | Same endpoint |
| `DELETE /api/v1/notes/:id` | `DELETE /api/v1/notes/:id` | Same endpoint |

### Breaking Changes

1. **AI Insight Recommendations dihapus**
   - Endpoint `GET /api/v1/articles/:slug/insights` sekarang return empty array
   - Field `isCustom` sekarang selalu `true` untuk semua notes
   - User harus membuat notes sendiri, tidak ada AI suggestions

2. **Response format berubah**
   - Semua notes sekarang punya field `articleId`, `articleTitle`, `articleSlug`
   - Field `articleId` = `null` untuk standalone notes
   - Field `updatedAt` selalu ada (dulu hanya di standalone notes)

---

## Testing dengan cURL

### 1. Create Standalone Note

```bash
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Shopping List",
    "content": "Buy groceries tomorrow"
  }'
```

### 2. Create Article Note

```bash
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great article about quantum computing!",
    "articleSlug": "quantum-computing-basics"
  }'
```

### 3. Get All Notes

```bash
curl -X GET http://localhost:5000/api/v1/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Standalone Notes Only

```bash
curl -X GET "http://localhost:5000/api/v1/notes?standalone=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Update Note

```bash
curl -X PUT http://localhost:5000/api/v1/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated note content"
  }'
```

### 6. Delete Note

```bash
curl -X DELETE http://localhost:5000/api/v1/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration Guide

### Recommended State Management

```typescript
// types.ts
interface Note {
  id: string;
  title: string | null;
  content: string;
  isCustom: boolean;
  articleId: string | null;
  articleTitle: string | null;
  articleSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

// hooks/useNotes.ts
export function useNotes(options?: { articleSlug?: string; standalone?: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.articleSlug) params.append('articleSlug', options.articleSlug);
      if (options?.standalone) params.append('standalone', 'true');

      const response = await fetch(`/api/v1/notes?${params}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setNotes(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return { notes, loading, fetchNotes };
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not note owner) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Validation Rules

### Create/Update Note

| Field | Type | Required | Min | Max | Rules |
|-------|------|----------|-----|-----|-------|
| `content` | string | Yes (create) | 1 | 10000 | Required for create, optional for update |
| `title` | string | No | - | 255 | Optional |
| `articleSlug` | string | No | - | - | Must be valid slug format if provided |

---

## Database Schema

```prisma
model Note {
  id        String  @id @default(uuid())
  userId    String  @map("user_id")
  articleId String? @map("article_id") // NULL = standalone, NOT NULL = article note

  title   String?  @db.VarChar(255)
  content String   @db.Text
  isCustom Boolean @default(true) @map("is_custom")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, articleId])
  @@index([articleId])
  @@map("notes")
}
```

---

## Support

Untuk pertanyaan atau issue, silakan buka GitHub issue atau hubungi tim backend.
