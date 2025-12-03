# Sprint Planning - Scory Apps

**Project Manager:** Habdil Iqrawardana
**Technical Lead:** Tiko
**Planning Date:** December 3, 2025
**Target Completion:** January 2026

---

## 📋 Sprint Overview

### Current Status (v1.5.1)
- ✅ Core features complete (Auth, Personalization, Articles)
- ✅ 24/24 API endpoints operational
- ✅ Zero blockers
- 🎯 Ready for feature expansion

### UX Design Decision (Dec 3, 2025)
> **Upload Button Removed from Tab Bar**
>
> After UX review, we decided to integrate PDF upload and DOI search directly into the **Explore page** instead of using a floating upload button in the tab bar. This provides:
> - ✅ More contextual placement (users search/upload in one place)
> - ✅ Cleaner tab bar design
> - ✅ Better discoverability
> - ✅ Consistent navigation flow

### Upcoming Sprints
- **Sprint 2 (Dec 2025):** User Engagement & Content Features
- **Sprint 3 (Jan 2026):** Advanced Features & PDF Processing (integrated into Explore)

---

## 🚀 Sprint 2: User Engagement & Content Features

**Duration:** 2-3 weeks
**Status:** 🔵 Planning
**Priority:** High
**Goal:** Enhance user engagement with bookmarks, quiz, insights, and trending content

### Sprint 2 Tasks

#### 1. Bookmarking System ⭐ HIGH PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 3-4 days

**Frontend Tasks:**
- [ ] Create Bookmark button component (article cards & detail page)
- [ ] Implement bookmark state management (local + API sync)
- [ ] Create Bookmarks screen (saved articles list)
- [ ] Add bookmark indicator on article cards
- [ ] Implement remove from bookmarks functionality
- [ ] Add loading states & error handling

**Backend Requirements (Tiko):**
- [ ] `POST /api/v1/bookmarks` - Add bookmark
- [ ] `DELETE /api/v1/bookmarks/:id` - Remove bookmark
- [ ] `GET /api/v1/bookmarks` - Get user's bookmarks (paginated)
- [ ] Database: `user_bookmarks` table (userId, articleId, createdAt)

**Acceptance Criteria:**
- ✅ Users can bookmark articles from card or detail page
- ✅ Bookmarked articles appear in dedicated Bookmarks screen
- ✅ Bookmark state persists across app sessions
- ✅ Bookmark indicator shows on article cards
- ✅ Users can remove bookmarks

---

#### 2. Quiz System & Insight Notes ⭐ HIGH PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 5-6 days

**Frontend Tasks:**

**Quiz System:**
- [ ] Create Quiz screen UI (question navigation, timer)
- [ ] Implement quiz state management (answers, progress)
- [ ] Create quiz result screen (score, correct/incorrect)
- [ ] Add quiz retry functionality
- [ ] Integrate quiz API (fetch questions, submit answers)

**Insight Notes:**
- [ ] Create Insight Notes component (article detail page)
- [ ] Implement note editor (rich text or markdown)
- [ ] Add save/edit/delete note functionality
- [ ] Create My Insights screen (list all notes)
- [ ] Add note search & filter functionality

**Backend Requirements (Tiko):**

**Quiz API:**
- [ ] `GET /api/v1/articles/:slug/quiz` - Get quiz questions for article
- [ ] `POST /api/v1/quiz/submit` - Submit quiz answers
- [ ] `GET /api/v1/quiz/results/:quizId` - Get quiz results
- [ ] Database: `quizzes`, `quiz_questions`, `quiz_answers`, `user_quiz_attempts`

**Insight Notes API:**
- [ ] `POST /api/v1/insights` - Create insight note
- [ ] `GET /api/v1/insights` - Get user's insights (paginated)
- [ ] `GET /api/v1/insights/:id` - Get specific insight
- [ ] `PATCH /api/v1/insights/:id` - Update insight
- [ ] `DELETE /api/v1/insights/:id` - Delete insight
- [ ] Database: `user_insights` table (userId, articleId, content, createdAt)

**Acceptance Criteria:**
- ✅ Users can take quizzes after reading articles
- ✅ Quiz shows questions with multiple-choice answers
- ✅ Quiz results display score and correct answers
- ✅ Users can create, edit, delete insight notes
- ✅ Insights sync with backend and persist across sessions
- ✅ Users can view all their insights in dedicated screen

