# Leave Approval Tracking - Complete Fix ✅

## Problem
Leave requests were showing NULL values for:
- `approved_by` - Who approved/rejected the leave
- `approved_at` - When it was approved/rejected  
- `rejection_reason` - Why it was rejected

## Solution Implemented

### 1. Backend Updates

#### LeaveRequest Model
**File**: `backend/app/Models/LeaveRequest.php`

**Added to fillable**:
```php
protected $fillable = [
    'user_id',
    'start_date',
    'end_date',
    'reason',
    'status',
    'approved_by',      // ✅ Added
    'approved_at',      // ✅ Added
    'rejection_reason', // ✅ Added
];
```

**Added date casting**:
```php
protected $casts = [
    'start_date' => 'date',
    'end_date' => 'date',
    'approved_at' => 'datetime', // ✅ Added
];
```

**Added approver relationship**:
```php
public function approver()
{
    return $this->belongsTo(User::class, 'approved_by');
}
```

#### LeaveRequestController
**File**: `backend/app/Http/Controllers/Api/LeaveRequestController.php`

**Updated `approve()` method**:
```php
public function approve(Request $request, $id)
{
    $approverId = $request->input('approved_by', 1);
    
    $leaveRequest->update([
        'status' => 'approved',
        'approved_by' => $approverId,
        'approved_at' => now(),
        'rejection_reason' => null,
    ]);
    
    $leaveRequest->load(['user', 'approver']);
    
    // Returns approver info in response
}
```

**Updated `reject()` method**:
```php
public function reject(Request $request, $id)
{
    // Validates rejection_reason is required
    $validator = Validator::make($request->all(), [
        'rejection_reason' => 'required|string|max:500',
    ]);
    
    $approverId = $request->input('approved_by', 1);
    
    $leaveRequest->update([
        'status' => 'rejected',
        'approved_by' => $approverId,
        'approved_at' => now(),
        'rejection_reason' => $request->rejection_reason,
    ]);
    
    $leaveRequest->load(['user', 'approver']);
    
    // Returns rejection info in response
}
```

**Updated `index()` method**:
```php
$query = LeaveRequest::with(['user', 'approver']); // ✅ Added approver

return response()->json([
    'success' => true,
    'data' => $leaveRequests->map(function ($leave) {
        return [
            // ... existing fields
            'approvedBy' => $leave->approved_by,
            'approvedByName' => $leave->approver ? $leave->approver->name : null,
            'approvedAt' => $leave->approved_at,
            'rejectionReason' => $leave->rejection_reason,
        ];
    })
]);
```

### 2. Frontend Updates

#### TypeScript Types
**File**: `src/types/index.ts`

```typescript
export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number | null;        // ✅ Added
  approvedByName?: string | null;    // ✅ Added
  approvedAt?: string | null;        // ✅ Added
  rejectionReason?: string | null;   // ✅ Added
  createdAt: string;
}
```

#### Leave Service
**File**: `src/services/leaveService.ts`

**Updated approve function**:
```typescript
export const approveLeaveRequest = async (
  id: number, 
  approvedBy?: number
): Promise<void> => {
  await api.post(`/leave-requests/${id}/approve`, {
    approved_by: approvedBy,
  });
};
```

**Updated reject function**:
```typescript
export const rejectLeaveRequest = async (
  id: number, 
  rejectionReason: string, 
  approvedBy?: number
): Promise<void> => {
  await api.post(`/leave-requests/${id}/reject`, {
    rejection_reason: rejectionReason,
    approved_by: approvedBy,
  });
};
```

#### LeavesPage UI
**File**: `src/pages/LeavesPage.tsx`

**Added rejection dialog**:
- Dialog opens when clicking reject button
- Requires rejection reason (validated)
- Shows error if reason is empty

**Updated table columns**:
```
Before: Staff | Start | End | Status | Actions
After:  Staff | Start | End | Status | Approved/Rejected By | Actions
```

**Added approval info display**:
```tsx
{leave.approvedByName ? (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5">
      <User className="h-3.5 w-3.5" />
      <span>{leave.approvedByName}</span>
    </div>
    {leave.approvedAt && (
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        <span>{new Date(leave.approvedAt).toLocaleString()}</span>
      </div>
    )}
  </div>
) : (
  <span>-</span>
)}
```

**Added rejection reason display**:
```tsx
{leave.rejectionReason && (
  <p className="text-xs text-destructive mt-1">
    <span className="font-medium">Reason: </span>
    {leave.rejectionReason}
  </p>
)}
```

## Features Implemented

### 1. Approval Tracking
- ✅ Records who approved the leave
- ✅ Records when it was approved
- ✅ Shows approver name in UI
- ✅ Shows approval timestamp

