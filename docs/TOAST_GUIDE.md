# 🍞 Toast Component Guide

Dokumentasi lengkap untuk menggunakan Toast - notifikasi kecil yang muncul sebentar lalu hilang otomatis.

---

## 🎯 Kapan Pakai Toast vs Alert?

### **Toast** 🍞 (untuk notifikasi cepat)
✅ Login berhasil / gagal
✅ Password salah
✅ Validasi error
✅ Profile updated
✅ Quick confirmation

### **Alert** 🔔 (untuk konfirmasi penting)
✅ Logout confirmation
✅ Delete confirmation
✅ Critical errors yang perlu action

---

## 📋 Features

✅ **4 Toast Types** - Success, Error, Warning, Info
✅ **Auto Hide** - Hilang otomatis setelah 3 detik (customizable)
✅ **Position** - Bisa di top atau bottom
✅ **Animated** - Slide in/out smooth
✅ **Non-Blocking** - User bisa tetap interaksi
✅ **No Buttons** - Simple, clean, fast

---

## 📁 File Structure

```
features/
  └── shared/
      ├── components/
      │   ├── Toast.tsx           # Toast component
      │   └── index.ts            # Export
      └── hooks/
          └── useToast.tsx        # Toast hook
```

---

## 🚀 Quick Start

### 1. Import Hook

```typescript
import { useToast } from '@/features/shared/hooks/useToast';
```

### 2. Initialize Hook

```typescript
const toast = useToast();
```

### 3. Show Toast

```typescript
// Success
toast.success('Profile updated successfully');

// Error
toast.error('Invalid email or password');

// Warning
toast.warning('Please check your input');

// Info
toast.info('New feature available');
```

### 4. Add Toast Component to JSX

```typescript
return (
  <View>
    {/* Your content */}

    <toast.ToastComponent />
  </View>
);
```

---

## 📖 Usage Examples

### Example 1: Login Error

```typescript
import { useToast } from '@/features/shared/hooks/useToast';

export default function LoginScreen() {
  const toast = useToast();

  const handleLogin = async (email, password) => {
    try {
      await loginWithEmail(email, password);
      toast.success('Login successful!');
      router.push('/home');
    } catch (error) {
      toast.error('Invalid email or password');
    }
  };

  return (
    <View>
      <Button onPress={handleLogin}>Login</Button>
      <toast.ToastComponent />
    </View>
  );
}
```

**Result:**
```
┌────────────────────────────────┐
│  ❌  Invalid email or password │
└────────────────────────────────┘
     (hilang setelah 3 detik)
```

---

### Example 2: Profile Update Success

```typescript
const handleSave = async () => {
  try {
    await updateProfile(data);
    toast.success('Profile updated successfully');
  } catch (error) {
    toast.error('Failed to update profile');
  }
};
```

**Result:**
```
┌──────────────────────────────────────┐
│  ✅  Profile updated successfully    │
└──────────────────────────────────────┘
     (hilang setelah 3 detik)
```

---

### Example 3: Custom Duration & Position

```typescript
// Show toast at bottom for 5 seconds
toast.success('Operation completed', 5000, 'bottom');

// Show error at top for 4 seconds
toast.error('Something went wrong', 4000, 'top');
```

---

### Example 4: Custom Toast Config

```typescript
toast.showToast({
  type: 'warning',
  message: 'Please save your changes',
  position: 'bottom',
  duration: 5000,
});
```

---

## 🎨 Toast Types

### 1. Success ✅

```typescript
toast.success('Operation completed');
```

- **Icon:** Checkmark circle
- **Color:** Green (`#22C55E`)
- **Use for:** Successful operations

**Visual:**
```
┌──────────────────────────┐
│  ✅  Operation completed │
└──────────────────────────┘
```

---

### 2. Error ❌

```typescript
toast.error('Something went wrong');
```

- **Icon:** Close circle
- **Color:** Red (`#EF4444`)
- **Use for:** Errors, validation failures

**Visual:**
```
┌────────────────────────────┐
│  ❌  Something went wrong  │
└────────────────────────────┘
```

---

### 3. Warning ⚠️

```typescript
toast.warning('Please check your input');
```

- **Icon:** Warning triangle
- **Color:** Yellow (`#FACC15`)
- **Use for:** Warnings, important notices

**Visual:**
```
┌────────────────────────────────┐
│  ⚠️  Please check your input   │
└────────────────────────────────┘
```

---

### 4. Info ℹ️

```typescript
toast.info('New update available');
```

- **Icon:** Information circle
- **Color:** Blue (`#3B82F6`)
- **Use for:** Informational messages

**Visual:**
```
┌─────────────────────────────┐
│  ℹ️  New update available   │
└─────────────────────────────┘
```

---

## 🔧 API Reference

### Hook: `useToast()`

Returns object with methods:

| Method | Parameters | Description |
|--------|-----------|-------------|
| `success()` | `(message, duration?, position?)` | Show success toast |
| `error()` | `(message, duration?, position?)` | Show error toast |
| `warning()` | `(message, duration?, position?)` | Show warning toast |
| `info()` | `(message, duration?, position?)` | Show info toast |
| `showToast()` | `(config)` | Show custom toast |
| `hideToast()` | `()` | Hide current toast |
| `ToastComponent` | Component | Toast component to render |

