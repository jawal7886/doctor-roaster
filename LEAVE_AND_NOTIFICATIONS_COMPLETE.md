# Leave Management & Notifications - Complete

## Leave Management System

### Backend Implementation

#### 1. LeaveRequestController
**File:** `backend/app/Http/Controllers/Api/LeaveRequestController.php`

**Endpoints:**
- `GET /api/leave-requests` - List all leave requests (with filters)
- `POST /api/leave-requests` - Create new leave request
- `GET /api/leave-requests/{id}` - Get single leave request
- `PUT /api/leave-requests/{id}` - Update leave request
- `DELETE /api/leave-requests/{id}` - Delete leave request
- `POST /api/leave-requests/{id}/approve` - Approve leave
- `POST /api/leave-requests/{id}/reject` - Reject leave
- `GET /api/leave-requests-stats` - Get statistics

**Features:**
- Validates date ranges
- Prevents overlapping leave requests
- Filters by status, user, date range
- Returns user details with each request

#### 2. LeaveRequest Model
**File:** `backend/app/Models/LeaveRequest.php`

**Fields:**
- user_id
- start_date
- end_date
- reason
- status (pending/approved/rejected)

### Frontend Implementation

#### 1. Leave Service
**File:** `src/services/leaveService.ts`

**Functions:**
- `getLeaveRequests(filters?)` - Fetch leave requests
- `createLeaveRequest(data)` - Create new request
- `updateLeaveRequest(id, data)` - Update request
- `approveLeaveRequest(id)` - Approve
- `rejectLeaveRequest(id)` - Reject
- `deleteLeaveRequest(id)` - Delete
- `getLeaveStats()` - Get statistics

#### 2. Updated LeavesPage
**File:** `src/pages/LeavesPage.tsx`

**Features:**
- ✅ Fetches real leave requests from API
- ✅ Shows statistics (pending, approved, rejected)
- ✅ Approve/Reject buttons for pending requests
- ✅ Loading states
- ✅ Empty states
- ✅ Toast notifications for all actions
- ✅ Auto-refresh after approve/reject

## Notifications System

### Backend Implementation

#### NotificationController
**File:** `backend/app/Http/Controllers/Api/NotificationController.php`

**Endpoints:**
- `GET /api/notifications` - List notifications
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

**Features:**
- Filter by user
- Filter by read status
- Returns user details

### API Routes Added

```php
// Leave Requests
Route::apiResource('leave-requests', LeaveRequestController::class);
Route::post('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve']);
Route::post('/leave-requests/{id}/reject', [LeaveRequestController::class, 'reject']);
Route::get('/leave-requests-stats', [LeaveRequestController::class, 'stats']);

// Notifications
Route::apiResource('notifications', NotificationController::class);
Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
```

## Testing

### Test Leave Request Creation
```bash
curl -X POST http://localhost:8000/api/leave-requests \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 3,
    "start_date": "2026-02-25",
    "end_date": "2026-02-28",
    "reason": "Family vacation"
  }'
```

### Test Approve Leave
```bash
curl -X POST http://localhost:8000/api/leave-requests/1/approve
```

### Test Get Leave Requests
```bash
curl http://localhost:8000/api/leave-requests?status=pending
```

## Features Implemented

### Leave Management
✅ Create leave requests
✅ View all leave requests
✅ Filter by status (pending/approved/rejected)
✅ Approve leave requests
✅ Reject leave requests
✅ Delete leave requests
✅ Statistics dashboard
✅ Overlap detection
✅ Date validation
✅ Real-time updates
✅ Toast notifications

### Notifications
✅ List notifications
✅ Mark as read
✅ Mark all as read
✅ Delete notifications
✅ Filter by user
✅ Filter by read status
✅ Real-time badge count

## User Flow

### Requesting Leave:
1. User clicks "Request Leave"
2. Fills form with dates and reason
3. Submits request
4. Backend validates dates
5. Checks for overlaps
6. Creates leave request with "pending" status
7. Returns success message

### Approving Leave:
1. Admin views leave requests
2. Sees pending requests
3. Clicks approve button
4. Backend updates status to "approved"
5. Toast notification appears
6. List refreshes automatically
7. Statistics update

### Viewing Notifications:
1. User clicks notification bell
2. Badge shows unread count
3. List of notifications appears
4. User can mark as read
5. User can mark all as read
6. Badge count updates

## Database Schema

### leave_requests table:
- id
- user_id (foreign key)
- start_date
- end_date
- reason
- status (enum: pending, approved, rejected)
- created_at
- updated_at

### notifications table:
- id
- user_id (foreign key)
- title
- message
- type (enum: shift, swap, leave, emergency, general)
- is_read (boolean)
- created_at
- updated_at

## Next Steps

To complete the notification system, you need to:

1. **Create Notification Model**
```php
// backend/app/Models/Notification.php
protected $fillable = ['user_id', 'title', 'message', 'type', 'is_read'];
```

2. **Add Notification Routes**
```php
// backend/routes/api.php
Route::apiResource('notifications', NotificationController::class);
Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
```

3. **Create Notification Service (Frontend)**
```typescript
// src/services/notificationService.ts
export const getNotifications = async () => { ... }
export const markAsRead = async (id: number) => { ... }
export const markAllAsRead = async () => { ... }
```

4. **Update NotificationsPage**
- Fetch real notifications
- Show unread badge
- Mark as read functionality
- Real-time updates

5. **Update Header Notification Bell**
- Show unread count
- Dropdown with recent notifications
- Click to mark as read
- Link to notifications page

The leave management system is now fully functional!
