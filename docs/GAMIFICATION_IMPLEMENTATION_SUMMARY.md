# 🎮 Gamification Implementation Summary

## ✅ What's Done

### 1. **Database Schema**
- ✅ `user_gamification_stats` - User streaks & reading stats
- ✅ `weekly_reading_goals` - Weekly article targets
- ✅ `user_reading_activities` - Activity log with completion validation
- ✅ Migration deployed to production DB

### 2. **API Endpoints** (All under `/api/v1/user/gamification`)

#### GET `/stats`
Get user's learning statistics
```json
{
  "streak": { "current": 5, "longest": 10 },
  "articlesRead": { "total": 50, "thisWeek": 3, "today": 1 },
  "readingTime": { "totalMinutes": 500, "thisWeek": 45 }
}
```

#### GET `/weekly-goal`
Get current week's goal
```json
{
  "goal": {
    "target": 7,
    "completed": 3,
    "daysLeft": 4,
    "isActive": true
  }
}
```

#### PUT `/weekly-goal`
Set/update weekly goal
```json
// Request
{ "target": 7 }

// Response
{ "goal": { "target": 7, "completed": 0 } }
```

#### POST `/record-activity`
Record article completion (auto-triggered by quiz)
```json
// Request
{
  "articleId": "uuid",
  "readingTime": 12,
  "quizScore": 3,  // optional (0-3)
  "progressPercentage": 100
}

// Response
{
  "completionType": "verified", // or "basic" or "rejected"
  "streakUpdated": true,
  "newStreak": 6,
  "weeklyGoalProgress": { "completed": 4, "target": 7 }
}
```

### 3. **Quiz Integration** ✅
- Quiz submission now auto-triggers gamification
- Add `readingTime` parameter to quiz submit:
```json
POST /api/v1/articles/:slug/quiz
{
  "answers": [...],
  "readingTime": 12  // NEW: minutes spent reading
}
```

- Response includes gamification result:
```json
{
  "score": 3,
  "gamification": {
    "completionType": "verified",
    "streakUpdated": true,
    "newStreak": 6
  }
}
```

### 4. **Article Feed Improvements** ✅

#### NEW Query Parameters for GET `/api/v1/articles`
```
?sort=random          - Shuffle articles (for "For You")
?excludeRead=true     - Hide completed articles
```

**Examples:**
```bash
# Get random articles (For You feed)
GET /api/v1/articles?sort=random&limit=10

# Get articles excluding already read (if logged in)
GET /api/v1/articles?excludeRead=true

# Combine both
GET /api/v1/articles?sort=random&excludeRead=true
```

**Response format:** UNCHANGED (backward compatible)

---

## 🎯 Business Logic

### Completion Validation
Articles marked as "verified" (streak-worthy) if:
- ✅ Progress 100%
- ✅ Reading time ≥ 30% of estimated time
- ✅ AND (quiz score ≥ 2 OR reading time ≥ 50%)

Articles marked as "basic" (stats only, no streak) if:
- ✅ Progress 100%
- ✅ Reading time ≥ 30% but < 50%
- ❌ No quiz or quiz failed

Articles "rejected" if:
- ❌ Progress < 100%
- ❌ Reading time < 30% (too fast, likely scroll-cheating)

### Streak Rules
- Increments when user completes ≥1 article per day
- Resets if miss a day (24+ hours)
- Uses UTC timezone
- Day boundaries: 00:00 to 23:59 UTC

### Weekly Goals
- Week: Monday 00:00 - Sunday 23:59 UTC
- User must explicitly set target (1-50 articles)
- Auto-deactivates when week ends
- Does NOT auto-create for new weeks

---

## 📱 Frontend Integration Guide

### 1. **Learn Screen (Gamification Stats)**

```typescript
// hooks/useGamificationStats.ts
const { data, isLoading } = useQuery({
  queryKey: ['gamification', 'stats'],
  queryFn: () => fetch('/api/v1/user/gamification/stats').then(r => r.json()),
  staleTime: 30000, // 30 seconds
});

// Usage in Learn screen
<LearningStatCard
  streak={data.streak.current}
  articlesRead={data.articlesRead.thisWeek}
  readingTime={data.readingTime.thisWeek}
/>
```

### 2. **Weekly Goal Management**

```typescript
// hooks/useWeeklyGoal.ts
const { data } = useQuery({
  queryKey: ['gamification', 'weekly-goal'],
  queryFn: () => fetch('/api/v1/user/gamification/weekly-goal').then(r => r.json()),
  staleTime: 60000, // 1 minute
});

const updateGoal = useMutation({
  mutationFn: (target: number) =>
    fetch('/api/v1/user/gamification/weekly-goal', {
      method: 'PUT',
      body: JSON.stringify({ target }),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries(['gamification', 'weekly-goal']);
  },
});

// Usage
<WeeklyGoalCard
  target={data.goal.target}
  completed={data.goal.completed}
  daysLeft={data.goal.daysLeft}
  onUpdateGoal={(value) => updateGoal.mutate(value)}
/>
```

