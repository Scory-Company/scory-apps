# 🎨 Toast Migration - Replace Alert with Custom Toast

## Overview
Mengganti semua penggunaan `Alert` bawaan React Native dengan custom Toast component yang lebih modern dan konsisten dengan design system.

**Date:** 2025-12-11
**Status:** ✅ COMPLETED

---

## Motivation

### Problems with React Native Alert:
- ❌ Jelek dan tidak konsisten dengan design app
- ❌ Tidak bisa di-customize
- ❌ Berbeda tampilan di iOS vs Android
- ❌ Tidak ada animation yang smooth
- ❌ Blocking UI (modal alert)

### Benefits of Custom Toast:
- ✅ Konsisten dengan design system (colors, typography, radius)
- ✅ Modern animation (spring animation)
- ✅ Non-blocking (overlay toast)
- ✅ Customizable (success, error, warning, info)
- ✅ Auto-dismiss
- ✅ Sama di semua platform

---

## Files Modified

### 1. ✅ `features/article/components/SourceLinks.tsx`
**What:** Component untuk menampilkan link PDF/DOI artikel external

**Changes:**
- Removed: `Alert` from react-native imports
- Added: `useToast` hook
- Replaced: `Alert.alert()` → `toast.error()`
- Added: `<toast.ToastComponent />` in return

**Before:**
```tsx
import { Alert } from 'react-native';

Alert.alert('Cannot Open Link', `Unable to open ${label}`);
Alert.alert('Error', `Failed to open ${label}`);
```

**After:**
```tsx
import { useToast } from '@/features/shared/hooks/useToast';

const toast = useToast();

toast.error(`Unable to open ${label}`, 2500);
toast.error(`Failed to open ${label}`, 2500);

// In return:
<toast.ToastComponent />
```

---

### 2. ✅ `hooks/useSimplifyPaper.ts`
**What:** Hook untuk simplify paper workflow

**Changes:**
- Removed: `Alert` import
- Removed: `Alert.alert()` in error handling
- Added: `errorTitle` to return value
- Modified: Return error info instead of showing Alert

**Reason:**
Hook tidak bisa pakai `useToast` (karena bukan component). Jadi error di-return ke component yang pakai hook ini, dan component-nya yang handle toast.

**Before:**
```tsx
import { Alert } from 'react-native';

Alert.alert(
  errorTitle,
  errorMessage,
  [{ text: 'OK', style: 'cancel' }]
);
```

**After:**
```tsx
// No Alert import

setError(errorMessage);
setErrorTitle(errorTitle); // NEW

// Return both error and errorTitle
return {
  simplify,
  isSimplifying,
  error,
  errorTitle, // NEW
  progress,
};
```

**Component yang pakai hook ini harus handle toast:**
```tsx
const { simplify, error, errorTitle } = useSimplifyPaper();
const toast = useToast();

useEffect(() => {
  if (error && errorTitle) {
    toast.error(error, 3000);
  }
}, [error, errorTitle]);
```

---

### 3. ✅ `features/learn/components/AddNoteModal.tsx`
**What:** Modal untuk menambahkan learning note

**Changes:**
- Removed: `Alert` from react-native imports
- Removed: Old Toast state management (`toastVisible`, `toastMessage`, `toastType`)
- Removed: Old `<Toast>` component usage
- Added: `useToast` hook
- Replaced: `Alert.alert()` → `toast.error()`
- Replaced: Manual toast state → `toast.success()` / `toast.error()`
- Added: `<toast.ToastComponent />` in return

**Before:**
```tsx
import { Alert } from 'react-native';
import { Toast } from '@/features/shared/components';

const [toastVisible, setToastVisible] = useState(false);
const [toastMessage, setToastMessage] = useState('');
const [toastType, setToastType] = useState<'success' | 'error'>('success');

Alert.alert('Error', 'Please enter your note content');

setToastType('success');
setToastMessage('Note saved successfully!');
setToastVisible(true);

// In return:
<Toast
  visible={toastVisible}
  type={toastType}
  message={toastMessage}
  position="top"
  duration={3000}
  onHide={() => setToastVisible(false)}
/>
```

