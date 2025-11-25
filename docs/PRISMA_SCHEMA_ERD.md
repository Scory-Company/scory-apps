# Prisma Schema ERD untuk Scory

Tambahkan schema berikut ke file `schema.prisma` di backend:

```prisma
// ============================================
// ENUMS
// ============================================

enum AuthProvider {
  LOCAL
  GOOGLE
}

enum Role {
  CLIENT
  REVIEWER
  ADMIN
}

enum ReadingLevel {
  SIMPLE
  STUDENT
  ACADEMIC
  EXPERT
}

enum NotificationType {
  ARTICLE
  ACHIEVEMENT
  REMINDER
  SYSTEM
}

// ============================================
// USER & AUTH
// ============================================

model User {
  id            String       @id @default(uuid())
  email         String       @unique
  password      String?
  fullName      String       @map("full_name")
  nickname      String?
  avatarUrl     String?      @map("avatar_url")
  authProvider  AuthProvider @default(LOCAL) @map("auth_provider")
  googleId      String?      @unique @map("google_id")
  role          Role         @default(CLIENT)
  isVerified    Boolean      @default(false) @map("is_verified")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  // Relations
  sessions           Session[]
  personalization    UserPersonalization?
  topicInterests     UserTopicInterest[]
  readingHistory     ReadingHistory[]
  bookmarks          Bookmark[]
  quizAttempts       QuizAttempt[]
  insightNotes       InsightNote[]
  studyCollections   StudyCollection[]
  notifications      Notification[]
  weeklyGoals        WeeklyGoal[]

  // Gamification
  stats              UserStats?
  badges             UserBadge[]
  xpTransactions     XpTransaction[]
  leaderboards       Leaderboard[]

  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

// ============================================
// PERSONALIZATION
// ============================================

model UserPersonalization {
  id           String       @id @default(uuid())
  userId       String       @unique @map("user_id")
  readingLevel ReadingLevel @default(SIMPLE) @map("reading_level")
  purpose      String?      // "curious", "student", "professional", "researcher"
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_personalizations")
}

model UserTopicInterest {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  topicId   String   @map("topic_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic     Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@unique([userId, topicId])
  @@map("user_topic_interests")
}

// ============================================
// CATEGORIES & TOPICS
// ============================================

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?
  icon        String?   // icon name or URL
  color       String?   // hex color
  order       Int       @default(0)
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  articles    Article[]

  @@map("categories")
}

model Topic {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?
  articleCount Int      @default(0) @map("article_count")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  articles        ArticleTopic[]
  userInterests   UserTopicInterest[]

  @@map("topics")
}

// ============================================
// ARTICLES
// ============================================

model Article {
  id              String    @id @default(uuid())
  title           String
  slug            String    @unique
  excerpt         String?   // short description
  categoryId      String    @map("category_id")
  authorName      String    @map("author_name")
  authorAvatar    String?   @map("author_avatar")
  imageUrl        String?   @map("image_url")
  readTimeMinutes Int       @default(5) @map("read_time_minutes")

  // Rating & Popularity metrics
  rating          Float     @default(0)           // average rating
  totalRatings    Int       @default(0) @map("total_ratings")
  viewCount       Int       @default(0) @map("view_count")        // all-time views
  viewCountWeek   Int       @default(0) @map("view_count_week")   // reset weekly (for trending)
  readCount       Int       @default(0) @map("read_count")        // completed reads
  bookmarkCount   Int       @default(0) @map("bookmark_count")    // save count

  // Publishing
  isPublished     Boolean   @default(false) @map("is_published")
  isFeatured      Boolean   @default(false) @map("is_featured")   // editor's pick
  publishedAt     DateTime? @map("published_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  category        Category  @relation(fields: [categoryId], references: [id])
  contents        ArticleContent[]
  topics          ArticleTopic[]
  quizQuestions   QuizQuestion[]
  keyInsights     KeyInsight[]
  readingHistory  ReadingHistory[]
  bookmarks       Bookmark[]
  quizAttempts    QuizAttempt[]
  insightNotes    InsightNote[]

  @@index([categoryId])
  @@index([isPublished, publishedAt])
  @@map("articles")
}

model ArticleContent {
  id           String       @id @default(uuid())
  articleId    String       @map("article_id")
  readingLevel ReadingLevel @map("reading_level")

  // Flexible content blocks - JSON array of content blocks
  // Each block has: { type, data }
  // Types: "text", "heading", "quote", "list", "image", "infographic", "callout", "divider"
  blocks       Json         @default("[]")

  // Example blocks structure:
  // [
  //   { "type": "heading", "data": { "text": "Abstract", "level": 2 } },
  //   { "type": "text", "data": { "text": "This research explores..." } },
  //   { "type": "callout", "data": { "text": "Key point here", "style": "info" } },
  //   { "type": "list", "data": { "items": ["Point 1", "Point 2"], "style": "bullet" } },
  //   { "type": "image", "data": { "url": "...", "caption": "Figure 1" } },
  //   { "type": "infographic", "data": { "url": "...", "alt": "Stats visualization" } },
  //   { "type": "quote", "data": { "text": "...", "author": "Dr. Smith" } }
  // ]

  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  article      Article      @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([articleId, readingLevel])
  @@map("article_contents")
}

// Content block types for reference (not a Prisma model, just documentation)
// enum ContentBlockType {
//   TEXT        - paragraph text
//   HEADING     - h1, h2, h3, etc.
//   QUOTE       - blockquote with optional author
//   LIST        - bullet or numbered list
//   IMAGE       - image with caption
//   INFOGRAPHIC - visual data/stats
//   CALLOUT     - highlighted box (info, warning, tip)
//   DIVIDER     - section separator
//   CODE        - code snippet (for technical articles)
//   TABLE       - data table
//   VIDEO       - embedded video
// }

model ArticleTopic {
  id        String   @id @default(uuid())
  articleId String   @map("article_id")
  topicId   String   @map("topic_id")

  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  topic     Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@unique([articleId, topicId])
  @@map("article_topics")
}

// ============================================
// COMPREHENSION (QUIZ & INSIGHTS)
// ============================================

model QuizQuestion {
  id           String   @id @default(uuid())
  articleId    String   @map("article_id")
  question     String
  options      Json     // ["option1", "option2", "option3", "option4"]
  correctIndex Int      @map("correct_index")
  order        Int      @default(0)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  article      Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@map("quiz_questions")
}

model KeyInsight {
  id        String   @id @default(uuid())
  articleId String   @map("article_id")
  content   String
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@map("key_insights")
}

model QuizAttempt {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  articleId      String   @map("article_id")
  score          Int
  totalQuestions Int      @map("total_questions")
  completedAt    DateTime @default(now()) @map("completed_at")

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article        Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([articleId])
  @@map("quiz_attempts")
}

model InsightNote {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  content   String   @db.Text
  isCustom  Boolean  @default(false) @map("is_custom") // true = user wrote, false = selected suggestion
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([articleId])
  @@map("insight_notes")
}

// ============================================
// USER ACTIVITY
// ============================================

model ReadingHistory {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  articleId       String   @map("article_id")
  progressPercent Int      @default(0) @map("progress_percent") // 0-100
  isCompleted     Boolean  @default(false) @map("is_completed")
  startedAt       DateTime @default(now()) @map("started_at")
  completedAt     DateTime? @map("completed_at")
  lastReadAt      DateTime @default(now()) @map("last_read_at")

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article         Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
  @@map("reading_history")
}

model Bookmark {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
  @@map("bookmarks")
}

model StudyCollection {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  name        String
  description String?
  articleIds  Json     @default("[]") @map("article_ids") // ["id1", "id2", ...]
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("study_collections")
}

// ============================================
// GAMIFICATION
// ============================================

model UserStats {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")

  // XP & Level
  totalXp           Int      @default(0) @map("total_xp")
  currentLevel      Int      @default(1) @map("current_level")

  // Streaks
  currentStreak     Int      @default(0) @map("current_streak")      // consecutive days
  longestStreak     Int      @default(0) @map("longest_streak")
  lastActiveDate    DateTime? @map("last_active_date")

  // Lifetime stats
  totalArticlesRead Int      @default(0) @map("total_articles_read")
  totalQuizzesPassed Int     @default(0) @map("total_quizzes_passed")
  totalInsightsSaved Int     @default(0) @map("total_insights_saved")
  totalReadingMinutes Int    @default(0) @map("total_reading_minutes")

  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_stats")
}

model Badge {
  id          String   @id @default(uuid())
  code        String   @unique  // "first_article", "streak_7", "quiz_master", etc.
  name        String
  description String
  icon        String   // icon name or URL
  category    String   // "reading", "quiz", "streak", "collection", "social"
  xpReward    Int      @default(0) @map("xp_reward")

  // Unlock criteria (stored as JSON for flexibility)
  // e.g., { "type": "articles_read", "count": 10 }
  // e.g., { "type": "streak", "days": 7 }
  // e.g., { "type": "quiz_score", "score": 100, "count": 5 }
  criteria    Json

  createdAt   DateTime @default(now()) @map("created_at")

  userBadges  UserBadge[]

  @@map("badges")
}

model UserBadge {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  badgeId   String   @map("badge_id")
  earnedAt  DateTime @default(now()) @map("earned_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge     Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([userId])
  @@map("user_badges")
}

model XpTransaction {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  amount      Int      // positive for gain, negative for spend (if any)
  source      String   // "article_read", "quiz_passed", "streak_bonus", "badge_earned", etc.
  sourceId    String?  @map("source_id")  // articleId, badgeId, etc.
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("xp_transactions")
}

model Leaderboard {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  period      String   // "weekly", "monthly", "all_time"
  periodStart DateTime @map("period_start")
  xpEarned    Int      @default(0) @map("xp_earned")
  rank        Int?
  updatedAt   DateTime @updatedAt @map("updated_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, period, periodStart])
  @@index([period, periodStart, xpEarned])
  @@map("leaderboards")
}

// ============================================
// GOALS & NOTIFICATIONS
// ============================================

model WeeklyGoal {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  targetArticles  Int      @default(5) @map("target_articles")
  completedArticles Int    @default(0) @map("completed_articles")
  targetMinutes   Int      @default(60) @map("target_minutes")
  completedMinutes Int     @default(0) @map("completed_minutes")
  weekStartDate   DateTime @map("week_start_date")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, weekStartDate])
  @@index([userId])
  @@map("weekly_goals")
}

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  type      NotificationType
  title     String
  message   String
  data      Json?            // additional data (articleId, etc.)
  isRead    Boolean          @default(false) @map("is_read")
  createdAt DateTime         @default(now()) @map("created_at")

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}
```

