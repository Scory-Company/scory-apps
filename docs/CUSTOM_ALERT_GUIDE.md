# 🎨 Custom Alert Component Guide

Dokumentasi lengkap untuk menggunakan Custom Alert yang cantik dan reusable.

---

## 📋 Features

✅ **4 Alert Types** - Success, Error, Warning, Info
✅ **Custom Icons** - Colored icons sesuai type
✅ **Animated** - Spring animation untuk smooth appearance
✅ **Flexible Buttons** - Primary, Secondary, atau keduanya
✅ **Easy to Use** - Hook-based API
✅ **Shorthand Methods** - `success()`, `error()`, `warning()`, `info()`, `confirm()`
✅ **Design System** - Consistent dengan Scory theme

---

## 📁 File Structure

```
features/
  └── shared/
      ├── components/
      │   ├── CustomAlert.tsx      # Alert component
      │   └── index.ts             # Export
      └── hooks/
          └── useAlert.tsx         # Alert hook
```

---

## 🚀 Quick Start

### 1. Import Hook

```typescript
import { useAlert } from '@/features/shared/hooks/useAlert';
```

### 2. Initialize Hook

```typescript
const alert = useAlert();
```

### 3. Show Alert

```typescript
// Success
alert.success('Success!', 'Profile updated successfully');

// Error
alert.error('Error', 'Failed to update profile');

// Warning
alert.warning('Warning', 'Are you sure?');

// Info
alert.info('Info', 'New feature available');

// Confirm (with 2 buttons)
alert.confirm(
  'Logout',
  'Are you sure you want to logout?',
  () => console.log('Confirmed'),
  () => console.log('Cancelled')
);
```

### 4. Add Alert Component to JSX

```typescript
return (
  <View>
    {/* Your content */}

    <alert.AlertComponent />
  </View>
);
```

---

## 📖 Usage Examples

### Example 1: Success Alert

```typescript
import { useAlert } from '@/features/shared/hooks/useAlert';

export default function ProfileScreen() {
  const alert = useAlert();

  const handleSave = async () => {
    try {
      await updateProfile(data);
      alert.success('Success', 'Profile updated successfully');
    } catch (error) {
      alert.error('Error', 'Failed to update profile');
    }
  };

  return (
    <View>
      <Button onPress={handleSave}>Save</Button>
      <alert.AlertComponent />
    </View>
  );
}
```

**Result:**
```
┌─────────────────────────────┐
│                             │
│         ✅                   │
│     (Green circle)          │
│                             │
│        Success              │
│                             │
│  Profile updated            │
│    successfully             │
│                             │
│         [  OK  ]            │
│                             │
└─────────────────────────────┘
```

---

### Example 2: Confirm Dialog

```typescript
const handleLogout = () => {
  alert.confirm(
    'Logout',
    'Are you sure you want to logout?',
    async () => {
      // Confirmed - do logout
      await logout();
      router.replace('/login');
    },
    () => {
      // Cancelled - do nothing
      console.log('Logout cancelled');
    }
  );
};
```

**Result:**
```
┌─────────────────────────────┐
│                             │
│         ⚠️                   │
│    (Yellow warning)         │
│                             │
│        Logout               │
│                             │
│  Are you sure you want      │
│      to logout?             │
│                             │
│  [ Cancel ] [ Confirm ]     │
│                             │
└─────────────────────────────┘
```

---

### Example 3: Custom Alert with Custom Buttons

```typescript
alert.showAlert({
  type: 'warning',
  title: 'Delete Item',
  message: 'This action cannot be undone',
  primaryButton: {
    text: 'Delete',
    onPress: () => handleDelete(),
  },
  secondaryButton: {
    text: 'Keep',
    onPress: () => console.log('Kept'),
  },
});
```

---

## 🎨 Alert Types

### 1. Success ✅

```typescript
alert.success('Success', 'Operation completed');
```

- **Icon:** Checkmark circle
- **Color:** Green (`#22C55E`)
- **Use for:** Successful operations

---

### 2. Error ❌

```typescript
alert.error('Error', 'Something went wrong');
```

- **Icon:** Close circle
- **Color:** Red (`#EF4444`)
- **Use for:** Failed operations, errors

---

### 3. Warning ⚠️

```typescript
alert.warning('Warning', 'Please be careful');
```

