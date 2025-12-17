# Push Notification Implementation Guide

Panduan implementasi push notification untuk backend Scory Apps.

## Platform Requirements

### Android (FCM - Firebase Cloud Messaging)
- Firebase project setup
- Server key untuk autentikasi FCM API
- Handle device token dari client

### iOS (APNs - Apple Push Notification service)
- Apple Developer account
- APNs authentication key (.p8 file) atau Certificate
- Bundle ID yang terdaftar

## Push Notification Flow

```
1. User opens app
   ↓
2. App generates device token (FCM/APNs)
   ↓
3. App sends token to backend via POST /api/device/register
   ↓
4. Backend stores token with user ID
   ↓
5. When event triggers notification:
   - Backend creates notification record
   - Backend sends push via FCM/APNs
   ↓
6. User receives notification
   ↓
7. User taps notification → App opens with actionUrl
```

## Notification Triggers

### Article Type

#### New Article in Favorite Category
**Trigger:** Artikel baru dipublish dalam kategori yang user follow

**Payload:**
```json
{
  "type": "article",
  "title": "New Article in {categoryName}",
  "message": "Check out \"{articleTitle}\" by {authorName}",
  "icon": "document-text",
  "iconColor": "#20B548",
  "actionUrl": "/article/{articleId}"
}
```

#### Personalized Recommendation
**Trigger:** Daily/weekly recommendation berdasarkan reading history

**Schedule:** Daily at 09:00 user's timezone

**Payload:**
```json
{
  "type": "article",
  "title": "Recommended for You",
  "message": "Based on your interests: \"{articleTitle}\"",
  "icon": "sparkles",
  "iconColor": "#20B548",
  "actionUrl": "/article/{articleId}"
}
```

#### Trending Topic Alert
**Trigger:** Topic yang user ikuti masuk trending

**Payload:**
```json
{
  "type": "article",
  "title": "Trending Topic Alert",
  "message": "\"{topicName}\" is trending. Explore related articles now!",
  "icon": "flame",
  "iconColor": "#EF4444",
  "actionUrl": "/explore?topic={topicId}"
}
```

### Achievement Type

#### Weekly Goal Completed
**Trigger:** User mencapai target mingguan (e.g., baca 10 artikel)

**Payload:**
```json
{
  "type": "achievement",
  "title": "Achievement Unlocked!",
  "message": "You've read {count} articles this week. Keep it up!",
  "icon": "trophy",
  "iconColor": "#F59E0B"
}
```

#### Milestone Reached
**Trigger:** User mencapai milestone (50, 100, 200, 500 artikel)

**Payload:**
```json
{
  "type": "achievement",
  "title": "Milestone Reached",
  "message": "You've completed {count} articles! Amazing progress.",
  "icon": "star",
  "iconColor": "#F59E0B",
  "actionUrl": "/profile?tab=achievements"
}
```

#### Reading Streak
**Trigger:** User maintain reading streak (7, 14, 30 hari berturut-turut)

**Payload:**
```json
{
  "type": "achievement",
  "title": "{days}-Day Streak!",
  "message": "You're on fire! Keep your streak going.",
  "icon": "ribbon",
  "iconColor": "#F59E0B"
}
```

### System Type

#### New Feature Update
**Trigger:** Manual trigger saat ada fitur baru

**Payload:**
```json
{
  "type": "system",
  "title": "New Features Available",
  "message": "Check out our latest updates and improvements!",
  "icon": "information-circle",
  "iconColor": "#8B5CF6"
}
```

#### Scheduled Maintenance
**Trigger:** 24 jam sebelum maintenance

**Payload:**
```json
{
  "type": "system",
  "title": "Scheduled Maintenance",
  "message": "App will be under maintenance on {date} at {time}",
  "icon": "construct",
  "iconColor": "#6B7280"
}
```

#### Important Announcement
**Trigger:** Manual trigger untuk pengumuman penting