## ERD Diagram (Text)

```
┌─────────────────┐       ┌─────────────────────┐
│      User       │───────│ UserPersonalization │
└────────┬────────┘       └─────────────────────┘
         │
    ┌────┴────┬─────────────┬──────────────┐
    │         │             │              │
    ▼         ▼             ▼              ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
│Session │ │ Bookmark │ │QuizAttempt│ │InsightNote │
└────────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘
                │            │             │
                └────────────┴──────┬──────┘
                                    │
                                    ▼
┌──────────┐     ┌──────────┐  ┌─────────┐
│ Category │────▶│  Article │◀─│  Topic  │
└──────────┘     └────┬─────┘  └─────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
┌────────────────┐ ┌──────────┐ ┌──────────┐
│ ArticleContent │ │QuizQuestion│ │KeyInsight│
│ (per level)    │ └──────────┘ └──────────┘
└────────────────┘
```

## Flow Data

### 1. Personalization Flow
```
User Register → UserPersonalization (reading_level, purpose)
             → UserTopicInterest (selected topics)
```

### 2. Article Display Flow
```
Get User ReadingLevel → Fetch ArticleContent matching level
                     → Show personalized content
```

### 3. Reading Flow
```
User opens Article → Create/Update ReadingHistory (progress)
                  → Update viewCount
                  → Track reading time
```

