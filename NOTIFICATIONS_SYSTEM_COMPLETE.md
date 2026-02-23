# Notification System - Complete Implementation

## Overview
Complete notification management system with backend API and frontend integration. Notifications are automatically created for important events like shift assignments, leave approvals/rejections.

---

## Backend Implementation

### 1. Notification Model
**File:** `backend/app/Models/Notification.php`

**Features:**
- Fillable fields: user_id, title, message, type, is_read, related_id
- Relationship with User model
- Automatic timestamp casting

**Fields:**
- `id` - Primary key
- `user_id` - Foreign key to users table
- `title` - Notification title (max 200 chars)
- `message` - Notification message (text)
- `type` - ENUM: shift, swap, leave, emergency, general
- `is_read` - Boolean (default: false)
- `related_id` - Optional ID of related entity (schedule, leave request, etc.)
- `created_at`, `updated_at` - Timestamps

### 2. Notification Controller
**File:** `backend/app/Http/Controllers/Api/NotificationController.php`

**Endpoints:**

#### GET /api/notifications
List all notifications with optional filters
```
Query Parameters:
- user_id: Filter by user
- is_read: Filter by read status (true/false)
- type: Filter by notification type
```

#### POST /api/notifications
Create a new notification
```json
{
  "user_id": 1,
  "title": "New Shift Assigned",
  "message": "You have been assigned...",
  "type": "shift",
  "related_id": 123
}
```

#### GET /api/notifications-stats
Get notification statistics
```
Query Parameters:
- user_id: Optional user filter

Response:
{
  "total": 50,
  "unread": 5,
  "read": 45,
  "byType": {
    "shift": 20,
    "leave": 15,
    "general": 15
  }
}
```

#### POST /api/notifications/{id}/read
Mark a single notification as read

#### POST /api/notifications/read-all
Mark all notifications as read (optionally filtered by user_id)

#### DELETE /api/notifications/{id}
Delete a specific notification

#### POST /api/notifications/clear-read
Delete all read notifications (optionally filtered by user_id)

### 3. Automatic Notification Creation

Notifications are automatically created for:

**Shift Assignment** (ScheduleController::store)
```php
\App\Models\Notification::create([
    'user_id' => $schedule->user_id,
    'title' => 'New Shift Assigned',
    'message' => "You have been assigned a {$schedule->shift_type} shift...",
    'type' => 'shift',
    'related_id' => $schedule->id,
]);
```

**Leave Approval** (LeaveRequestController::approve)
```php
\App\Models\Notification::create([
    'user_id' => $leaveRequest->user_id,
    'title' => 'Leave Request Approved',
    'message' => "Your leave request from ... has been approved.",
    'type' => 'leave',
    'related_id' => $leaveRequest->id,
]);
```

**Leave Rejection** (LeaveRequestController::reject)
```php
\App\Models\Notification::create([
    'user_id' => $leaveRequest->user_id,
    'title' => 'Leave Request Rejected',
    'message' => "Your leave request from ... has been rejected.",
    'type' => 'leave',
    'related_id' => $leaveRequest->id,
]);
```

### 4. API Routes
**File:** `backend/routes/api.php`

```php
// Notifications API
Route::apiResource('notifications', NotificationController::class);
Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
Route::post('/notifications/clear-read', [NotificationController::class, 'clearRead']);
Route::get('/notifications-stats', [NotificationController::class, 'stats']);
```

---

## Frontend Implementation

### 1. Notification Service
**File:** `src/services/notificationService.ts`

**Functions:**
- `getNotifications(filters?)` - Fetch notifications with optional filters
- `createNotification(data)` - Create a new notification
- `getNotificationStats(userId?)` - Get statistics
- `markNotificationAsRead(id)` - Mark single as read
- `markAllNotificationsAsRead(userId?)` - Mark all as read
- `deleteNotification(id)` - Delete single notification
- `clearReadNotifications(userId?)` - Delete all read notifications

**TypeScript Interface:**
```typescript
interface Notification {
  id: number;
  userId: number;
  userName?: string;
  title: string;
  message: string;
  type: 'shift' | 'swap' | 'leave' | 'emergency' | 'general';
  isRead: boolean;
  relatedId?: number | null;
  createdAt: string;
}
```

### 2. Notifications Page
**File:** `src/pages/NotificationsPage.tsx`

**Features:**
- ✅ Fetches real notifications from API
- ✅ Displays notifications with type-specific icons and colors
- ✅ Click notification to mark as read
- ✅ "Mark All Read" button
- ✅ "Clear Read" button to delete read notifications
- ✅ Delete individual notifications
- ✅ Shows unread indicator (blue dot)
- ✅ Empty state when no notifications
- ✅ Loading state
- ✅ Toast notifications for all actions
- ✅ Formatted timestamps