---

#### 3. Trending Now Feature 🔥 MEDIUM PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 2-3 days

**Frontend Tasks:**
- [ ] Create Trending section on Home screen
- [ ] Implement trending articles carousel/list
- [ ] Add trending indicator badge on articles
- [ ] Create dedicated Trending Articles page
- [ ] Add time-based filtering (Today, This Week, This Month)

**Backend Requirements (Tiko):**
- [ ] `GET /api/v1/articles/trending` - Get trending articles
- [ ] Algorithm: Calculate based on views, ratings, bookmarks (last 7 days)
- [ ] Query params: `?timeframe=today|week|month`
- [ ] Response: Paginated trending articles with trending score

**Acceptance Criteria:**
- ✅ Trending section displays on Home screen
- ✅ Articles sorted by trending score (views + engagement)
- ✅ Time-based filtering works correctly
- ✅ Trending indicator appears on article cards
- ✅ Dedicated trending page shows top 50 articles

---

#### 4. Learn Page Integration 📚 HIGH PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 5-6 days

**Frontend Tasks:**

**Stats Dashboard:**
- [ ] Create stats cards (streak, articles read, minutes read)
- [ ] Implement real-time stats fetching from API
- [ ] Add animations for stat updates
- [ ] Create weekly reading goal progress bar
- [ ] Add goal setting modal

**Study Collections:**
- [ ] Create Study Collections list screen
- [ ] Implement create collection modal
- [ ] Add articles to collection functionality
- [ ] Create collection detail screen
- [ ] Add edit/delete collection functionality

**Reading Notes & Insights:**
- [ ] Integrate insights component on Learn page
- [ ] Create recent notes section
- [ ] Add quick note creation from Learn page
- [ ] Implement note filtering by article/collection

**Backend Requirements (Tiko):**

**Stats API:**
- [ ] `GET /api/v1/stats/reading` - Get reading statistics
  - Response: `{ streak, articlesRead, totalMinutes, weeklyGoal, weeklyProgress }`
- [ ] `POST /api/v1/stats/goal` - Set weekly reading goal
- [ ] `PATCH /api/v1/stats/track` - Track reading session (auto-called on article view)
- [ ] Database: `user_reading_stats`, `reading_sessions`

**Study Collections API:**
- [ ] `POST /api/v1/collections` - Create collection
- [ ] `GET /api/v1/collections` - Get user's collections
- [ ] `GET /api/v1/collections/:id` - Get collection with articles
- [ ] `PATCH /api/v1/collections/:id` - Update collection
- [ ] `DELETE /api/v1/collections/:id` - Delete collection
- [ ] `POST /api/v1/collections/:id/articles` - Add article to collection
- [ ] `DELETE /api/v1/collections/:id/articles/:articleId` - Remove from collection
- [ ] Database: `study_collections`, `collection_articles`

**Acceptance Criteria:**
- ✅ Learn page displays accurate reading statistics
- ✅ Streak counter updates daily based on reading activity
- ✅ Weekly reading goal can be set and tracked
- ✅ Users can create and manage study collections
- ✅ Articles can be added to collections
- ✅ Reading notes and insights display on Learn page
- ✅ All data syncs with backend in real-time

---

### Sprint 2 Summary

**Total Tasks:** 4 major features
**Estimated Time:** 15-19 days
**New API Endpoints:** ~20 endpoints
**New Screens:** 5-7 new screens
**Database Tables:** 8 new tables

**Dependencies:**
- Backend API development (Tiko)
- Design mockups for new screens
- Testing environment setup

**Success Metrics:**
- All 4 features fully functional
- Backend integration complete
- Zero critical bugs
- User testing feedback positive

---

## 🔬 Sprint 3: Advanced Features & PDF Processing

**Duration:** 3-4 weeks
**Status:** 🔵 Planning
**Priority:** High
**Goal:** Advanced search, notifications, profile completion, and PDF/DOI processing

### Sprint 3 Tasks

#### 5. Advanced Search Integration 🔍 HIGH PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 4-5 days