### 4. Comprehension Flow
```
User completes Quiz → Create QuizAttempt (score, total)
User saves Insight → Create InsightNote (content, isCustom)
```

## Article Feed Queries

### 1. For You (Personalized)
```sql
-- Based on user's topic interests & reading history
SELECT a.* FROM articles a
JOIN article_topics at ON a.id = at.article_id
JOIN user_topic_interests uti ON at.topic_id = uti.topic_id
WHERE uti.user_id = :userId
  AND a.is_published = true
  AND a.id NOT IN (SELECT article_id FROM reading_history WHERE user_id = :userId AND is_completed = true)
ORDER BY a.rating DESC, a.published_at DESC
LIMIT 10
```

### 2. Trending (This Week)
```sql
-- High views this week
SELECT * FROM articles
WHERE is_published = true
ORDER BY view_count_week DESC, rating DESC
LIMIT 10
```

### 3. Most Popular (All Time)
```sql
-- Highest view count overall
SELECT * FROM articles
WHERE is_published = true
ORDER BY view_count DESC
LIMIT 10
```

### 4. Recently Added
```sql
-- Newest articles
SELECT * FROM articles
WHERE is_published = true
ORDER BY published_at DESC
LIMIT 10
```

### 5. Top Rated (This Week)
```sql
-- Highest rated with recent ratings
SELECT * FROM articles
WHERE is_published = true
  AND total_ratings > 0
ORDER BY rating DESC, total_ratings DESC
LIMIT 10
```

