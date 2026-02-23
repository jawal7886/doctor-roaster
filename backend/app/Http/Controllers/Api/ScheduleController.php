<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScheduleEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScheduleController extends Controller
{
    /**
     * Display a listing of schedule entries.
     * Supports filtering by date range, department, and user.
     */
    public function index(Request $request)
    {
        $query = ScheduleEntry::with(['user', 'department', 'shift']);

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $schedules = $query->orderBy('date', 'asc')
                          ->orderBy('shift_type', 'asc')
                          ->get();

        return response()->json([
            'success' => true,
            'data' => $schedules->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'userId' => $schedule->user_id,
                    'userName' => $schedule->user ? $schedule->user->name : null,
                    'userRole' => $schedule->user ? $schedule->user->role : null,
                    'shiftId' => $schedule->shift_id,
                    'date' => $schedule->date,
                    'departmentId' => $schedule->department_id,
                    'departmentName' => $schedule->department ? $schedule->department->name : null,
                    'departmentColor' => $schedule->department ? $schedule->department->color : null,
                    'shiftType' => $schedule->shift_type,
                    'status' => $schedule->status,
                    'isOnCall' => (bool) $schedule->is_on_call,
                    'notes' => $schedule->notes,
                    'createdAt' => $schedule->created_at,
                    'updatedAt' => $schedule->updated_at,
                ];
            })
        ]);
    }

    /**
     * Store a newly created schedule entry.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'date' => 'required|date',
            'department_id' => 'required|exists:departments,id',
            'shift_type' => 'required|in:morning,evening,night',
            'status' => 'nullable|in:scheduled,confirmed,swapped,cancelled',
            'is_on_call' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ], [
            'user_id.required' => 'Please select a user.',
            'user_id.exists' => 'Selected user does not exist.',
            'date.required' => 'Date is required.',
            'department_id.required' => 'Please select a department.',
            'shift_type.required' => 'Please select a shift type.',
            'shift_type.in' => 'Invalid shift type selected.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for conflicts - same user, same date, overlapping shifts
        $conflict = ScheduleEntry::where('user_id', $request->user_id)
            ->where('date', $request->date)
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'This user already has a shift scheduled for this date.',
            ], 422);
        }

        $schedule = ScheduleEntry::create([
            'user_id' => $request->user_id,
            'shift_id' => $request->shift_id,
            'date' => $request->date,
            'department_id' => $request->department_id,
            'shift_type' => $request->shift_type,
            'status' => $request->status ?? 'scheduled',
            'is_on_call' => $request->is_on_call ?? false,
            'notes' => $request->notes,
        ]);

        $schedule->load(['user', 'department', 'shift']);

        // Create notification for the user
        \App\Models\Notification::create([
            'user_id' => $schedule->user_id,
            'title' => 'New Shift Assigned',
            'message' => "You have been assigned a {$schedule->shift_type} shift on {$schedule->date} in {$schedule->department->name}.",
            'type' => 'shift',
            'related_id' => $schedule->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule entry created successfully',
            'data' => [
                'id' => $schedule->id,
                'userId' => $schedule->user_id,
                'userName' => $schedule->user->name,
                'shiftId' => $schedule->shift_id,
                'date' => $schedule->date,
                'departmentId' => $schedule->department_id,
                'departmentName' => $schedule->department->name,
                'departmentColor' => $schedule->department->color,
                'shiftType' => $schedule->shift_type,
                'status' => $schedule->status,
                'isOnCall' => (bool) $schedule->is_on_call,
                'notes' => $schedule->notes,
            ]
        ], 201);
    }

    /**
     * Display the specified schedule entry.
     */
    public function show($id)
    {
        $schedule = ScheduleEntry::with(['user', 'department', 'shift'])->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule entry not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $schedule->id,
                'userId' => $schedule->user_id,
                'userName' => $schedule->user->name,
                'shiftId' => $schedule->shift_id,
                'date' => $schedule->date,
                'departmentId' => $schedule->department_id,
                'departmentName' => $schedule->department->name,
                'shiftType' => $schedule->shift_type,
                'status' => $schedule->status,
                'isOnCall' => (bool) $schedule->is_on_call,
                'notes' => $schedule->notes,
            ]
        ]);
    }

    /**
     * Update the specified schedule entry.
     */
    public function update(Request $request, $id)
    {
        $schedule = ScheduleEntry::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule entry not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'sometimes|required|exists:users,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'date' => 'sometimes|required|date',
            'department_id' => 'sometimes|required|exists:departments,id',
            'shift_type' => 'sometimes|required|in:morning,evening,night',
            'status' => 'nullable|in:scheduled,confirmed,swapped,cancelled',
            'is_on_call' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for conflicts if user or date is being changed
        if ($request->has('user_id') || $request->has('date')) {
            $userId = $request->user_id ?? $schedule->user_id;
            $date = $request->date ?? $schedule->date;

            $conflict = ScheduleEntry::where('user_id', $userId)
                ->where('date', $date)
                ->where('id', '!=', $id)
                ->where('status', '!=', 'cancelled')
                ->exists();

            if ($conflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'This user already has a shift scheduled for this date.',
                ], 422);
            }
        }

        $schedule->update($request->all());
        $schedule->load(['user', 'department', 'shift']);

        // Create notification for schedule update
        \App\Models\Notification::create([
            'user_id' => $schedule->user_id,
            'title' => 'Shift Updated',
            'message' => "Your {$schedule->shift_type} shift on {$schedule->date} has been updated.",
            'type' => 'shift',
            'related_id' => $schedule->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule entry updated successfully',
            'data' => [
                'id' => $schedule->id,
                'userId' => $schedule->user_id,
                'userName' => $schedule->user->name,
                'shiftId' => $schedule->shift_id,
                'date' => $schedule->date,
                'departmentId' => $schedule->department_id,
                'departmentName' => $schedule->department->name,
                'departmentColor' => $schedule->department->color,
                'shiftType' => $schedule->shift_type,
                'status' => $schedule->status,
                'isOnCall' => (bool) $schedule->is_on_call,
                'notes' => $schedule->notes,
            ]
        ]);
    }

    /**
     * Remove the specified schedule entry.
     */
    public function destroy($id)
    {
        $schedule = ScheduleEntry::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule entry not found'
            ], 404);
        }

        // Store info before deletion for notification
        $userId = $schedule->user_id;
        $shiftType = $schedule->shift_type;
        $date = $schedule->date;

        $schedule->delete();

        // Create notification for schedule deletion
        \App\Models\Notification::create([
            'user_id' => $userId,
            'title' => 'Shift Cancelled',
            'message' => "Your {$shiftType} shift on {$date} has been cancelled.",
            'type' => 'shift',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule entry deleted successfully'
        ]);
    }

    /**
     * Get schedule statistics for a date range.
     */
    public function stats(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfWeek()->toDateString();
        $endDate = $request->end_date ?? now()->endOfWeek()->toDateString();

        $totalShifts = ScheduleEntry::whereBetween('date', [$startDate, $endDate])->count();
        $confirmedShifts = ScheduleEntry::whereBetween('date', [$startDate, $endDate])
            ->where('status', 'confirmed')
            ->count();
        $onCallShifts = ScheduleEntry::whereBetween('date', [$startDate, $endDate])
            ->where('is_on_call', true)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'totalShifts' => $totalShifts,
                'confirmedShifts' => $confirmedShifts,
                'onCallShifts' => $onCallShifts,
                'pendingShifts' => $totalShifts - $confirmedShifts,
            ]
        ]);
    }
}