**Notification Types & Colors:**
- Shift: Blue (CalendarDays icon)
- Swap: Purple (ArrowRightLeft icon)
- Leave: Yellow (CalendarDays icon)
- Emergency: Red (AlertTriangle icon)
- General: Gray (Bell icon)

### 3. Recent Activity Component
**File:** `src/components/dashboard/RecentActivity.tsx`

Shows recent schedules and leave requests as activities on the dashboard.

---

## User Flow

### Viewing Notifications
1. User clicks "Notifications" in sidebar
2. Page loads all notifications from API
3. Unread notifications have blue dot indicator
4. Notifications are sorted by date (newest first)

### Marking as Read
1. Click on any unread notification
2. Notification is marked as read via API
3. Blue dot disappears
4. No page reload needed

### Mark All as Read
1. Click "Mark All Read" button
2. All unread notifications marked as read
3. Toast confirmation appears
4. All blue dots disappear

### Deleting Notifications
1. Click trash icon on any notification
2. Notification deleted via API
3. Removed from list immediately
4. Toast confirmation appears

### Clearing Read Notifications
1. Click "Clear Read" button
2. All read notifications deleted
3. Only unread notifications remain
4. Toast shows count of deleted notifications

---

## Automatic Notification Triggers

### When Shift is Assigned
- User receives notification: "New Shift Assigned"
- Message includes shift type, date, and department
- Type: "shift"
- Related ID: schedule entry ID

### When Leave is Approved
- User receives notification: "Leave Request Approved"
- Message includes date range
- Type: "leave"
- Related ID: leave request ID

### When Leave is Rejected
- User receives notification: "Leave Request Rejected"
- Message includes date range
- Type: "leave"
- Related ID: leave request ID

---

## Testing

### Test Notification Creation
```bash
curl -X POST http://localhost:8000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "Test Notification",
    "message": "This is a test message",
    "type": "general"
  }'
```

### Test Get Notifications
```bash
# All notifications
curl http://localhost:8000/api/notifications

# Unread only
curl http://localhost:8000/api/notifications?is_read=false

# For specific user
curl http://localhost:8000/api/notifications?user_id=1
```

### Test Mark as Read
```bash
curl -X POST http://localhost:8000/api/notifications/1/read
```

### Test Mark All as Read
```bash
curl -X POST http://localhost:8000/api/notifications/read-all?user_id=1
```

### Test Get Stats
```bash
curl http://localhost:8000/api/notifications-stats?user_id=1
```

### Test Delete
```bash
curl -X DELETE http://localhost:8000/api/notifications/1
```

### Test Clear Read
```bash
curl -X POST http://localhost:8000/api/notifications/clear-read?user_id=1
```

---

## Database Schema

### notifications table
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('shift', 'swap', 'leave', 'emergency', 'general') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id BIGINT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at)
);
```

---

## Features Implemented

### Backend
✅ Notification model with relationships
✅ Full CRUD API endpoints
✅ Filter by user, read status, type
✅ Mark as read (single & all)
✅ Delete notifications (single & bulk)
✅ Statistics endpoint
✅ Automatic notification creation on events
✅ Validation and error handling
✅ Proper response formatting (camelCase)

### Frontend
✅ Notification service with all API functions
✅ Notifications page with full UI
✅ Real-time updates (no page reload)
✅ Mark as read functionality
✅ Mark all as read
✅ Delete individual notifications
✅ Clear all read notifications
✅ Type-specific icons and colors
✅ Unread indicators
✅ Toast notifications for actions
✅ Loading and empty states
✅ Formatted timestamps
✅ Responsive design

---

## Next Steps (Optional Enhancements)

1. **Real-time Notifications**
   - Implement WebSocket/Pusher for live updates
   - Show toast when new notification arrives
   - Update badge count in real-time

2. **Notification Bell in Header**
   - Add bell icon with unread count badge
   - Dropdown with recent notifications
   - Click to go to notifications page

3. **Email Notifications**
   - Send email for important notifications
   - User preference for email notifications
   - Email templates

4. **Push Notifications**
   - Browser push notifications
   - Mobile app push notifications
   - User preferences for push

5. **Notification Preferences**
   - User settings for notification types
   - Mute specific notification types
   - Notification frequency settings

6. **Notification Groups**
   - Group similar notifications
   - "You have 5 new shift assignments"
   - Expandable groups

7. **Action Buttons**
   - Quick actions in notifications
   - "View Schedule" button
   - "Respond to Leave Request" button

The notification system is now fully functional and integrated!