### 6. Featured / Editor's Pick
```sql
SELECT * FROM articles
WHERE is_published = true
  AND is_featured = true
ORDER BY published_at DESC
LIMIT 5
```

## Weekly Reset Job (Cron)
```typescript
// Run every Monday 00:00
async function resetWeeklyMetrics() {
  await prisma.article.updateMany({
    data: { viewCountWeek: 0 }
  });
}
```

## Gamification System

### XP Rewards Config
| Action | XP |
|--------|-----|
| Complete article | +20 |
| Pass quiz (100%) | +50 |
| Pass quiz (≥50%) | +25 |
| Save insight note | +10 |
| Daily streak bonus | +5 × streak_day |
| First article | +100 |
| Badge earned | varies |

### Level Thresholds
```typescript
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2200,   // Level 7
  3000,   // Level 8
  4000,   // Level 9
  5000,   // Level 10
  // ... continues
];

function calculateLevel(totalXp: number): number {
  return LEVEL_THRESHOLDS.findIndex((threshold, i) =>
    totalXp < (LEVEL_THRESHOLDS[i + 1] || Infinity)
  ) + 1;
}
```

### Badge Examples
```json
[
  {
    "code": "first_article",
    "name": "First Steps",
    "description": "Read your first article",
    "icon": "book",
    "category": "reading",
    "xpReward": 100,
    "criteria": { "type": "articles_read", "count": 1 }
  },
  {
    "code": "bookworm",
    "name": "Bookworm",
    "description": "Read 10 articles",
    "icon": "library",
    "category": "reading",
    "xpReward": 200,
    "criteria": { "type": "articles_read", "count": 10 }
  },
  {
    "code": "streak_7",
    "name": "Week Warrior",
    "description": "7-day reading streak",
    "icon": "flame",
    "category": "streak",
    "xpReward": 150,
    "criteria": { "type": "streak", "days": 7 }
  },
  {
    "code": "quiz_master",
    "name": "Quiz Master",
    "description": "Get 100% on 5 quizzes",
    "icon": "trophy",
    "category": "quiz",
    "xpReward": 300,
    "criteria": { "type": "perfect_quiz", "count": 5 }
  },
  {
    "code": "insight_guru",
    "name": "Insight Guru",
    "description": "Save 20 insight notes",
    "icon": "bulb",
    "category": "collection",
    "xpReward": 250,
    "criteria": { "type": "insights_saved", "count": 20 }
  }
]
```

### Streak Logic
```typescript
async function updateStreak(userId: string) {
  const stats = await prisma.userStats.findUnique({ where: { userId } });
  const today = new Date().toDateString();
  const lastActive = stats?.lastActiveDate?.toDateString();

  if (lastActive === today) return; // Already active today

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newStreak = lastActive === yesterday ? stats.currentStreak + 1 : 1;

  await prisma.userStats.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastActiveDate: new Date(),
    }
  });

  // Award streak XP bonus
  await addXp(userId, 5 * newStreak, 'streak_bonus');
}
```