**After:**
```tsx
import { useToast } from '@/features/shared/hooks/useToast';

const toast = useToast();

toast.error('Please enter your note content', 2500);
toast.success('Note saved successfully!', 2500);
toast.error(errorMsg, 3000);

// In return:
<toast.ToastComponent />
```

**Lines of code reduced:** ~15 lines deleted (state management & manual Toast)

---

## Custom Toast API

### Hook Usage:
```tsx
import { useToast } from '@/features/shared/hooks/useToast';

const MyComponent = () => {
  const toast = useToast();

  return (
    <>
      <Button onPress={() => toast.success('Success!', 2000)} />
      <Button onPress={() => toast.error('Error!', 2500)} />
      <Button onPress={() => toast.warning('Warning!', 2000)} />
      <Button onPress={() => toast.info('Info!', 2000)} />

      {/* IMPORTANT: Add ToastComponent */}
      <toast.ToastComponent />
    </>
  );
};
```

### Toast Types:
| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `success` | ✅ checkmark-circle | Green | Action berhasil |
| `error` | ❌ close-circle | Red | Error / gagal |
| `warning` | ⚠️ warning | Orange | Warning / peringatan |
| `info` | ℹ️ information-circle | Blue | Informasi |

### Parameters:
```tsx
toast.success(message, duration?, position?)
toast.error(message, duration?, position?)
toast.warning(message, duration?, position?)
toast.info(message, duration?, position?)
```

- `message`: String - Toast message
- `duration`: Number (optional) - Duration in ms (default: 3000)
- `position`: 'top' | 'bottom' (optional) - Position (default: 'top')

---

## Migration Checklist

- [x] Replace `Alert.alert()` in `SourceLinks.tsx`
- [x] Replace `Alert.alert()` in `AddNoteModal.tsx`
- [x] Remove Alert from `useSimplifyPaper.ts` (return error instead)
- [x] Verify no more Alert usage in codebase
- [x] Test all toast notifications
- [x] Document migration guide

---

## Testing

### Test Cases:
1. ✅ **SourceLinks** - Click PDF/DOI with invalid URL → Error toast
2. ✅ **AddNoteModal** - Save empty note → Error toast
3. ✅ **AddNoteModal** - Save note successfully → Success toast
4. ✅ **AddNoteModal** - Network error → Error toast with message
5. ✅ **useSimplifyPaper** - Simplify error → Component handles toast

### Verification:
```bash
# Search for any remaining Alert usage
grep -r "Alert\." --include="*.tsx" --include="*.ts" app/ features/ hooks/ services/

# Should return: No results
```

---

## Design Consistency

Toast menggunakan design system yang sama:
- **Colors:** `colors.success`, `colors.error`, `colors.warning`, `colors.info`
- **Typography:** `Typography.fontSize.xs`, `Typography.fontFamily.semiBold`
- **Radius:** `Radius.lg`
- **Shadows:** `Shadows.md`
- **Spacing:** `Spacing.sm`, `Spacing.md`
- **Animation:** Spring animation (friction: 8, tension: 100)

---

## Future Improvements

### Potential Enhancements:
1. **Toast Queue** - Multiple toasts at once
2. **Action Button** - Add action button in toast (e.g., "Undo", "Retry")
3. **Custom Icon** - Allow custom icon per toast
4. **Swipe to Dismiss** - Swipe gesture to dismiss
5. **Toast Position** - More positions (top-left, top-right, center)
6. **Progress Bar** - Show remaining time as progress bar

---

## Related Files

### Core Components:
- `features/shared/components/Toast.tsx` - Toast UI component
- `features/shared/hooks/useToast.tsx` - Toast hook

### Usage Examples:
- `app/article/[slug].tsx` - Bookmark success/error toasts
- `features/article/components/SourceLinks.tsx` - Link error toasts
- `features/learn/components/AddNoteModal.tsx` - Note save toasts

---

**Migration Complete!** ✅

All Alert usage has been replaced with custom Toast. The app now has consistent, modern notifications across all screens.
