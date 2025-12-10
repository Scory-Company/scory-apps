# Premium Feature Module

## 📦 Components

### PremiumUpgradeModal
Beautiful, full-featured premium upgrade modal dengan pricing dan feature showcase.

**Features:**
- ✨ Gradient header dengan diamond icon
- 📋 List lengkap premium features dengan icons
- 💰 Pricing cards (Monthly & Yearly dengan badge HEMAT 40%)
- 🎯 Trigger feature banner (shows which feature triggered the modal)
- 📱 Responsive design dengan smooth animations
- 🎨 Consistent dengan design system

**Props:**
```typescript
interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  triggerFeature?: string; // e.g., "Re-simplify Artikel", "Level STUDENT"
}
```

**Usage:**
```tsx
import { PremiumUpgradeModal } from '@/features/premium';

<PremiumUpgradeModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onUpgrade={() => router.push('/premium/checkout')}
  triggerFeature="Re-simplify Artikel"
/>
```

---

## 🪝 Hooks

### usePremiumModal
Custom hook untuk mengelola state dan logic PremiumUpgradeModal.

**Returns:**
```typescript
{
  showPremiumModal: (feature?: string) => void;
  hidePremiumModal: () => void;
  PremiumModal: () => JSX.Element | null;
}
```

**Usage:**
```tsx
import { usePremiumModal } from '@/features/premium';

function MyComponent() {
  const { showPremiumModal, PremiumModal } = usePremiumModal();

  const handlePremiumFeature = () => {
    // Check if user has premium
    if (!hasPremium) {
      showPremiumModal('Feature Name');
      return;
    }

    // Proceed with premium feature
  };

  return (
    <>
      <Button onPress={handlePremiumFeature}>
        Premium Feature
      </Button>
      <PremiumModal />
    </>
  );
}
```

---

## 💎 Premium Features List

1. **All Reading Levels** - Akses semua level: Simple, Student, Academic, Expert
2. **Unlimited Re-simplify** - Re-simplify artikel ke level berbeda tanpa batas
3. **Priority Processing** - Simplify artikel lebih cepat dengan priority queue
4. **Unlimited Bookmarks** - Simpan artikel favorit tanpa batas
5. **Advanced Insights** - Akses analytics dan progress tracking lengkap
6. **Offline Access** - Download artikel untuk dibaca offline

---

## 💰 Pricing

### Monthly Plan
- **Price:** Rp 49.000/bulan
- **Description:** Langganan bulanan, cancel kapan saja

### Yearly Plan (Best Value)
- **Price:** Rp 349.000/tahun
- **Badge:** HEMAT 40%
- **Savings:** Hemat Rp 239.000 per tahun!

---

## 🎨 Design

### Colors
- Primary gradient: `#FF6B6B` → `#FFA500` → `#FFD700`
- Icon background: Primary color + 15% opacity
- Success checkmarks: Theme success color

### Layout
- Modal height: 90% of screen height
- Bottom sheet animation (slide from bottom)
- Scrollable content area
- Fixed bottom CTA button

### Icons (Ionicons)
- Header: `diamond`
- Features: `layers`, `refresh`, `document-text`, `bookmarks`, `analytics`, `download`
- Checkmarks: `checkmark-circle`
- Trigger banner: `lock-closed`

---

## 🔗 Integration Examples

### 1. With useResimplify
```tsx
// hooks/useResimplify.ts
import { usePremiumModal } from '@/features/premium';

export function useResimplify() {
  const { showPremiumModal, PremiumModal } = usePremiumModal();

  const resimplify = async (articleId, level) => {
    if (!hasPremium) {
      showPremiumModal(`Level ${level}`);
      return false;
    }
    // Proceed...
  };

  return { resimplify, PremiumModal };
}
```

### 2. With useSimplifyPaper
```tsx
// hooks/useSimplifyPaper.ts
import { usePremiumModal } from '@/features/premium';

export function useSimplifyPaper() {
  const { showPremiumModal, PremiumModal } = usePremiumModal();

  const simplify = async (request) => {
    if (!hasPremium) {
      showPremiumModal('Simplify External Paper');
      return null;
    }
    // Proceed...
  };

  return { simplify, PremiumModal };
}
```

### 3. Direct Usage
```tsx
import { usePremiumModal } from '@/features/premium';

function BookmarkButton({ articleId }) {
  const { showPremiumModal, PremiumModal } = usePremiumModal();
  const bookmarkCount = useBookmarkCount();

  const handleBookmark = () => {
    if (!hasPremium && bookmarkCount >= 5) {
      showPremiumModal('Unlimited Bookmarks');
      return;
    }
    // Save bookmark
  };

  return (
    <>
      <TouchableOpacity onPress={handleBookmark}>
        <Ionicons name="bookmark" />
      </TouchableOpacity>
      <PremiumModal />
    </>
  );
}
```

---

## 🚀 Next Steps (Backend Integration)

### 1. User Premium Status
```typescript
// contexts/AuthContext.tsx
interface User {
  id: string;
  email: string;
  isPremium: boolean;
  premiumExpiry?: Date;
}

// Hook usage
const { user } = useAuth();
const hasPremium = user?.isPremium || false;
```

### 2. Payment Integration
```typescript
// features/premium/hooks/usePremiumModal.tsx
const handleUpgrade = () => {
  // Navigate to payment page
  router.push('/premium/checkout');

  // Or open payment modal
  openPaymentModal({
    plan: 'yearly', // or 'monthly'
    onSuccess: () => {
      // Refresh user data
      refetchUser();
      hidePremiumModal();
    }
  });
};
```

### 3. Feature Gating
```typescript
// utils/premiumFeatures.ts
export const PREMIUM_FEATURES = {
  RE_SIMPLIFY: 'resimplify',
  ALL_LEVELS: 'allLevels',
  UNLIMITED_BOOKMARKS: 'unlimitedBookmarks',
  OFFLINE_ACCESS: 'offlineAccess',
} as const;

export function checkPremiumFeature(
  user: User | null,
  feature: keyof typeof PREMIUM_FEATURES
): boolean {
  if (!user?.isPremium) return false;
  if (user.premiumExpiry && new Date() > user.premiumExpiry) return false;
  return true;
}
```

---

## 📝 TODO

- [ ] Implement payment gateway integration (Midtrans/Xendit)
- [ ] Add analytics tracking for premium modal views/conversions
- [ ] Create premium subscription management page
- [ ] Add trial period logic (7 days free trial)
- [ ] Implement referral program for premium upgrades
- [ ] Add testimonials section in premium modal
- [ ] Create admin dashboard for premium user management

---

**Last Updated:** 2025-12-10
**Status:** ✅ Frontend Complete, ⏳ Backend Pending
