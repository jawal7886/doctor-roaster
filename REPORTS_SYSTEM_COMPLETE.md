# Reports & Analytics System - Complete

## Overview
Comprehensive reporting system with real-time data and Excel export functionality.

## Features Implemented

### 1. Overview Statistics
**Endpoint:** `GET /api/reports/overview`

**Metrics:**
- Total Duty Hours (sum of all shifts × 8 hours)
- Shifts This Week (count of scheduled shifts)
- Staff on Leave (approved leave requests)
- Coverage Rate (percentage of shifts filled)

**Query Parameters:**
- `start_date` (optional) - Default: start of current week
- `end_date` (optional) - Default: end of current week

### 2. Department Duty Hours Report
**Endpoint:** `GET /api/reports/department-duty-hours`

**Data Includes:**
- Department name and color
- Number of doctors
- Maximum hours capacity
- Used hours
- Coverage percentage

**Calculation:**
- Max Hours = max_hours_per_doctor × doctor_count
- Used Hours = scheduled_shifts × 8
- Coverage = (used_hours / max_hours) × 100

### 3. Staff Attendance Report
**Endpoint:** `GET /api/reports/staff-attendance`

**Data Includes:**
- Staff member details
- Scheduled shifts
- Completed shifts
- Cancelled shifts
- Leave days
- Attendance rate

### 4. Leave Summary Report
**Endpoint:** `GET /api/reports/leave-summary`

**Data Includes:**
- Total leave requests
- Pending/Approved/Rejected counts
- Department-wise breakdown

### 5. Excel Export
**Endpoint:** `GET /api/reports/export`

**Supported Reports:**
- `department_duty_hours` - Department performance
- `staff_attendance` - Staff attendance records
- `leave_summary` - Leave statistics

**Format:** CSV (Excel-compatible)
**Download:** Automatic browser download

## Frontend Implementation

### ReportsPage Component
**File:** `src/pages/ReportsPage.tsx`

**Features:**
- ✅ Real-time data from API
- ✅ Overview statistics cards
- ✅ Department duty hours table
- ✅ Export to Excel button
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

### Report Service
**File:** `src/services/reportService.ts`

**Functions:**
- `getOverviewStats()` - Fetch overview metrics
- `getDepartmentDutyHours()` - Fetch department report
- `getStaffAttendance()` - Fetch attendance report
- `getLeaveSummary()` - Fetch leave summary
- `exportReport()` - Download Excel file

## API Routes

```php
// Reports API
Route::get('/reports/overview', [ReportController::class, 'overview']);
Route::get('/reports/department-duty-hours', [ReportController::class, 'departmentDutyHours']);
Route::get('/reports/staff-attendance', [ReportController::class, 'staffAttendance']);
Route::get('/reports/leave-summary', [ReportController::class, 'leaveSummary']);
Route::get('/reports/export', [ReportController::class, 'export']);
```

## Usage Examples

### Fetch Overview Stats
```typescript
const stats = await getOverviewStats({
  startDate: '2026-02-17',
  endDate: '2026-02-23'
});
```

### Export Report
```typescript
await exportReport('department_duty_hours', {
  startDate: '2026-02-17',
  endDate: '2026-02-23'
});
// File downloads automatically
```

## Excel Export Format

### Department Duty Hours CSV
```
Department,Doctors,Max Hours,Used Hours,Coverage %
Cardiology,3,120h,95h,79%
Surgery,2,80h,62h,78%
Pediatrics,2,80h,58h,73%
```

### Staff Attendance CSV
```
Name,Role,Department,Scheduled,Completed,Cancelled,Leave Days,Attendance %
Dr. John Doe,doctor,Cardiology,10,9,1,0,90%
```

### Leave Summary CSV
```
Department,Total Leaves,Approved Leaves
Cardiology,5,4
Surgery,3,2
```

## Testing

### Test Overview API
```bash
curl http://localhost:8000/api/reports/overview
```

### Test Department Report
```bash
curl http://localhost:8000/api/reports/department-duty-hours
```

### Test Export
```bash
curl "http://localhost:8000/api/reports/export?report_type=department_duty_hours" -o report.csv
```

## Files Created/Modified

### Backend:
1. `backend/app/Http/Controllers/Api/ReportController.php` - NEW
2. `backend/routes/api.php` - Updated with report routes

### Frontend:
1. `src/services/reportService.ts` - NEW
2. `src/pages/ReportsPage.tsx` - Updated with real data

## Features

✅ Real-time data from database
✅ Multiple report types
✅ Date range filtering
✅ Excel export (CSV format)
✅ Automatic file download
✅ Loading states
✅ Error handling
✅ Toast notifications
✅ Responsive design
✅ Coverage visualization
✅ Department color coding

The reports system is now fully functional with Excel export!
