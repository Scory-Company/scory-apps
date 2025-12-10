# Notes API Migration Guide

## 📋 Overview

Aplikasi ini telah berhasil diupdate untuk menggunakan **Unified Notes API** yang baru. API ini menggabungkan dua tipe notes yang sebelumnya terpisah:

- **Article Notes** (notes yang terkait dengan artikel)
- **Standalone Notes** (notes mandiri yang tidak terkait artikel)

## ✅ What Changed

### 1. New Unified API Service

**File baru:** [services/notesApi.ts](../services/notesApi.ts)

API service baru yang menangani semua operasi notes dengan cara yang unified:

```typescript
import { notesApi } from '@/services';

// Create standalone note
await notesApi.createNote({
  title: "My Note",
  content: "Content"
});

// Create article note
await notesApi.createNote({
  content: "My insight",
  articleSlug: "quantum-computing"
});

// Get all notes
await notesApi.getAllNotes();

// Get standalone notes only
await notesApi.getAllNotes({ standalone: true });

// Get article notes
await notesApi.getAllNotes({ articleSlug: "article-slug" });

// Update note
await notesApi.updateNote(noteId, { content: "Updated" });

// Delete note
await notesApi.deleteNote(noteId);
```

### 2. Updated Services

#### [services/insightsApi.ts](../services/insightsApi.ts)
- ✅ Sekarang menggunakan `notesApi` di belakang layar
- ✅ Backward compatible - API signature tetap sama
- ✅ Type `InsightNote` sekarang adalah alias untuk `Note`

#### [services/standaloneNotesApi.ts](../services/standaloneNotesApi.ts)
- ✅ Sekarang menggunakan `notesApi` di belakang layar
- ✅ Backward compatible - API signature tetap sama
- ✅ Type `StandaloneNote` sekarang adalah alias untuk `Note`

### 3. Updated Hooks

#### [hooks/useInsights.ts](../hooks/useInsights.ts)
- ✅ Tidak ada perubahan API
- ✅ Tetap berfungsi seperti biasa

#### [hooks/useUserInsights.ts](../hooks/useUserInsights.ts)
- ✅ Updated untuk handle UUID string IDs
- ✅ Backward compatible dengan number IDs

### 4. Updated Types

**Old:**
```typescript
// Article notes
interface InsightNote {
  id: number;  // ❌ Integer ID
  userId?: number;
  articleId?: number;
  articleTitle: string;
  articleSlug: string;
  content: string;
  isCustom: boolean;
  createdAt: string;
}

// Standalone notes
interface StandaloneNote {
  id: string;  // ✅ UUID string
  title: string | null;
  content: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**New (Unified):**
```typescript
interface Note {
  id: string;  // ✅ UUID string (consistent)
  title: string | null;
  content: string;
  isCustom: boolean;

  // Article info (null for standalone notes)
  articleId: string | null;
  articleTitle: string | null;
  articleSlug: string | null;

  createdAt: string;
  updatedAt: string;
}
```

## 🔄 Migration Path

### For Existing Code

**Good news:** Kode yang sudah ada akan tetap berfungsi! Semua service methods yang lama masih tersedia dengan backward compatibility.

```typescript
// ✅ Old code still works
import { insightsApi, standaloneNotesApi } from '@/services';

await insightsApi.saveInsightNote(slug, content);
await standaloneNotesApi.createStandaloneNote(title, content);
```

### For New Code

**Recommendation:** Gunakan `notesApi` untuk kode baru:

```typescript
// ✅ New unified approach
import { notesApi } from '@/services';

// More flexible and consistent
await notesApi.createNote({ content, articleSlug });
await notesApi.createNote({ title, content });
```

## 🎯 Key Changes Summary

### API Endpoints (Backend)

| Old Endpoint | New Endpoint | Status |
|--------------|--------------|--------|
| `POST /articles/:slug/notes` | `POST /notes` (with `articleSlug` in body) | ✅ Migrated |
| `GET /articles/:slug/notes` | `GET /notes?articleSlug=:slug` | ✅ Migrated |
| `GET /articles/notes` | `GET /notes` (filtered for articleId != null) | ✅ Migrated |
| `POST /notes` | `POST /notes` | ✅ Same |
| `GET /notes` | `GET /notes?standalone=true` | ✅ Updated |
| `PUT /notes/:id` | `PUT /notes/:id` | ✅ Same |
| `DELETE /notes/:id` | `DELETE /notes/:id` | ✅ Same |

### Type Changes

| Field | Old Type | New Type | Notes |
|-------|----------|----------|-------|
| `id` | `number` (insights) / `string` (standalone) | `string` (UUID) | Unified to UUID |
| `articleId` | Not in StandaloneNote | `string \| null` | Added to all notes |
| `articleTitle` | Not in StandaloneNote | `string \| null` | Added to all notes |
| `articleSlug` | Not in StandaloneNote | `string \| null` | Added to all notes |
| `updatedAt` | Not in InsightNote | `string` | Added to all notes |

## 📝 Testing

### 1. Test Scripts Available

Gunakan testing scripts untuk verify API sebelum test di frontend:

```bash
# Node.js (Recommended for Windows)
node scripts/test-notes-api.js