**Frontend Tasks:**
- [ ] Enhance search UI on Explore page
- [ ] Add search source toggle (Local / Google Scholar / Both)
- [ ] Implement Google Scholar API integration
- [ ] Create search results merger (local + external)
- [ ] Add advanced filters (year, author, publication)
- [ ] Implement search history feature
- [ ] Add "Save to Library" for external articles

**Backend Requirements (Tiko):**
- [ ] `GET /api/v1/search/scholar` - Search Google Scholar API
  - Query params: `?q=query&year=2020-2025&source=journal`
- [ ] `GET /api/v1/search/combined` - Search both local + Scholar
- [ ] `POST /api/v1/search/save-external` - Save external article to library
- [ ] Implement Google Scholar API wrapper
- [ ] Handle rate limiting and caching
- [ ] Database: `external_articles`, `search_history`

**Acceptance Criteria:**
- ✅ Search works with local database
- ✅ Google Scholar integration functional
- ✅ Combined search merges results intelligently
- ✅ Users can save external articles to library
- ✅ Search filters work correctly
- ✅ Search history saves and displays

---

#### 6. Push Notifications System 🔔 MEDIUM PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 4-5 days

**Frontend Tasks:**
- [ ] Set up Expo Push Notifications
- [ ] Request notification permissions
- [ ] Implement push token registration
- [ ] Create in-app notification center
- [ ] Add notification preferences screen
- [ ] Handle notification tap actions
- [ ] Implement notification badge counts

**Backend Requirements (Tiko):**
- [ ] `POST /api/v1/notifications/register` - Register push token
- [ ] `GET /api/v1/notifications` - Get user notifications (paginated)
- [ ] `PATCH /api/v1/notifications/:id/read` - Mark as read
- [ ] `POST /api/v1/notifications/preferences` - Update preferences
- [ ] Implement notification triggers:
  - New article in favorite category
  - Weekly reading goal reminder
  - New quiz available
  - Reading streak milestone
- [ ] Integrate Expo Push Notification service
- [ ] Database: `user_push_tokens`, `notifications`, `notification_preferences`

**Acceptance Criteria:**
- ✅ Users can enable/disable notifications
- ✅ Push notifications delivered successfully
- ✅ In-app notification center shows history
- ✅ Notification preferences customizable
- ✅ Badge counts update correctly
- ✅ Tapping notification navigates to correct screen

---

#### 7. Profile Page Completion 👤 HIGH PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 3-4 days

**Frontend Tasks:**
- [ ] Complete all profile stats (articles read, quizzes taken, insights created)
- [ ] Add achievements/badges section
- [ ] Implement reading activity chart (last 30 days)
- [ ] Create profile settings page
- [ ] Add account preferences (notifications, privacy)
- [ ] Implement logout with confirmation
- [ ] Add delete account functionality

**Backend Requirements (Tiko):**
- [ ] `GET /api/v1/profile/stats` - Get comprehensive profile stats
  - Response: `{ articlesRead, quizzesCompleted, insightsCreated, bookmarks, collections, streak, achievements }`
- [ ] `GET /api/v1/profile/activity` - Get 30-day reading activity
- [ ] `GET /api/v1/profile/achievements` - Get user achievements
- [ ] `PATCH /api/v1/profile/preferences` - Update preferences
- [ ] `DELETE /api/v1/profile` - Delete account (soft delete)
- [ ] Database: `user_achievements`, `user_preferences`

**Acceptance Criteria:**
- ✅ Profile displays comprehensive user statistics
- ✅ Activity chart visualizes reading patterns
- ✅ Achievements system working
- ✅ All settings functional
- ✅ Account deletion works with confirmation
- ✅ Profile data syncs in real-time

---

#### 8. Avatar Upload Feature 📸 MEDIUM PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 2-3 days

**Frontend Tasks:**
- [ ] Add avatar picker (camera or gallery)
- [ ] Implement image cropping functionality
- [ ] Add avatar upload with progress indicator
- [ ] Display avatar throughout app (navbar, profile)
- [ ] Add remove avatar option
- [ ] Implement avatar caching

**Backend Requirements (Tiko):**
- [ ] `POST /api/v1/profile/avatar` - Upload avatar image
- [ ] `DELETE /api/v1/profile/avatar` - Remove avatar
- [ ] Image processing: resize, crop, optimize
- [ ] File storage: AWS S3 / Cloudinary / Local storage
- [ ] Return CDN URL for uploaded image
- [ ] Max file size: 5MB, formats: JPG, PNG