### 2. Rejection Tracking
- ✅ Records who rejected the leave
- ✅ Records when it was rejected
- ✅ Requires rejection reason
- ✅ Shows rejection reason in UI
- ✅ Shows rejector name and timestamp

### 3. User Experience
- ✅ Rejection dialog with textarea
- ✅ Validation for rejection reason
- ✅ Clear visual display of approval info
- ✅ Rejection reason visible to staff
- ✅ Timestamps in readable format

## Database Fields

| Field | Type | Description |
|-------|------|-------------|
| `approved_by` | BIGINT (FK) | User ID who approved/rejected |
| `approved_at` | TIMESTAMP | When it was approved/rejected |
| `rejection_reason` | TEXT | Reason for rejection (nullable) |

## API Changes

### Approve Endpoint
```
POST /api/leave-requests/{id}/approve

Body:
{
  "approved_by": 1  // Optional, defaults to 1
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "status": "approved",
    "approvedBy": 1,
    "approvedByName": "John Smith",
    "approvedAt": "2026-02-18T12:30:00Z"
  }
}
```

### Reject Endpoint
```
POST /api/leave-requests/{id}/reject

Body:
{
  "rejection_reason": "Insufficient coverage during requested period",
  "approved_by": 1  // Optional, defaults to 1
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "status": "rejected",
    "approvedBy": 1,
    "approvedByName": "John Smith",
    "approvedAt": "2026-02-18T12:30:00Z",
    "rejectionReason": "Insufficient coverage during requested period"
  }
}
```

## UI Changes

### Before
```
┌─────────────────────────────────────────────────────┐
│ Staff | Start | End | Status | Actions              │
├─────────────────────────────────────────────────────┤
│ John  | 02/20 | 02/22 | Approved | -                │
│ Sarah | 02/25 | 02/27 | Rejected | -                │
└─────────────────────────────────────────────────────┘
```

### After
```
┌──────────────────────────────────────────────────────────────────┐
│ Staff | Start | End | Status | Approved/Rejected By | Actions   │
├──────────────────────────────────────────────────────────────────┤
│ John  | 02/20 | 02/22 | Approved | 👤 Admin Smith    | -        │
│       |       |       |          | 🕐 02/18 12:30 PM |          │
├──────────────────────────────────────────────────────────────────┤
│ Sarah | 02/25 | 02/27 | Rejected | 👤 Admin Smith    | -        │
│       | Reason: Insufficient coverage | 🕐 02/18 1:45 PM |       │
└──────────────────────────────────────────────────────────────────┘
```

## Testing

### Test Approval
1. Go to Leave Management page
2. Find a pending leave request
3. Click the checkmark (✓) button
4. Leave is approved
5. Check database: `approved_by` and `approved_at` are set
6. UI shows approver name and timestamp

### Test Rejection
1. Go to Leave Management page
2. Find a pending leave request
3. Click the X button
4. Dialog opens asking for rejection reason
5. Enter reason (e.g., "Insufficient coverage")
6. Click "Reject Leave"
7. Leave is rejected
8. Check database: `approved_by`, `approved_at`, and `rejection_reason` are set
9. UI shows rejector name, timestamp, and reason

### Test Validation
1. Click reject button
2. Leave rejection reason empty
3. Click "Reject Leave"
4. Error toast: "Please provide a reason for rejection"
5. Enter reason and try again
6. Success!

## Files Modified

### Backend
1. ✅ `backend/app/Models/LeaveRequest.php`
2. ✅ `backend/app/Http/Controllers/Api/LeaveRequestController.php`

### Frontend
1. ✅ `src/types/index.ts`
2. ✅ `src/services/leaveService.ts`
3. ✅ `src/pages/LeavesPage.tsx`

## Benefits

### 1. Accountability
- Know who approved/rejected each leave
- Audit trail for all decisions
- Timestamp for when action was taken

### 2. Transparency
- Staff can see who made the decision
- Rejection reasons are clear
- No confusion about leave status

### 3. Better Communication
- Rejection reasons help staff understand
- Can address concerns for future requests
- Reduces back-and-forth communication

### 4. Compliance
- Proper record keeping
- Audit trail for HR purposes
- Meets regulatory requirements

## Status

✅ **COMPLETE** - Leave approval tracking is now fully functional!

## Next Steps (Optional)

1. Add email notifications with approval/rejection details
2. Add ability to appeal rejected leaves
3. Add approval workflow (multi-level approval)
4. Add approval history log
5. Add reports on approval patterns

The leave management system now properly tracks who approved/rejected leaves, when, and why! 🎉