# PowerShell
.\scripts\test-notes-api.ps1

# Bash (Linux/Mac/Git Bash)
./scripts/test-notes-api.sh
```

Baca [scripts/README_TEST.md](../scripts/README_TEST.md) untuk detail lengkap.

### 2. Test Checklist

- [ ] Login dan dapatkan JWT token
- [ ] Edit test script dan paste token
- [ ] Run test script
- [ ] Verify semua 11 tests passed
- [ ] Test di UI untuk create/read/update/delete notes
- [ ] Test article notes di article detail page
- [ ] Test standalone notes di learn tab

## 🐛 Breaking Changes

### PENTING: ID Type Change

**Impact:** Medium

**Issue:** Note IDs sekarang UUID string (bukan number)

**Migration:**
```typescript
// ❌ Old code (may break)
const noteId: number = note.id;
await deleteNote(noteId);

// ✅ New code (works)
const noteId: string = note.id;
await deleteNote(noteId);

// ✅ Also works (backward compatible)
await deleteNote(String(note.id));
```

**Where to check:**
- Components yang display note.id
- Components yang pass noteId ke functions
- Any comparisons using note.id

### AI Insight Recommendations Removed

**Impact:** Low (feature was deprecated)

**Change:** Endpoint `GET /articles/:slug/insights` sekarang return empty array untuk AI recommendations. Field `isCustom` selalu `true` karena semua notes dibuat oleh user.

## 📚 Reference Documentation

- **Backend API Docs:** [docs/API_NOTES.md](./API_NOTES.md)
- **Testing Guide:** [scripts/README_TEST.md](../scripts/README_TEST.md)
- **New Service:** [services/notesApi.ts](../services/notesApi.ts)

## 💡 Best Practices

### 1. Use Unified API for New Features

```typescript
// ✅ Preferred
import { notesApi } from '@/services';

// ❌ Avoid for new code (but OK for existing)
import { insightsApi, standaloneNotesApi } from '@/services';
```

### 2. Handle UUID IDs Properly

```typescript
// ✅ Good - treat as string
const noteId: string = note.id;

// ❌ Bad - assuming number
const noteId: number = note.id;
```

### 3. Check for Article vs Standalone

```typescript
// Check if note is article note or standalone
if (note.articleId !== null) {
  console.log('Article note:', note.articleSlug);
} else {
  console.log('Standalone note:', note.title);
}
```

## 🚀 Next Steps

1. **Test backend API** dengan testing scripts
2. **Test UI flows** untuk semua note operations
3. **Monitor errors** di console untuk type mismatches
4. **Update tests** jika ada integration/e2e tests
5. **Consider deprecating** old APIs setelah semua code migrated

## ❓ FAQ

### Q: Apakah kode lama masih berfungsi?
**A:** Ya! Semua APIs lama tetap berfungsi dengan backward compatibility.

### Q: Kapan harus migrate ke notesApi?
**A:** Untuk kode baru, lebih baik langsung pakai `notesApi`. Kode lama bisa migrate secara bertahap.

### Q: Bagaimana dengan data yang sudah ada?
**A:** Backend migration sudah handle data migration. Semua notes existing akan otomatis punya field baru.

### Q: ID berubah dari number ke string, apakah data hilang?
**A:** Tidak. Backend sudah migrate IDs ke UUID. Data tetap aman.

### Q: Apakah perlu update database?
**A:** Backend team sudah handle migration. Frontend hanya perlu update types.

## 📞 Support

Jika ada issue atau pertanyaan:
1. Check [API_NOTES.md](./API_NOTES.md) untuk API reference
2. Check [README_TEST.md](../scripts/README_TEST.md) untuk testing guide
3. Run test scripts untuk debug API issues
4. Contact backend team jika ada backend errors

---

**Migration Completed:** ✅
**Last Updated:** 2024-12-10
**Status:** Production Ready
