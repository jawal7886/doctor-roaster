<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SpecialtyController;
use App\Http\Controllers\Api\HospitalSettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is running',
        'timestamp' => now()
    ]);
});

// Authentication Routes (Public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Require Authentication)
Route::middleware('sanctum.multi')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Account Profile (for public users from accounts table)
    Route::get('/account/profile', [AccountController::class, 'show']);
    Route::put('/account/profile', [AccountController::class, 'update']);
    
    // Users API (for staff from users table)
    Route::apiResource('users', UserController::class);

    // Roles API
    Route::apiResource('roles', RoleController::class);

    // Specialties API
    Route::apiResource('specialties', SpecialtyController::class);

    // Departments API
    Route::apiResource('departments', DepartmentController::class);

    // Schedule API
    Route::apiResource('schedules', ScheduleController::class);
    Route::get('/schedules-stats', [ScheduleController::class, 'stats']);

    // Leave Requests API
    Route::apiResource('leave-requests', LeaveRequestController::class);
    Route::post('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve']);
    Route::post('/leave-requests/{id}/reject', [LeaveRequestController::class, 'reject']);
    Route::get('/leave-requests-stats', [LeaveRequestController::class, 'stats']);

    // Notifications API
    Route::apiResource('notifications', NotificationController::class);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/clear-read', [NotificationController::class, 'clearRead']);
    Route::get('/notifications-stats', [NotificationController::class, 'stats']);

    // Reports API
    Route::get('/reports/overview', [ReportController::class, 'overview']);
    Route::get('/reports/department-duty-hours', [ReportController::class, 'departmentDutyHours']);
    Route::get('/reports/staff-attendance', [ReportController::class, 'staffAttendance']);
    Route::get('/reports/leave-summary', [ReportController::class, 'leaveSummary']);
    Route::get('/reports/export', [ReportController::class, 'export']);

    // Hospital Settings API
    Route::get('/hospital-settings', [HospitalSettingController::class, 'index']);
    Route::put('/hospital-settings', [HospitalSettingController::class, 'update']);
});
