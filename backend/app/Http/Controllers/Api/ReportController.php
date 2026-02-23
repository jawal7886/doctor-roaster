<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Department;
use App\Models\ScheduleEntry;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Get overall statistics
     */
    public function overview(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfWeek()->toDateString();
        $endDate = $request->end_date ?? now()->endOfWeek()->toDateString();

        // Total duty hours (assuming 8 hours per shift)
        $totalShifts = ScheduleEntry::whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->count();
        $totalDutyHours = $totalShifts * 8;

        // Shifts this week
        $shiftsThisWeek = ScheduleEntry::whereBetween('date', [$startDate, $endDate])
            ->count();

        // Staff on leave
        $staffOnLeave = LeaveRequest::where('status', 'approved')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                    });
            })
            ->distinct('user_id')
            ->count('user_id');

        // Coverage rate (percentage of shifts filled)
        $totalDoctors = User::whereHas('role', function($q) {
            $q->whereIn('name', ['doctor', 'department_head']);
        })->where('status', 'active')->count();
        $expectedShifts = $totalDoctors * 5; // Assuming 5 shifts per week per doctor
        $coverageRate = $expectedShifts > 0 ? round(($shiftsThisWeek / $expectedShifts) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'totalDutyHours' => $totalDutyHours,
                'shiftsThisWeek' => $shiftsThisWeek,
                'staffOnLeave' => $staffOnLeave,
                'coverageRate' => $coverageRate,
            ]
        ]);
    }

    /**
     * Get department-wise duty hours report
     */
    public function departmentDutyHours(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfWeek()->toDateString();
        $endDate = $request->end_date ?? now()->endOfWeek()->toDateString();

        $departments = Department::with(['users' => function ($query) {
            $query->whereHas('role', function($q) {
                $q->whereIn('name', ['doctor', 'department_head']);
            });
        }])->get();

        $report = [];

        foreach ($departments as $department) {
            $doctorCount = $department->users->count();
            $maxHours = $department->max_hours_per_doctor * $doctorCount;

            $usedHours = ScheduleEntry::where('department_id', $department->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->where('status', '!=', 'cancelled')
                ->count() * 8; // 8 hours per shift

            $coverage = $maxHours > 0 ? round(($usedHours / $maxHours) * 100, 1) : 0;

            $report[] = [
                'departmentId' => $department->id,
                'departmentName' => $department->name,
                'departmentColor' => $department->color,
                'doctors' => $doctorCount,
                'maxHours' => $maxHours,
                'usedHours' => $usedHours,
                'coverage' => $coverage,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }


    /**
     * Get staff attendance report
     */
    public function staffAttendance(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        $users = User::with(['department', 'role'])
            ->whereHas('role', function($q) {
                $q->whereIn('name', ['doctor', 'nurse', 'staff', 'department_head']);
            })
            ->get();

        $report = [];

        foreach ($users as $user) {
            $scheduledShifts = ScheduleEntry::where('user_id', $user->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->count();

            $completedShifts = ScheduleEntry::where('user_id', $user->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->where('status', 'confirmed')
                ->count();

            $cancelledShifts = ScheduleEntry::where('user_id', $user->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->where('status', 'cancelled')
                ->count();

            $leaveDays = LeaveRequest::where('user_id', $user->id)
                ->where('status', 'approved')
                ->where(function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('start_date', [$startDate, $endDate])
                        ->orWhereBetween('end_date', [$startDate, $endDate]);
                })
                ->count();

            $report[] = [
                'userId' => $user->id,
                'userName' => $user->name,
                'userRole' => $user->role ? $user->role->display_name : 'Unknown',
                'departmentName' => $user->department ? $user->department->name : 'N/A',
                'scheduledShifts' => $scheduledShifts,
                'completedShifts' => $completedShifts,
                'cancelledShifts' => $cancelledShifts,
                'leaveDays' => $leaveDays,
                'attendanceRate' => $scheduledShifts > 0 ? round(($completedShifts / $scheduledShifts) * 100, 1) : 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    /**
     * Get leave summary report
     */
    public function leaveSummary(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        $leaveRequests = LeaveRequest::with('user')
            ->whereBetween('start_date', [$startDate, $endDate])
            ->get();

        $summary = [
            'total' => $leaveRequests->count(),
            'pending' => $leaveRequests->where('status', 'pending')->count(),
            'approved' => $leaveRequests->where('status', 'approved')->count(),
            'rejected' => $leaveRequests->where('status', 'rejected')->count(),
        ];

        $byDepartment = Department::all()->map(function ($dept) use ($leaveRequests) {
            $deptLeaves = $leaveRequests->filter(function ($leave) use ($dept) {
                return $leave->user && $leave->user->department_id === $dept->id;
            });

            return [
                'departmentId' => $dept->id,
                'departmentName' => $dept->name,
                'totalLeaves' => $deptLeaves->count(),
                'approvedLeaves' => $deptLeaves->where('status', 'approved')->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'byDepartment' => $byDepartment,
            ]
        ]);
    }

    /**
     * Export report to Excel format (CSV)
     */
    public function export(Request $request)
    {
        $reportType = $request->report_type ?? 'department_duty_hours';
        $startDate = $request->start_date ?? now()->startOfWeek()->toDateString();
        $endDate = $request->end_date ?? now()->endOfWeek()->toDateString();

        $data = [];
        $filename = '';
        $headers = [];

        switch ($reportType) {
            case 'department_duty_hours':
                $filename = 'department_duty_hours_' . date('Y-m-d') . '.csv';
                $headers = ['Department', 'Doctors', 'Max Hours', 'Used Hours', 'Coverage %'];
                
                $report = $this->departmentDutyHours($request)->getData()->data;
                foreach ($report as $row) {
                    $data[] = [
                        $row->departmentName,
                        $row->doctors,
                        $row->maxHours . 'h',
                        $row->usedHours . 'h',
                        $row->coverage . '%',
                    ];
                }
                break;

            case 'staff_attendance':
                $filename = 'staff_attendance_' . date('Y-m-d') . '.csv';
                $headers = ['Name', 'Role', 'Department', 'Scheduled', 'Completed', 'Cancelled', 'Leave Days', 'Attendance %'];
                
                $report = $this->staffAttendance($request)->getData()->data;
                foreach ($report as $row) {
                    $data[] = [
                        $row->userName,
                        ucfirst($row->userRole),
                        $row->departmentName,
                        $row->scheduledShifts,
                        $row->completedShifts,
                        $row->cancelledShifts,
                        $row->leaveDays,
                        $row->attendanceRate . '%',
                    ];
                }
                break;

            case 'leave_summary':
                $filename = 'leave_summary_' . date('Y-m-d') . '.csv';
                $headers = ['Department', 'Total Leaves', 'Approved Leaves'];
                
                $report = $this->leaveSummary($request)->getData()->data->byDepartment;
                foreach ($report as $row) {
                    $data[] = [
                        $row->departmentName,
                        $row->totalLeaves,
                        $row->approvedLeaves,
                    ];
                }
                break;
        }

        // Generate CSV content
        $csv = implode(',', $headers) . "\n";
        foreach ($data as $row) {
            $csv .= implode(',', $row) . "\n";
        }

        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
