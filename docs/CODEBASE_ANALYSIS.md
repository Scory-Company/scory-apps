# Scory Codebase Analysis

> Dokumentasi lengkap arsitektur dan struktur kode aplikasi Scory
> Terakhir diperbarui: 21 November 2025

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Fitur Utama](#4-fitur-utama)
5. [Arsitektur & Patterns](#5-arsitektur--patterns)
6. [Navigasi](#6-navigasi)
7. [Komponen](#7-komponen)
8. [Data Layer](#8-data-layer)
9. [Theme & Styling](#9-theme--styling)
10. [Services & API](#10-services--api)
11. [Lokalisasi (i18n)](#11-lokalisasi-i18n)
12. [State Management](#12-state-management)
13. [Rekomendasi Pengembangan](#13-rekomendasi-pengembangan)

---

## 1. Overview

**Scory** adalah aplikasi mobile React Native/Expo yang dirancang untuk mendemokratisasi akses penelitian akademik melalui **adaptive reading levels**. Aplikasi ini memungkinkan pengguna membaca jurnal/artikel dengan tingkat kompleksitas yang disesuaikan dengan kemampuan mereka.

### Konsep Utama
- **Adaptive Reading**: Konten disesuaikan berdasarkan level bacaan (Simple, Student, Academic, Expert)
- **Personalization Quiz**: Quiz untuk menentukan level bacaan yang sesuai
- **Multi-language**: Dukungan Bahasa Indonesia dan English
- **Modern UX**: Animasi, notifikasi, lazy loading, dan UI yang polished

---

## 2. Tech Stack

### Framework & Platform
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.4 | Mobile framework |
| Expo | 54.0.10 | Development platform |
| React | 19.1.0 | UI library |
| TypeScript | 5.9.2 | Type safety |

### Navigation
| Package | Version | Purpose |
|---------|---------|---------|
| expo-router | 6.0.8 | File-based routing |
| React Navigation | 7.1.8 | Navigation core |
| react-native-screens | 4.16.0 | Native screens |

### State & Storage
| Package | Purpose |
|---------|---------|
| AsyncStorage | Persistent storage |
| Context API | Global state |

### API & Authentication
| Package | Version | Purpose |
|---------|---------|---------|
| axios | 1.13.2 | HTTP client |
| expo-auth-session | 7.0.8 | OAuth |
| @react-native-google-signin | 16.0.0 | Google Sign-In |

### Internationalization
| Package | Version |
|---------|---------|
| i18next | 25.6.2 |
| react-i18next | 16.3.3 |

### UI & Animations
| Package | Purpose |
|---------|---------|
| react-native-reanimated | Animations |
| react-native-gesture-handler | Gestures |
| expo-linear-gradient | Gradients |
| Poppins font | Typography |

---

## 3. Project Structure

```
scory-apps/
├── app/                          # Screens & Navigation (Expo Router)
│   ├── (splash)/                 # Splash screen
│   ├── (auth)/                   # Authentication screens
│   ├── (onboarding)/             # First-time user onboarding
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── index.tsx             # Home
│   │   ├── explore.tsx           # Explore
│   │   ├── learn.tsx             # Learn
│   │   └── profile.tsx           # Profile
│   ├── article/[id].tsx          # Article detail (dynamic)
│   ├── category/[name].tsx       # Category detail (dynamic)
│   ├── notifications.tsx         # Notifications
│   ├── personalization.tsx       # Personalization quiz
│   ├── popular-articles.tsx      # Popular articles list
│   └── top-rated-articles.tsx    # Top rated articles list
│
├── features/                     # Feature modules
│   ├── home/components/          # Home screen components
│   ├── explore/components/       # Explore screen components
│   ├── learn/components/         # Learn screen components
│   ├── profile/components/       # Profile screen components
│   ├── article/components/       # Article detail components
│   ├── auth/                     # Auth components & utils
│   ├── shared/                   # Shared components & hooks
│   ├── settings/                 # Settings & language
│   └── onboarding/               # Onboarding flow
│
├── components/                   # Global UI components
│   ├── custom-tab-bar.tsx        # Custom bottom navigation
│   └── ui/                       # UI primitives
│
├── constants/                    # Design tokens & config
│   ├── theme.ts                  # Colors, typography, spacing
│   └── readingLevels.ts          # Reading level definitions
│
├── data/mock/                    # Mock data
│   ├── articles.ts               # Article data
│   ├── categories.ts             # Categories
│   ├── topics.ts                 # Trending topics
│   ├── notifications.ts          # Notifications
│   ├── personalization.ts        # Quiz questions
│   └── index.ts                  # Central exports
│
├── services/                     # API layer
│   ├── api.ts                    # Axios instance
│   ├── auth.ts                   # Auth functions
│   └── googleAuth.ts             # Google OAuth
│
├── utils/                        # Utilities
│   ├── i18n.ts                   # i18n config
│   └── filterContent.ts          # Content filtering
│
├── locales/                      # Translations
│   ├── en.json                   # English
│   └── id.json                   # Indonesian
│
├── hooks/                        # Global hooks
├── assets/                       # Images & icons
└── docs/                         # Documentation
```

---

## 4. Fitur Utama

### 4.1 Authentication
- Email/password login & register
- Google OAuth (native Android/iOS)
- JWT token management dengan auto-refresh
- Password strength indicator
- Session persistence

### 4.2 Home Screen
- Greeting card dengan notification badge
- Hero banner
- Personalization card / For You section (conditional)
- Category grid navigation
- Popular articles dengan lazy loading

### 4.3 Explore Screen
- Search dengan real-time filtering
- Category filter chips
- Trending topics dengan gradient cards
- Top rated articles dengan ranking badge
- Recently added articles
- FilteredContentView untuk hasil search

### 4.4 Learn Screen
- Learning statistics (streak, articles read, minutes)
- Weekly goal progress
- Study collections
- Reading insights/notes

### 4.5 Profile Screen
- User info dengan edit modal
- Quick stats
- Settings menu
- Language selector
- Logout

### 4.6 Personalization
- Quiz-based reading level assessment
- 4 levels: Simple, Student, Academic, Expert
- Progress animation
- Result dengan recommendations
- AsyncStorage persistence

### 4.7 Notifications
- Modal quick view (3 latest)
- Full page dengan filter (All/Unread)
- Grouped by time (Today, Yesterday, etc.)
- Badge indicator di GreetingsCard

---

## 5. Arsitektur & Patterns

### 5.1 Feature-Based Architecture
```
features/
├── home/
│   └── components/     # Home-specific components
├── explore/
│   └── components/     # Explore-specific components
├── shared/
│   ├── components/     # Reusable across features
│   └── hooks/          # Shared hooks
```

**Keuntungan:**
- Isolasi fitur
- Mudah maintain
- Clear ownership
- Scalable

### 5.2 Component Patterns

#### Functional Components
```typescript
export function CardArticle({
  image,
  title,
  author,
  rating,
  onPress,
}: CardArticleProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* ... */}
    </TouchableOpacity>
  );
}
```

#### Compound Components (Modals)
```typescript
<NotificationModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  notifications={notifications}
/>
```

#### Custom Hooks
```typescript
const { showAlert, hideAlert, AlertComponent } = useAlert();
const { showToast, ToastComponent } = useToast();
```

### 5.3 Data Flow
```
User Action
    ↓
Component (useState/useEffect)
    ↓
Service Layer (API calls)
    ↓
AsyncStorage (persistence)
    ↓
Context (global state)
    ↓
UI Update
```

---

## 6. Navigasi

### 6.1 Navigation Structure
```
Root Stack
├── (splash)        → Splash screen
├── (onboarding)    → Welcome flow
├── (auth)          → Login/Register
├── (tabs)          → Main app
│   ├── Home
│   ├── Explore
│   ├── Learn
│   └── Profile
├── article/[id]    → Article detail
├── category/[name] → Category detail
├── notifications   → Notifications
├── personalization → Quiz
├── popular-articles
└── top-rated-articles
```

### 6.2 Navigation Flow
```
App Launch
    ↓
Splash (2s delay)
    ↓
Check Session (AsyncStorage)
    ↓
├── Has Token → Tabs (Home)
└── No Token
        ↓
    Check Onboarding
        ↓
    ├── Not Completed → Onboarding
    └── Completed → Auth (Login)
```

### 6.3 Custom Tab Bar
```typescript
// components/custom-tab-bar.tsx
- 5 tabs: Home, Explore, Upload (center), Learn, Profile
- Center button dengan gradient
- Active/inactive states
- Badge support
```

---

## 7. Komponen

### 7.1 Home Components
| Component | Purpose |
|-----------|---------|
| `GreetingsCard` | Welcome + notification badge |
| `HeroBanner` | Promotional banner dengan gradient |
| `PersonalizationCard` | First-time user setup CTA |
| `ForYouSection` | Personalized recommendations |
| `CategoryCard` | Category grid item |
| `SectionHeader` | Section title + View All |

### 7.2 Explore Components
| Component | Purpose |
|-----------|---------|
| `SearchBar` | Search input |
| `CategoryFilterChips` | Horizontal filter chips |
| `TrendingTopicCard` | Trending topic dengan gradient |
| `TopRatedCard` | Ranked article (1-3 badge) |
| `RecentlyAddedCard` | Timeline-style article |
| `FilteredContentView` | Search results display |

### 7.3 Shared Components
| Component | Purpose |
|-----------|---------|
| `CardArticle` | Reusable article card |
| `NotificationModal` | Notification quick view |
| `BottomSheetModal` | Swipe-to-dismiss modal |
| `CustomAlert` | Alert dialog |
| `Toast` | Temporary notification |
| `EmptyState` | No content placeholder |
| `ViewAllPrompt` | View all CTA |

### 7.4 Shared Hooks
| Hook | Purpose |
|------|---------|
| `useAlert()` | Alert management |
| `useToast()` | Toast notifications |

---

## 8. Data Layer

### 8.1 Mock Data Structure
```typescript
// data/mock/index.ts - Central exports
export { forYouArticles, recentlyAddedArticles, topRatedArticles, popularArticles } from './articles';
export { categoryList, categoryCards } from './categories';
export { trendingTopics } from './topics';
export { notifications, getUnreadCount, getTimeAgo } from './notifications';
export { PERSONALIZATION_QUIZ, LEVEL_EMOJIS } from './personalization';
```

### 8.2 Article Interface
```typescript
interface Article {
  id: number;
  image: ImageSourcePropType;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads?: string;
  date?: string;
  badge?: string;
}
```

### 8.3 Notification Interface
```typescript
interface Notification {
  id: string;
  type: 'article' | 'achievement' | 'system' | 'social';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
  iconColor: string;
  actionUrl?: string;
}
```

---

## 9. Theme & Styling

### 9.1 Color Palette
```typescript
// constants/theme.ts
Colors.light = {
  primary: '#26EE5A',        // Bright green
  primaryLight: '#74E99D',   // Light green
  primaryDark: '#000000',    // Black
  secondary: '#282828',      // Dark gray
  third: '#19A03DFF',        // Accent green

  // Status colors
  success: '#22C55E',
  warning: '#FACC15',
  error: '#EF4444',
  info: '#3B82F6',

  // Background & surface
  background: '#F9FAFB',
  surface: '#FFFFFF',

  // Text
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#9CA3AF',
}
```

### 9.2 Typography
```typescript
Typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  fontSize: {
    xs: 12, sm: 14, base: 16, lg: 18,
    xl: 20, '2xl': 24, '3xl': 28, '4xl': 32,
  },
}
```

### 9.3 Spacing
```typescript
Spacing = {
  xxs: 2, xs: 4, sm: 8, md: 16,
  lg: 24, xl: 32, '2xl': 40, '3xl': 48, '4xl': 64,
}
```

### 9.4 Border Radius
```typescript
Radius = {
  none: 0, sm: 4, md: 8, lg: 12,
  xl: 16, '2xl': 24, full: 9999,
}
```

---

## 10. Services & API

### 10.1 API Configuration
```typescript
// services/api.ts
const API_URL = __DEV__
  ? 'http://192.168.18.150:5000/api/v1'
  : 'https://api.scory.app/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor untuk JWT
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 10.2 Auth Service
```typescript
// services/auth.ts
export async function loginWithEmail(email: string, password: string);
export async function registerWithEmail(email: string, password: string, fullName: string, nickname?: string);
export async function getProfile();
export async function updateProfile(data: Partial<User>);
export async function logout();
export async function checkSession();
```

### 10.3 API Endpoints
```
POST /auth/register     - Register user
POST /auth/login        - Login user
POST /auth/google       - Google OAuth
POST /auth/logout       - Logout
GET  /profile           - Get profile
PATCH /profile          - Update profile
```

---

## 11. Lokalisasi (i18n)

### 11.1 Setup
```typescript
// utils/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'id',                    // Default Indonesian
  fallbackLng: 'en',
  resources: { en, id },
  interpolation: { escapeValue: false },
});
```

### 11.2 Language Context
```typescript
// features/settings/context/LanguageContext.tsx
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('id');

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('language', lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

### 11.3 Usage
```typescript
const { t } = useTranslation();
const { language, changeLanguage } = useLanguage();

// In JSX
<Text>{t('home.greeting')}</Text>
```

### 11.4 Translation Structure
```json
// locales/id.json
{
  "common": {
    "save": "Simpan",
    "cancel": "Batal"
  },
  "home": {
    "greeting": "Halo, {{name}}"
  },
  "personalization": {
    "header": {
      "questionLabel": "Pertanyaan {{current}} dari {{total}}"
    }
  }
}
```

---

## 12. State Management

### 12.1 Local State
```typescript
// Component-level state
const [isLoading, setIsLoading] = useState(false);
const [articles, setArticles] = useState([]);
```

### 12.2 Persistent State
```typescript
// AsyncStorage keys
'token'                         // JWT token
'user'                          // User object
'userReadingLevel'              // Reading level
'language'                      // Language preference
'onboarding_completed'          // Onboarding status
'hasSeenPersonalizationTutorial'
```

### 12.3 Context State
```typescript
// Global contexts
<LanguageProvider>              // Language state
<ThemeProvider>                 // Theme state (React Navigation)
```

### 12.4 State Flow Example
```typescript
// Home screen personalization check
const hasCompletedPersonalization = false;  // Toggle for testing
const userReadingLevel: ReadingLevel = 'student';

// Conditional rendering
{hasCompletedPersonalization ? (
  <ForYouSection readingLevel={userReadingLevel} />
) : (
  <PersonalizationCard onPress={() => router.push('/personalization')} />
)}
```

---

## 13. Rekomendasi Pengembangan

### 13.1 Performance
- [ ] Implementasi React.memo untuk komponen yang sering re-render
- [ ] Gunakan useMemo/useCallback untuk expensive computations
- [ ] Implementasi image caching
- [ ] Virtual list untuk long lists (FlashList)

### 13.2 State Management
- [ ] Pertimbangkan Zustand atau Jotai untuk global state
- [ ] Implementasi React Query untuk server state
- [ ] Proper error boundaries

### 13.3 Testing
- [ ] Unit tests dengan Jest
- [ ] Component tests dengan React Native Testing Library
- [ ] E2E tests dengan Detox

### 13.4 Code Quality
- [ ] Strict TypeScript mode
- [ ] ESLint rules enforcement
- [ ] Prettier formatting
- [ ] Husky pre-commit hooks

### 13.5 Features
- [ ] Offline support dengan data caching
- [ ] Push notifications
- [ ] Deep linking
- [ ] Analytics integration
- [ ] Crash reporting (Sentry)

### 13.6 Accessibility
- [ ] Screen reader support
- [ ] Proper accessibility labels
- [ ] Color contrast compliance
- [ ] Font scaling support

---

## Summary

Scory adalah aplikasi yang well-structured dengan arsitektur feature-based yang clean. Kode terorganisir dengan baik, menggunakan patterns yang konsisten, dan siap untuk dikembangkan lebih lanjut.

**Strengths:**
- Clean architecture dengan separation of concerns
- Reusable components
- Multi-language support
- Comprehensive theming system
- Good error handling

**Areas for Improvement:**
- Global state management bisa lebih robust
- Testing coverage
- Performance optimizations
- Offline support

---

*Dokumentasi ini di-generate pada 21 November 2025*
