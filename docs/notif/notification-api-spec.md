# Notification API Specification

Dokumentasi API untuk fitur notifikasi Scory Apps.

## Overview

Sistem notifikasi Scory mendukung 3 tipe notifikasi utama:
- **article**: Notifikasi terkait konten baru dan rekomendasi
- **achievement**: Milestone dan pencapaian user
- **system**: Update aplikasi dan pengumuman

## Data Structure

### Notification Object

```json
{
  "id": "string (unique)",
  "type": "article | achievement | system",
  "title": "string (max 100 chars)",
  "message": "string (max 255 chars)",
  "timestamp": "string (ISO 8601 format)",
  "isRead": "boolean",
  "icon": "string (Ionicons name)",
  "iconColor": "string (hex color)",
  "actionUrl": "string (optional, deep link path)"
}
```

### Example

```json
{
  "id": "notif_12345",
  "type": "article",
  "title": "New Article in Finance",
  "message": "Check out \"The Future of Cryptocurrency\" by Dr. Sarah Johnson",
  "timestamp": "2025-12-17T14:30:00Z",
  "isRead": false,
  "icon": "document-text",
  "iconColor": "#20B548",
  "actionUrl": "/article/article_1"
}
```

## Icon Mapping

Gunakan icon dan color berikut sesuai tipe notifikasi:

### Article Type
- `document-text` - Artikel baru (#20B548)
- `sparkles` - Rekomendasi (#20B548)
- `flame` - Trending topic (#EF4444)

### Achievement Type
- `trophy` - Achievement unlocked (#F59E0B)
- `star` - Milestone (#F59E0B)
- `ribbon` - Streak reward (#F59E0B)

### System Type
- `information-circle` - Info umum (#8B5CF6)
- `megaphone` - Announcement (#3B82F6)
- `construct` - Maintenance (#6B7280)

## API Endpoints

### 1. Get All Notifications

Retrieve user's notifications (paginated).

**Endpoint:** `GET /api/notifications`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20, max: 50)
type: string (optional, filter by type: article|achievement|system)
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "notif_1",
        "type": "article",
        "title": "New Article",
        "message": "Check out new article...",
        "timestamp": "2025-12-17T14:30:00Z",
        "isRead": false,
        "icon": "document-text",
        "iconColor": "#20B548",
        "actionUrl": "/article/123"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "hasMore": true
    },
    "unreadCount": 12
  }
}
```

### 2. Get Unread Count

Get count of unread notifications.

**Endpoint:** `GET /api/notifications/unread`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "unreadCount": 12
  }
}
```

### 3. Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `POST /api/notifications/read/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**URL Parameters:**
```
id: string (notification ID)
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

**Response Error (404):**
```json
{
  "status": "error",
  "message": "Notification not found"
}
```

### 4. Mark All as Read

Mark all user's notifications as read.

**Endpoint:** `POST /api/notifications/read-all`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 12
  }
}
```

### 5. Register Device Token

Register device token for push notifications.

**Endpoint:** `POST /api/device/register`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceToken": "string (FCM/APNs token)",
  "platform": "ios | android",
  "deviceId": "string (unique device identifier)"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Device registered successfully"
}
```

### 6. Update Notification Preferences

Update user's notification preferences.

**Endpoint:** `PUT /api/preferences/notify`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "enablePushNotifications": true,
  "notificationTypes": {
    "article": true,
    "achievement": true,
    "system": true
  },
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "07:00"
  }
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Preferences updated successfully",
  "data": {
    "enablePushNotifications": true,
    "notificationTypes": {
      "article": true,
      "achievement": true,
      "system": true
    },
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "07:00"
    }
  }
}
```

### 7. Delete Notification

Delete a specific notification.

**Endpoint:** `DELETE /api/notifications/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**URL Parameters:**
```
id: string (notification ID)
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Notification deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Unauthorized access"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Rate Limiting

- **GET requests**: 100 requests per minute
- **POST/PUT/DELETE requests**: 30 requests per minute

Exceeded rate limit response (429):
```json
{
  "status": "error",
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```