**Payload:**
```json
{
  "type": "system",
  "title": "{announcementTitle}",
  "message": "{announcementMessage}",
  "icon": "megaphone",
  "iconColor": "#3B82F6"
}
```

## FCM Implementation (Android)

### Send Notification via FCM API

**Endpoint:** `POST https://fcm.googleapis.com/fcm/send`

**Headers:**
```
Authorization: key={SERVER_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "{device_token}",
  "priority": "high",
  "notification": {
    "title": "New Article in Finance",
    "body": "Check out \"The Future of Cryptocurrency\"",
    "sound": "default",
    "badge": "1"
  },
  "data": {
    "notificationId": "notif_123",
    "type": "article",
    "actionUrl": "/article/123",
    "timestamp": "2025-12-17T14:30:00Z"
  }
}
```

## APNs Implementation (iOS)

### Send Notification via APNs API

**Endpoint:** `POST https://api.push.apple.com/3/device/{device_token}`

**Headers:**
```
authorization: bearer {JWT_TOKEN}
apns-topic: {BUNDLE_ID}
apns-priority: 10
```

**Request Body:**
```json
{
  "aps": {
    "alert": {
      "title": "New Article in Finance",
      "body": "Check out \"The Future of Cryptocurrency\""
    },
    "sound": "default",
    "badge": 1
  },
  "notificationId": "notif_123",
  "type": "article",
  "actionUrl": "/article/123",
  "timestamp": "2025-12-17T14:30:00Z"
}
```

## Best Practices

### 1. Batching & Throttling
- Jangan kirim notifikasi individual untuk setiap event
- Group notifikasi sejenis dalam window 30 menit
- Max 5 notifikasi per user per hari (configurable via preferences)

**Example:**
```
Instead of:
- "New article A"
- "New article B"
- "New article C"

Send:
- "3 new articles in your favorite categories"
```

### 2. Timing Optimization
- Kirim notifikasi di jam optimal: 09:00 - 21:00 user's timezone
- Respect quiet hours (default: 22:00 - 07:00)
- Delay non-urgent notifications jika di luar jam optimal

### 3. Personalization
- Check user preferences sebelum kirim
- Respect notification type preferences (article/achievement/system)
- Handle opt-out gracefully

### 4. Error Handling
- Handle invalid/expired device tokens
- Retry logic dengan exponential backoff
- Log failed notifications untuk debugging

### 5. Testing
- Test di sandbox environment dulu (FCM & APNs support sandbox)
- Test dengan multiple devices (Android & iOS)
- Test different notification types dan actionUrl

## Database Schema

### notifications table
```sql
CREATE TABLE notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type ENUM('article', 'achievement', 'system') NOT NULL,
  title VARCHAR(100) NOT NULL,
  message VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50) NOT NULL,
  icon_color VARCHAR(7) NOT NULL,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_timestamp (timestamp)
);
```

### device_tokens table
```sql
CREATE TABLE device_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  device_token TEXT NOT NULL,
  platform ENUM('ios', 'android') NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_device (user_id, device_id),
  INDEX idx_user_id (user_id)
);
```

### notification_preferences table
```sql
CREATE TABLE notification_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  enable_push BOOLEAN DEFAULT TRUE,
  enable_article BOOLEAN DEFAULT TRUE,
  enable_achievement BOOLEAN DEFAULT TRUE,
  enable_system BOOLEAN DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '07:00:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Monitoring & Analytics

Track metrics berikut untuk optimize notification strategy:

- **Delivery rate**: Berapa persen notif berhasil terkirim
- **Open rate**: Berapa persen notif yang di-tap user
- **Conversion rate**: Berapa persen yang lakukan action (baca artikel, dll)
- **Opt-out rate**: Berapa persen user yang disable notifications

## Security Considerations

1. **Authentication**: Validate JWT token untuk semua API calls
2. **Authorization**: User hanya bisa akses notifications mereka sendiri
3. **Rate Limiting**: Prevent spam dan abuse
4. **Data Privacy**: Jangan kirim sensitive data via notification payload
5. **Token Management**: Invalidate old tokens saat user logout
