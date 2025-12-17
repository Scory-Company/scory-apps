# Article Feedback System - Testing Guide

## Overview
Sistem feedback artikel telah berhasil diimplementasi dengan **mock data** yang bisa langsung di-testing di frontend tanpa perlu backend!

## Features Implemented

### 1. **Feedback After Quiz Completion** (Primary Trigger)
- ✅ Muncul otomatis 2 detik setelah user selesai mengerjakan quiz
- ✅ Full modal dengan pertanyaan lengkap:
  - Rating (1-5 bintang) - **Required**
  - Quiz relevance (Yes/No)
  - Improvement text (Optional, max 500 karakter)
- ✅ Skip button muncul setelah 5 detik
- ✅ Quiz score ditampilkan di modal (jika ada)

### 2. **Manual Feedback Card** (Below Quiz Section) ⭐ NEW!
- ✅ Card muncul di bawah quiz section
- ✅ User bisa klik kapan aja untuk kasih feedback
- ✅ Visible & accessible sepanjang waktu
- ✅ Auto-hide setelah user submit feedback
- ✅ Design compact dengan bintang yang menarik

### 3. **Quick Feedback on Exit Intent** (Fallback Trigger)
- ✅ Muncul ketika user menekan tombol back
- ✅ Hanya muncul jika:
  - User belum pernah kasih feedback untuk article ini
  - Reading time minimal 60 detik
- ✅ Bottom sheet dengan quick rating (1-5 bintang)
- ✅ Bisa langsung di-skip

### 4. **Smart Feedback Management**
- ✅ Sekali feedback per article (disimpan di AsyncStorage)
- ✅ Tidak akan muncul lagi setelah user submit feedback
- ✅ Reading time tracking otomatis
- ✅ Toast notifications untuk konfirmasi

## How to Test

### Test Scenario 1: Feedback After Quiz ✅
1. Buka article detail screen
2. Scroll ke bawah, klik "Take Quiz"
3. Kerjakan quiz sampai selesai
4. Tunggu 2 detik setelah quiz result → **Feedback modal akan muncul**
5. Coba submit dengan rating saja (minimal requirement)
6. Coba submit dengan semua field terisi
7. Cek console log untuk melihat data yang disimpan

### Test Scenario 2: Manual Feedback Card ✅ NEW!
1. Buka article detail screen
2. Scroll ke bawah melewati quiz section
3. Lihat **Feedback Card** dengan bintang-bintang ⭐⭐⭐⭐⭐
4. Klik card → **Feedback modal akan muncul**
5. Submit feedback
6. Scroll ke section yang sama → **Card sudah hilang** (tidak muncul lagi)

### Test Scenario 3: Quick Feedback on Exit ✅
1. Buka article baru (yang belum pernah diberi feedback)
2. Baca minimal **60 detik** (tunggu 1 menit)
3. **JANGAN kerjakan quiz**
4. Press back button → **Quick feedback bottom sheet akan muncul**
5. Pilih rating atau skip
6. Cek console log

### Test Scenario 4: Already Given Feedback ✅
1. Kasih feedback di article tertentu (ikuti test 1 atau 2)
2. Buka article yang sama lagi
3. Kerjakan quiz atau press back
4. **Feedback TIDAK akan muncul** (karena sudah pernah kasih feedback)
5. Cek console: "⏭️ Feedback already given for this article"

### Test Scenario 5: Reading Time Too Short ✅
1. Buka article baru
2. Langsung press back (< 60 detik)
3. **Feedback TIDAK akan muncul**
4. Cek console: "⏭️ Reading time too short for feedback request"

### Test Scenario 6: Multiple Trigger Points ✅
1. Buka article baru
2. Skip quiz modal (jika muncul otomatis)
3. Scroll ke bawah → **Card feedback masih ada**
4. Klik card → Submit feedback
5. Refresh/re-open article
6. **Semua feedback prompts (modal, card, exit) sudah hilang**

## Files Created

### Core Files
```
features/article/
├── types/
│   └── feedback.ts                    # TypeScript types (updated with 'manual' trigger)
├── components/
│   ├── ArticleFeedbackModal.tsx       # Full modal (after quiz)
│   ├── ArticleQuickFeedback.tsx       # Quick rating (exit intent)
│   ├── FeedbackPromptCard.tsx         # Manual feedback card ⭐ NEW!
│   └── index.ts                       # Exports (updated)
├── hooks/
│   ├── useArticleFeedback.ts          # Main feedback logic (updated with manual trigger)
│   └── useExitIntent.ts               # Back button detection

services/
└── feedbackService.ts                 # Mock API service

app/article/
└── [slug].tsx                         # Updated with feedback integration
```