---

### Parameters

#### `message` (required)
- Type: `string`
- Description: The message to display

#### `duration` (optional)
- Type: `number`
- Default: `3000` (3 seconds)
- Description: How long toast stays visible (ms)

#### `position` (optional)
- Type: `'top' | 'bottom'`
- Default: `'top'`
- Description: Where toast appears

---

### Full showToast() Config

```typescript
toast.showToast({
  type: 'success' | 'error' | 'warning' | 'info',
  message: 'Your message here',
  position: 'top' | 'bottom',
  duration: 3000, // milliseconds
});
```

---

## 🎭 Animation

Toast uses **Spring animation** for smooth entrance:

```typescript
Animated.spring(translateY, {
  toValue: 0,
  useNativeDriver: true,
  friction: 8,
  tension: 100,
}).start();
```

---

## 📱 Positioning

### Top Position (default)
```typescript
toast.success('Message here');
// atau
toast.success('Message here', 3000, 'top');
```

**Visual:**
```
     ┌──────────────┐
     │  ✅  Message │  ← Muncul di atas
     └──────────────┘



     [Screen Content]
```

---

### Bottom Position
```typescript
toast.success('Message here', 3000, 'bottom');
```

**Visual:**
```
     [Screen Content]



     ┌──────────────┐
     │  ✅  Message │  ← Muncul di bawah
     └──────────────┘
```

---

## ⏱️ Duration Examples

```typescript
// 2 seconds (quick)
toast.success('Done', 2000);

// 3 seconds (default)
toast.success('Done');

// 5 seconds (longer)
toast.error('Please read this carefully', 5000);

// 10 seconds (very long)
toast.warning('Important notice', 10000);
```

---

## 🔄 Migration from Alert

### Before (Alert):

```typescript
Alert.alert('Success', 'Profile updated');
Alert.alert('Error', 'Invalid password');
```

### After (Toast):

```typescript
toast.success('Profile updated');
toast.error('Invalid password');
```

**Benefits:**
- ✅ Lebih cepat & non-blocking
- ✅ Tidak perlu dismiss manual
- ✅ Lebih modern & clean
- ✅ Auto-hide setelah 3 detik

---

## 🎯 Best Practices

### 1. Keep Messages Short

```typescript
// Good ✅
toast.success('Profile updated');
toast.error('Invalid email');

// Too long ❌
toast.error('Failed to update the profile because the server returned an error...');
```

---

### 2. Use Appropriate Type

```typescript
// Good ✅
toast.error('Invalid password');
toast.success('Login successful');

// Wrong type ❌
toast.success('Invalid password'); // Should be error!
```

---

### 3. Toast for Quick Feedback, Alert for Important Decisions

```typescript
// Use Toast ✅
toast.success('Saved');
toast.error('Failed to save');

// Use Alert ✅
alert.confirm('Logout', 'Are you sure?', handleLogout);
```

---

### 4. Don't Show Multiple Toasts at Once

```typescript
// Bad ❌
toast.success('Action 1 done');
toast.success('Action 2 done'); // Will override first toast

// Good ✅
await action1();
toast.success('Action 1 done');
await action2();
toast.success('Action 2 done');
```

---

## 📊 Examples in Code

Check these files for real examples:

### **Login Screen** - [app/(auth)/login.tsx](app/(auth)/login.tsx)

```typescript
// Success toast after login
toast.success('Login successful!');

// Error toast for invalid credentials
toast.error('Invalid email or password');

// Error toast for registration
toast.error('Failed to create account');
```

---

### **Profile Screen** - [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx)

```typescript
// Success toast after profile update
toast.success('Profile updated successfully');
```

---

## 🎨 Styling

Toast follows Scory Design System:

```typescript
// Colors
Success: #22C55E (Green)
Error: #EF4444 (Red)
Warning: #FACC15 (Yellow)
Info: #3B82F6 (Blue)

// Typography
Font: Poppins SemiBold
Size: 14px (sm)

// Spacing
Padding: 16px horizontal, 16px vertical
```

---

## 🆚 Toast vs Alert Comparison

| Feature | Toast 🍞 | Alert 🔔 |
|---------|---------|---------|
| **Auto Hide** | ✅ Yes (3s) | ❌ No |
| **Blocking** | ❌ No | ✅ Yes |
| **Buttons** | ❌ No | ✅ Yes |
| **Position** | Top/Bottom | Center |
| **Animation** | Slide | Scale |
| **Best for** | Quick feedback | Confirmations |

---

## ✨ Advanced Usage

### Queue Multiple Toasts

```typescript
const showMultiple = async () => {
  toast.success('Step 1 completed');

  await delay(3500); // Wait for first toast to hide

  toast.success('Step 2 completed');
};
```

---

### Different Positions

```typescript
// Show at top (default)
toast.success('Saved to cloud');

// Show at bottom for less intrusive message
toast.info('Syncing...', 2000, 'bottom');
```

---

## 🎉 Summary

✅ **Simple** - One line of code
✅ **Fast** - Auto-hide after 3 seconds
✅ **Beautiful** - Animated, colored, clean
✅ **Non-blocking** - User can keep working
✅ **Reusable** - One toast for entire app

Perfect untuk notifikasi cepat yang tidak mengganggu! 🚀