### 3. **Quiz Submission with Reading Time**

```typescript
// Track reading time
const [startTime] = useState(Date.now());

// On quiz submit
const submitQuiz = async (answers: QuizAnswer[]) => {
  const endTime = Date.now();
  const readingTime = Math.round((endTime - startTime) / 60000); // minutes

  const response = await fetch(`/api/v1/articles/${slug}/quiz`, {
    method: 'POST',
    body: JSON.stringify({
      answers,
      readingTime, // Include reading time
    }),
  });

  const result = await response.json();

  // Check gamification result
  if (result.data.gamification?.streakUpdated) {
    // Show streak celebration toast
    showToast(`🔥 ${result.data.gamification.newStreak} day streak!`);
  }

  if (result.data.gamification?.completionType === 'basic') {
    // Show warning
    showToast('⚡ Too fast! Read carefully to earn streak points');
  }

  // Invalidate gamification cache
  queryClient.invalidateQueries(['gamification']);
};
```

### 4. **For You Feed (Random + Exclude Read)**

```typescript
// hooks/useForYouArticles.ts
const { data } = useQuery({
  queryKey: ['articles', 'for-you'],
  queryFn: () =>
    fetch('/api/v1/articles?sort=random&excludeRead=true&limit=10')
      .then(r => r.json()),
  staleTime: 60000, // 1 minute
});

// Usage
<ArticleList articles={data.articles} />
```

### 5. **Hide Completed Articles**

```typescript
// Option 1: Frontend-only (using quiz response)
const [completedArticles, setCompletedArticles] = useState<Set<string>>(new Set());

// After quiz submission
if (result.data.gamification) {
  setCompletedArticles(prev => new Set(prev).add(articleId));
}

// Filter in UI
const visibleArticles = articles.filter(a => !completedArticles.has(a.id));

// Option 2: Backend filtering (recommended for large lists)
// Just add ?excludeRead=true to any article endpoint
const { data } = useQuery({
  queryKey: ['articles', { excludeRead: true }],
  queryFn: () => fetch('/api/v1/articles?excludeRead=true').then(r => r.json()),
});
```

---

## 🔄 Cache Invalidation Strategy

When to invalidate queries:
- **After quiz submit:** Invalidate `['gamification']` (all stats + goal)
- **After goal update:** Invalidate `['gamification', 'weekly-goal']`
- **On screen focus:** Refetch stats if stale
- **After article complete:** Invalidate `['articles', 'for-you']` if using excludeRead

```typescript
// Example: Full invalidation pattern
const submitQuiz = useMutation({
  mutationFn: submitQuizApi,
  onSuccess: () => {
    queryClient.invalidateQueries(['gamification']); // Stats + goal
    queryClient.invalidateQueries(['articles']); // Refresh article lists
  },
});
```

---

## ⚠️ Important Notes

### Backward Compatibility
✅ **All existing API responses unchanged**
✅ New query params are **optional**
✅ Frontend works without changes (gamification is opt-in)

### Response Format
All existing endpoints return **same structure** as before.
New fields only added to quiz submission response (`gamification` field).

### No Breaking Changes
- `GET /api/v1/articles` works exactly as before
- `POST /api/v1/articles/:slug/quiz` works without `readingTime` param
- Gamification only activates when quiz includes `readingTime`

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Submit quiz → Check streak increments
- [ ] Set weekly goal → Verify in GET endpoint
- [ ] Complete article → Check weekly goal progress
- [ ] Test "too fast" validation (< 30% time)
- [ ] Test random sort → Articles shuffled
- [ ] Test excludeRead → Completed articles hidden

### API Testing
```bash
# 1. Get initial stats
GET /api/v1/user/gamification/stats

# 2. Set weekly goal
PUT /api/v1/user/gamification/weekly-goal
{ "target": 7 }

# 3. Submit quiz with reading time
POST /api/v1/articles/some-slug/quiz
{
  "answers": [...],
  "readingTime": 10
}

# 4. Verify stats updated
GET /api/v1/user/gamification/stats

# 5. Test random articles
GET /api/v1/articles?sort=random&limit=10

# 6. Test exclude read
GET /api/v1/articles?excludeRead=true
```

---

## 📊 Database Queries

### Check user stats
```sql
SELECT * FROM user_gamification_stats WHERE user_id = 'user-uuid';
```

### Check completed articles
```sql
SELECT * FROM user_reading_activities
WHERE user_id = 'user-uuid' AND activity_type = 'article_completed'
ORDER BY created_at DESC;
```

### Check active goals
```sql
SELECT * FROM weekly_reading_goals
WHERE user_id = 'user-uuid' AND is_active = true;
```

---

## 🚀 Deployment Notes

- ✅ Migration already applied to production
- ✅ All endpoints deployed
- ✅ No env variables needed
- ✅ Backward compatible (no frontend changes required)

---

## 📞 Questions?

Contact backend team atau cek:
- Full spec: `doc-gamifikasi.txt`
- Test script: `docs/requestBackend/GAMIFICATION_API_TESTS.sh`