## Mock Data Storage

Semua feedback disimpan di **AsyncStorage** dengan keys:
- `@scory_article_feedback` - Array of all feedback submissions
- `@scory_feedback_history` - History untuk track artikel mana yang sudah diberi feedback

## Debugging Tools (Mock Only)

Buka file `services/feedbackService.ts`, ada helper functions untuk debugging:

```typescript
// Lihat semua feedback yang sudah disubmit
import { getAllFeedback } from '@/services/feedbackService';
const allFeedback = await getAllFeedback();
console.log('All feedback:', allFeedback);

// Clear semua feedback (untuk testing ulang)
import { clearAllFeedback } from '@/services/feedbackService';
await clearAllFeedback();
```

Bisa dipanggil dari console atau tambahkan temporary button di UI untuk testing.

## Console Logs to Watch

Saat testing, perhatikan console logs berikut:

### Feedback Triggered
```
🎯 Triggering feedback after quiz completion
👆 Triggering manual feedback from card
🚪 Triggering quick feedback on exit intent
```

### Feedback Skipped
```
⏭️ Feedback already given for this article
⏭️ Reading time too short for feedback request
```

### Feedback Submitted
```
✅ [MOCK] Feedback submitted: {...}
✅ Feedback submitted successfully
✅ Quick feedback submitted
```

## UI Components Behavior

### ArticleFeedbackModal (Full Modal)
- **Position**: Center overlay
- **Animation**: Fade in
- **Skip**: After 5 seconds for quiz trigger, immediately for exit trigger
- **Validation**: Must select rating (1-5 stars)
- **Optional fields**: Quiz relevance, improvement text

### ArticleQuickFeedback (Bottom Sheet)
- **Position**: Bottom of screen
- **Animation**: Slide up
- **Skip**: Immediately available
- **Quick submit**: Auto-submit setelah select rating
- **Auto-close**: 500ms after submission

## Migration to Real API

Ketika backend sudah ready, tinggal update file `services/feedbackService.ts`:

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

Semua logic di frontend sudah siap, tinggal ganti service layer!

## API Endpoint (Future Implementation)

Expected backend endpoint:
```
POST /api/v1/feedback/article
```

Request body:
```json
{
  "articleId": "string",
  "rating": 1-5,
  "quizRelevant": boolean (optional),
  "improvementText": "string" (optional),
  "trigger": "quiz_completion" | "exit_intent",
  "quizScore": number (optional),
  "readingTime": number (seconds)
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "feedback_id",
    "articleId": "...",
    // ... feedback object
  }
}
```

## Notes

1. **Feedback hanya muncul 1x per article per user** - ini by design untuk UX yang baik
2. **Reading time tracking** dimulai saat article screen di-mount
3. **Exit intent** hanya aktif jika modal feedback tidak sedang terbuka
4. **Mock data** disimpan di local device (AsyncStorage)
5. **Production ready** - tinggal ganti mock API dengan real API

## Troubleshooting

### Feedback tidak muncul setelah quiz?
- Cek console log apakah ada "⏭️ Feedback already given"
- Clear AsyncStorage: `await clearAllFeedback()`
- Restart app

### Quick feedback tidak muncul saat back button?
- Pastikan reading time > 60 detik
- Pastikan belum pernah kasih feedback
- Cek console log untuk reason

### TypeScript errors?
- Pastikan semua imports benar
- Run `npm install` atau `yarn install`
- Restart TypeScript server

## Success Criteria ✅

- [x] Feedback modal muncul setelah quiz completion
- [x] Quick feedback muncul on exit intent
- [x] Reading time tracking berfungsi
- [x] Data tersimpan di AsyncStorage
- [x] Feedback tidak muncul 2x untuk article yang sama
- [x] Toast notifications muncul
- [x] Skip functionality bekerja
- [x] All TypeScript types correct
- [x] No runtime errors

---

**Status**: ✅ **READY FOR TESTING!**

Silakan test dan kasih feedback ya! 😊
