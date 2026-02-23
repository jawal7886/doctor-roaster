<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of leave requests.
     */
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['user', 'approver']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('end_date', '<=', $request->end_date);
        }

        $leaveRequests = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $leaveRequests->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'userId' => $leave->user_id,
                    'userName' => $leave->user ? $leave->user->name : null,
                    'userRole' => $leave->user ? $leave->user->role : null,
                    'startDate' => $leave->start_date,
                    'endDate' => $leave->end_date,
                    'reason' => $leave->reason,
                    'status' => $leave->status,
                    'approvedBy' => $leave->approved_by,
                    'approvedByName' => $leave->approver ? $leave->approver->name : null,
                    'approvedAt' => $leave->approved_at,
                    'rejectionReason' => $leave->rejection_reason,
                    'createdAt' => $leave->created_at,
                    'updatedAt' => $leave->updated_at,
                ];
            })
        ]);
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:500',
        ], [
            'user_id.required' => 'Please select a user.',
            'start_date.required' => 'Start date is required.',
            'start_date.after_or_equal' => 'Start date must be today or later.',
            'end_date.required' => 'End date is required.',
            'end_date.after_or_equal' => 'End date must be on or after start date.',
            'reason.required' => 'Please provide a reason for leave.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for overlapping leave requests
        $overlap = LeaveRequest::where('user_id', $request->user_id)
            ->where('status', '!=', 'rejected')
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_date', '<=', $request->start_date)
                          ->where('end_date', '>=', $request->end_date);
                    });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'success' => false,
                'message' => 'This user already has a leave request for overlapping dates.',
            ], 422);
        }

        $leaveRequest = LeaveRequest::create([
            'user_id' => $request->user_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        $leaveRequest->load('user');

        // Create notification for leave request submission
        \App\Models\Notification::create([
            'user_id' => $leaveRequest->user_id,
            'title' => 'Leave Request Submitted',
            'message' => "Your leave request from {$leaveRequest->start_date} to {$leaveRequest->end_date} has been submitted and is pending approval.",
            'type' => 'leave',
            'related_id' => $leaveRequest->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave request submitted successfully',
            'data' => [
                'id' => $leaveRequest->id,
                'userId' => $leaveRequest->user_id,
                'userName' => $leaveRequest->user->name,
                'startDate' => $leaveRequest->start_date,
                'endDate' => $leaveRequest->end_date,
                'reason' => $leaveRequest->reason,
                'status' => $leaveRequest->status,
            ]
        ], 201);
    }

    /**
     * Display the specified leave request.
     */
    public function show($id)
    {
        $leaveRequest = LeaveRequest::with(['user', 'approver'])->find($id);

        if (!$leaveRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $leaveRequest->id,
                'userId' => $leaveRequest->user_id,
                'userName' => $leaveRequest->user->name,
                'startDate' => $leaveRequest->start_date,
                'endDate' => $leaveRequest->end_date,
                'reason' => $leaveRequest->reason,
                'status' => $leaveRequest->status,
                'approvedBy' => $leaveRequest->approved_by,
                'approvedByName' => $leaveRequest->approver ? $leaveRequest->approver->name : null,
                'approvedAt' => $leaveRequest->approved_at,
                'rejectionReason' => $leaveRequest->rejection_reason,
            ]
        ]);
    }

    /**
     * Update the specified leave request.
     */
    public function update(Request $request, $id)
    {
        $leaveRequest = LeaveRequest::find($id);

        if (!$leaveRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'reason' => 'sometimes|required|string|max:500',
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $leaveRequest->update($request->all());
        $leaveRequest->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Leave request updated successfully',
            'data' => [
                'id' => $leaveRequest->id,
                'userId' => $leaveRequest->user_id,
                'userName' => $leaveRequest->user->name,
                'startDate' => $leaveRequest->start_date,
                'endDate' => $leaveRequest->end_date,
                'reason' => $leaveRequest->reason,
                'status' => $leaveRequest->status,
            ]
        ]);
    }

    /**
     * Approve a leave request.
     */
    public function approve(Request $request, $id)
    {
        $leaveRequest = LeaveRequest::find($id);

        if (!$leaveRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request not found'
            ], 404);
        }

        // Get the approver user ID (you can get this from authenticated user or request)
        $approverId = $request->input('approved_by', 1); // Default to user 1 if not provided

        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => $approverId,
            'approved_at' => now(),
            'rejection_reason' => null, // Clear rejection reason if previously rejected
        ]);
        
        $leaveRequest->load(['user', 'approver']);

        // Create notification for the user
        \App\Models\Notification::create([
            'user_id' => $leaveRequest->user_id,
            'title' => 'Leave Request Approved',
            'message' => "Your leave request from {$leaveRequest->start_date} to {$leaveRequest->end_date} has been approved.",
            'type' => 'leave',
            'related_id' => $leaveRequest->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave request approved successfully',
            'data' => [
                'id' => $leaveRequest->id,
                'userId' => $leaveRequest->user_id,
                'userName' => $leaveRequest->user->name,
                'status' => $leaveRequest->status,
                'approvedBy' => $leaveRequest->approved_by,
                'approvedByName' => $leaveRequest->approver ? $leaveRequest->approver->name : null,
                'approvedAt' => $leaveRequest->approved_at,
            ]
        ]);
    }

    /**
     * Reject a leave request.
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:500',
            'approved_by' => 'nullable|exists:users,id',
        ], [
            'rejection_reason.required' => 'Please provide a reason for rejection.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $leaveRequest = LeaveRequest::find($id);

        if (!$leaveRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request not found'
            ], 404);
        }

        // Get the approver user ID (you can get this from authenticated user or request)
        $approverId = $request->input('approved_by', 1); // Default to user 1 if not provided

        $leaveRequest->update([
            'status' => 'rejected',
            'approved_by' => $approverId,
            'approved_at' => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);
        
        $leaveRequest->load(['user', 'approver']);

        // Create notification for the user
        \App\Models\Notification::create([
            'user_id' => $leaveRequest->user_id,
            'title' => 'Leave Request Rejected',
            'message' => "Your leave request from {$leaveRequest->start_date} to {$leaveRequest->end_date} has been rejected. Reason: {$request->rejection_reason}",
            'type' => 'leave',
            'related_id' => $leaveRequest->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave request rejected',
            'data' => [
                'id' => $leaveRequest->id,
                'userId' => $leaveRequest->user_id,
                'userName' => $leaveRequest->user->name,
                'status' => $leaveRequest->status,
                'approvedBy' => $leaveRequest->approved_by,
                'approvedByName' => $leaveRequest->approver ? $leaveRequest->approver->name : null,
                'approvedAt' => $leaveRequest->approved_at,
                'rejectionReason' => $leaveRequest->rejection_reason,
            ]
        ]);
    }

    /**
     * Remove the specified leave request.
     */
    public function destroy($id)
    {
        $leaveRequest = LeaveRequest::find($id);

        if (!$leaveRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request not found'
            ], 404);
        }

        $leaveRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Leave request deleted successfully'
        ]);
    }

    /**
     * Get leave statistics.
     */
    public function stats()
    {
        $pending = LeaveRequest::where('status', 'pending')->count();
        $approved = LeaveRequest::where('status', 'approved')->count();
        $rejected = LeaveRequest::where('status', 'rejected')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
                'total' => $pending + $approved + $rejected,
            ]
        ]);
    }
}