**Acceptance Criteria:**
- ✅ Users can upload avatar from camera or gallery
- ✅ Image cropping tool works smoothly
- ✅ Upload progress indicator displays
- ✅ Avatar appears across all screens
- ✅ Users can remove/change avatar
- ✅ Images optimized for performance

---

#### 9. PDF Upload & DOI Search ⭐⭐ HIGHEST PRIORITY
**Status:** ⏳ Pending
**Estimated Time:** 7-10 days
**Location:** Integrated into Explore page (better UX - users search/upload in one place)

**Frontend Tasks:**

**Explore Page Integration:**
- [ ] Add "Upload PDF" button in Explore header
- [ ] Add "Search DOI" option in search bar
- [ ] Create upload/search toggle UI
- [ ] Maintain consistent navigation flow

**PDF Upload:**
- [ ] Create PDF upload modal/screen (accessible from Explore)
- [ ] Implement file picker for PDFs
- [ ] Add upload progress indicator
- [ ] Display uploaded PDF list (in Learn page or dedicated section)
- [ ] Create PDF viewer screen
- [ ] Add PDF processing status indicator

**DOI Search:**
- [ ] Integrate DOI search into existing Explore search
- [ ] Add search type toggle (Articles / DOI)
- [ ] Implement DOI validation
- [ ] Integrate DOI search API (CrossRef/Unpaywall)
- [ ] Display article metadata from DOI
- [ ] Add "Add to Library" from DOI result

