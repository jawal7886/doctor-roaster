<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        $query = Notification::with('user');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by read status
        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read === 'true' || $request->is_read === '1');
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $notifications = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $notifications->map(function ($notif) {
                return [
                    'id' => $notif->id,
                    'userId' => $notif->user_id,
                    'userName' => $notif->user ? $notif->user->name : null,
                    'title' => $notif->title,
                    'message' => $notif->message,
                    'type' => $notif->type,
                    'isRead' => (bool) $notif->is_read,
                    'relatedId' => $notif->related_id,
                    'createdAt' => $notif->created_at->toISOString(),
                ];
            })
        ]);
    }

    /**
     * Store a newly created notification.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:200',
            'message' => 'required|string',
            'type' => 'required|in:shift,swap,leave,emergency,general',
            'related_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $notification = Notification::create([
            'user_id' => $request->user_id,
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type,
            'related_id' => $request->related_id,
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification created successfully',
            'data' => [
                'id' => $notification->id,
                'userId' => $notification->user_id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'isRead' => false,
                'relatedId' => $notification->related_id,
                'createdAt' => $notification->created_at->toISOString(),
            ]
        ], 201);
    }

    /**
     * Get notification statistics.
     */
    public function stats(Request $request)
    {
        $userId = $request->get('user_id');
        
        $query = Notification::query();
        
        if ($userId) {
            $query->where('user_id', $userId);
        }

        $total = $query->count();
        $unread = (clone $query)->where('is_read', false)->count();
        $byType = (clone $query)->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'unread' => $unread,
                'read' => $total - $unread,
                'byType' => $byType,
            ]
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $query = Notification::where('is_read', false);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $count = $query->count();
        $query->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => "Marked {$count} notifications as read"
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Delete all read notifications.
     */
    public function clearRead(Request $request)
    {
        $query = Notification::where('is_read', true);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $count = $query->count();
        $query->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$count} read notifications"
        ]);
    }
}
