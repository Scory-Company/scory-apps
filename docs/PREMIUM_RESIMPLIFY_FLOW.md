# Premium Re-simplify Feature Flow

## Overview
Semua fitur re-simplify artikel ke reading level yang berbeda **memerlukan akun Premium**.

## 🎯 Scenarios

### 1️⃣ Auto Re-simplify (Level Tidak Tersedia)

**Kondisi:**
- User membuka artikel
- User sudah set preferensi reading level (misal: STUDENT)
- Artikel **tidak memiliki** konten untuk level STUDENT (hanya ada SIMPLE)

**Flow:**
```
1. System detect level STUDENT tidak tersedia
2. Auto trigger re-simplify
3. Check premium status
4. ❌ Jika TIDAK premium:
   - Tampilkan CustomAlert warning
   - Title: "Premium Feature"
   - Message: "Level STUDENT tidak tersedia untuk artikel ini. Upgrade ke Premium untuk mengakses semua reading level."
   - Button: "Upgrade ke Premium" | "Nanti"
5. ✅ Jika premium:
   - Proses simplify ke level STUDENT
   - Reload artikel dengan konten baru
```

**Code Location:**
- Hook: `hooks/useResimplify.ts` → `resimplify()` function
- Component: `app/article/[slug].tsx` → Auto-trigger useEffect (line ~242)

---

### 2️⃣ Manual Re-simplify (User Trigger)

**Kondisi:**
- User sudah membaca artikel dengan level tertentu
- User klik button "Re-simplify to X Level" secara manual

**Flow:**
```
1. User klik button "Re-simplify to STUDENT Level"
2. Trigger handleManualResimplify()
3. Check premium status
4. ❌ Jika TIDAK premium:
   - Tampilkan CustomAlert warning
   - Title: "Premium Feature"
   - Message: "Fitur re-simplify artikel memerlukan akun Premium. Silakan upgrade ke Premium untuk menggunakan fitur ini."
   - Button: "Upgrade ke Premium" | "Nanti"
5. ✅ Jika premium:
   - Proses re-simplify
   - Reload artikel dengan konten baru
```

**UI Location:**
- Button: `app/article/[slug].tsx` (line ~332-348)
- Shows: "Re-simplify to {LEVEL} Level" dengan hint "✨ Premium feature"

**Code Location:**
- Hook: `hooks/useResimplify.ts` → `resimplifyManual()` function
- Component: `app/article/[slug].tsx` → `handleManualResimplify()`

---

## 🎨 UI Components

### CustomAlert
Menggunakan custom alert dari `features/shared/components/CustomAlert.tsx`:
- ⚠️ Warning icon dengan background kuning
- Smooth spring animation
- Dua button: Primary (Upgrade) dan Secondary (Nanti)
- Consistent dengan design system

### Manual Re-simplify Button
```tsx
<TouchableOpacity onPress={handleManualResimplify}>
  <Icon name="refresh" />
  <Text>Re-simplify to {selectedReadingLevel} Level</Text>
</TouchableOpacity>
<Text>✨ Premium feature</Text>
```

---

## 🔧 Implementation Details

### Premium Check (Placeholder)
```typescript
const hasPremium = false; // TODO: Get from user context/auth state
```

**Next Steps:**
1. Integrate dengan auth context/state management
2. Backend API untuk check premium status
3. Premium subscription page/flow

### Error Handling
- Auto re-simplify error → Show error alert
- Manual re-simplify error → Show error alert
- Network error → Show error message

---

## 📝 Todo for Backend Integration

- [ ] Implement premium user authentication
- [ ] Add premium status to user context
- [ ] Create premium subscription API
- [ ] Create premium payment flow
- [ ] Update `hasPremium` check to use real data

---

## 🚀 Testing

**Test Case 1: Non-premium user tries auto re-simplify**
1. Set reading preference to STUDENT
2. Open article with only SIMPLE level
3. Expected: Premium alert shows

**Test Case 2: Non-premium user clicks manual re-simplify**
1. Open any article
2. Click "Re-simplify to X Level" button
3. Expected: Premium alert shows

**Test Case 3: Premium user (when implemented)**
1. Set `hasPremium = true` (temporary)
2. Try both auto and manual re-simplify
3. Expected: Re-simplify process works

---

**Last Updated:** 2025-12-10
**Status:** ✅ Frontend Implementation Complete (Backend Pending)