- **Icon:** Warning triangle
- **Color:** Yellow (`#FACC15`)
- **Use for:** Warnings, confirmations

---

### 4. Info ℹ️

```typescript
alert.info('Info', 'New update available');
```

- **Icon:** Information circle
- **Color:** Blue (`#3B82F6`)
- **Use for:** Informational messages

---

## 🔧 API Reference

### Hook: `useAlert()`

Returns object with methods:

| Method | Parameters | Description |
|--------|-----------|-------------|
| `success()` | `(title, message, onClose?)` | Show success alert |
| `error()` | `(title, message, onClose?)` | Show error alert |
| `warning()` | `(title, message, onClose?)` | Show warning alert |
| `info()` | `(title, message, onClose?)` | Show info alert |
| `confirm()` | `(title, message, onConfirm, onCancel?)` | Show confirm dialog |
| `showAlert()` | `(config)` | Show custom alert |
| `hideAlert()` | `()` | Hide current alert |
| `AlertComponent` | Component | Alert component to render |

---

### Full showAlert() Config

```typescript
alert.showAlert({
  type: 'success' | 'error' | 'warning' | 'info',
  title: 'Alert Title',
  message: 'Alert message here',
  primaryButton: {
    text: 'Confirm',
    onPress: () => console.log('Primary pressed'),
  },
  secondaryButton: {
    text: 'Cancel',
    onPress: () => console.log('Secondary pressed'),
  },
});
```

---

## 🎭 Animation

Alert uses **Spring animation** for smooth entrance:

```typescript
Animated.spring(scaleValue, {
  toValue: 1,
  useNativeDriver: true,
  friction: 8,
  tension: 100,
}).start();
```

---

## 📱 Responsive Design

- **Max Width:** 400px
- **Padding:** Dynamic based on screen size
- **Backdrop:** Semi-transparent overlay
- **Dismissible:** Tap outside to close (optional)

---

## ✨ Styling

Custom Alert follows Scory Design System:

```typescript
// Colors
import { Colors } from '@/constants/theme';

// Typography
import { Typography } from '@/constants/theme';

// Spacing
import { Spacing } from '@/constants/theme';

// Shadows
import { Shadows } from '@/constants/theme';
```

---

## 🔄 Migration from Alert.alert

### Before (Native Alert):

```typescript
Alert.alert('Success', 'Profile updated');

Alert.alert(
  'Logout',
  'Are you sure?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Logout', onPress: handleLogout },
  ]
);
```

### After (Custom Alert):

```typescript
alert.success('Success', 'Profile updated');

alert.confirm(
  'Logout',
  'Are you sure?',
  handleLogout
);
```

---

## 🎯 Best Practices

1. **Always add AlertComponent to JSX**
   ```typescript
   <alert.AlertComponent />
   ```

2. **Use shorthand methods when possible**
   ```typescript
   // Good
   alert.success('Success', 'Done');

   // Avoid (unless custom config needed)
   alert.showAlert({ type: 'success', ... });
   ```

3. **Keep messages concise**
   ```typescript
   // Good
   alert.error('Error', 'Failed to save');

   // Too long
   alert.error('Error', 'Failed to save the data because the server returned an error and...');
   ```

4. **Use appropriate alert type**
   ```typescript
   // Good
   alert.confirm('Delete', 'Are you sure?', ...);

   // Wrong type
   alert.success('Delete', 'Are you sure?', ...);
   ```

---

## 📊 Examples in Code

Check these files for real examples:

- **Profile Screen:** [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx:59-72)
  ```typescript
  // Success alert
  alert.success('Success', 'Profile updated successfully');

  // Confirm dialog
  alert.confirm('Logout', 'Are you sure?', handleLogout);
  ```

- **Login Screen:** [app/(auth)/login.tsx](app/(auth)/login.tsx:34-36)
  ```typescript
  // Error alert
  alert.error('Login Error', error.message);
  ```

---

## 🎉 Summary

✅ **Beautiful** - Animated, colored, icon-based alerts
✅ **Easy to use** - Simple hook API
✅ **Consistent** - Follows design system
✅ **Flexible** - Shorthand or custom config
✅ **Reusable** - One alert component for entire app

Replace all `Alert.alert()` with custom alerts for better UX! 🚀