**Simplification:**
- [ ] Create article simplification screen
- [ ] Auto-detect user's preferred reading level (from personalization)
- [ ] Implement simplification request to backend (send all 4 levels)
- [ ] Display simplified content with block renderer (user's preferred level)
- [ ] Add "Change Level" link to personalization settings
- [ ] Add download simplified PDF option
- [ ] Show simplification progress

**Backend Requirements (Tiko):**

**PDF Processing:**
- [ ] `POST /api/v1/upload/pdf` - Upload PDF file
  - Accept: multipart/form-data
  - Max size: 50MB
  - Process: Extract text, metadata
- [ ] `GET /api/v1/uploads` - Get user's uploaded PDFs
- [ ] `DELETE /api/v1/uploads/:id` - Delete uploaded PDF
- [ ] Implement PDF text extraction (PyPDF2 or similar)
- [ ] Store PDFs in file storage (S3/local)
- [ ] Database: `uploaded_pdfs` (userId, filename, url, textContent, status)

**DOI Search:**
- [ ] `GET /api/v1/search/doi?doi=10.xxxx` - Search by DOI
- [ ] Integrate CrossRef API for metadata
- [ ] Integrate Unpaywall API for free PDFs
- [ ] `POST /api/v1/articles/from-doi` - Create article from DOI
- [ ] Parse and store article metadata

**AI Simplification:**
- [ ] `POST /api/v1/simplify` - Simplify article/PDF content
  - Request: `{ content, targetLevel: "SIMPLE" | "STUDENT" | "ACADEMIC" | "EXPERT" }`
  - Response: `{ simplifiedContent: ContentBlock[], summary }`
- [ ] Integrate AI model (OpenAI GPT / Claude / Local LLM)
- [ ] Implement chunk-based processing for long texts
- [ ] Generate content blocks (text, heading, list, callout)
- [ ] Cache simplification results
- [ ] Database: `simplifications` (articleId, level, blocks, createdAt)

**Acceptance Criteria:**
- ✅ Users can upload PDF files (max 50MB)
- ✅ PDF text extracted successfully
- ✅ DOI search returns accurate metadata
- ✅ Articles can be added from DOI
- ✅ Simplification works for all 4 reading levels
- ✅ Simplified content renders with block system
- ✅ Processing status clearly communicated to user
- ✅ Error handling for failed uploads/simplifications

---

### Sprint 3 Summary

**Total Tasks:** 5 major features
**Estimated Time:** 20-27 days
**New API Endpoints:** ~25 endpoints
**New Screens:** 8-10 new screens
**Database Tables:** 10 new tables
**External Integrations:** Google Scholar, CrossRef, Unpaywall, AI Model

**Dependencies:**
- AI model setup (OpenAI API key or local LLM)
- Google Scholar API access
- File storage configuration (AWS S3 or alternative)
- PDF processing libraries
- Push notification service setup

**Success Metrics:**
- All 5 features fully functional
- PDF processing success rate >95%
- DOI search accuracy >98%
- Simplification quality validated by users
- Notifications delivered reliably
- Profile completion rate >80%

---

## 📊 Combined Sprint Statistics

### Total Scope (Sprint 2 + 3)

**Features:** 9 major features
**Estimated Time:** 35-46 days (~6-7 weeks)
**API Endpoints:** ~45 new endpoints
**New Screens:** 13-17 screens
**Database Tables:** 18 new tables
**External Services:** 4 integrations

### Priority Breakdown

**Highest Priority (Must-Have):**
1. PDF Upload & DOI Search ⭐⭐
2. Bookmarking System ⭐
3. Quiz & Insight Notes ⭐
4. Learn Page Integration ⭐
5. Profile Completion ⭐

**High Priority (Should-Have):**
6. Advanced Search 🔍
7. Trending Now 🔥

**Medium Priority (Nice-to-Have):**
8. Push Notifications 🔔
9. Avatar Upload 📸

---

## 🎯 Recommended Execution Order

### Sprint 2 (December 2025)
**Week 1-2:**
1. Bookmarking System (3-4 days)
2. Trending Now (2-3 days)
3. Quiz System foundation (3 days)

**Week 2-3:**
4. Insight Notes (3 days)
5. Learn Page Stats & Collections (5-6 days)

### Sprint 3 (January 2026)
**Week 1-2:**
1. Profile Completion (3-4 days)
2. Avatar Upload (2-3 days)
3. Advanced Search (4-5 days)

**Week 3-4:**
4. Push Notifications (4-5 days)
5. PDF Upload & DOI (first phase - 4 days)

**Week 4-5:**
6. PDF Simplification (second phase - 6 days)

---

## ⚠️ Risks & Mitigation

### Technical Risks

**Risk 1: AI Simplification Complexity**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:**
  - Start with OpenAI API (easier integration)
  - Have fallback to simpler summarization
  - Implement in phases (summary first, then full simplification)

**Risk 2: PDF Processing Performance**
- **Impact:** Medium
- **Probability:** High
- **Mitigation:**
  - Implement async processing with job queue
  - Set realistic file size limits (50MB)
  - Show clear progress indicators to users

**Risk 3: Google Scholar API Limitations**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:**
  - Implement rate limiting on frontend
  - Cache search results
  - Have fallback to other academic search APIs

**Risk 4: Push Notification Delivery**
- **Impact:** Low
- **Probability:** Medium
- **Mitigation:**
  - Test on multiple devices
  - Implement retry mechanism
  - Use reliable service (Expo Push)

### Timeline Risks

**Risk:** Features may take longer than estimated
- **Mitigation:**
  - Prioritize must-have features
  - Can push nice-to-have to Sprint 4
  - Regular progress check-ins between Habdil & Tiko

---

## 📅 Milestones

### Sprint 2 Milestones
- **Week 1:** Bookmarking + Trending complete
- **Week 2:** Quiz system complete
- **Week 3:** Learn page integration complete
- **Sprint 2 Complete:** All user engagement features functional

### Sprint 3 Milestones
- **Week 1:** Profile + Avatar complete
- **Week 2:** Search + Notifications complete
- **Week 3-4:** PDF upload functional
- **Week 5:** AI simplification complete
- **Sprint 3 Complete:** All advanced features functional

---

## ✅ Definition of Done

A feature is considered "done" when:
- ✅ Frontend implementation complete
- ✅ Backend API integration working
- ✅ Data persists correctly in database
- ✅ Error handling implemented
- ✅ Loading states displayed
- ✅ Tested on iOS and Android
- ✅ No critical bugs
- ✅ Code reviewed by team
- ✅ Documentation updated

---

**Created:** December 3, 2025
**Last Updated:** December 3, 2025
**Version:** 1.0
**Status:** Approved for development

---

**Questions or clarifications?** Contact:
- **PM:** Habdil Iqrawardana
- **Tech Lead:** Tiko
