<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::with(['department', 'role', 'specialty']);

        // Filter by role
        if ($request->has('role')) {
            $query->whereHas('role', function($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('specialty', function($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $users = $query->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users)
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'specialty_id' => 'nullable|exists:specialties,id',
            'department_id' => 'nullable|exists:departments,id',
            'status' => 'nullable|in:active,inactive,on_leave',
            'avatar' => 'nullable|string',
            'join_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role_id' => $request->role_id,
            'specialty_id' => $request->specialty_id,
            'department_id' => $request->department_id,
            'status' => $request->status ?? 'active',
            'avatar' => $request->avatar,
            'join_date' => $request->join_date ?? now(),
        ]);

        $user->load(['department', 'role', 'specialty']);

        // Create welcome notification for the new user
        \App\Models\Notification::create([
            'user_id' => $user->id,
            'title' => 'Welcome to the System',
            'message' => "Your account has been created successfully. Welcome to the Hospital Management System, {$user->name}!",
            'type' => 'general',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => new UserResource($user)
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::with(['department', 'role', 'specialty'])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'sometimes|nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'sometimes|required|exists:roles,id',
            'specialty_id' => 'nullable|exists:specialties,id',
            'department_id' => 'nullable|exists:departments,id',
            'status' => 'nullable|in:active,inactive,on_leave',
            'avatar' => 'nullable|string',
            'join_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['password', 'avatar']);
        
        if ($request->has('password') && $request->password) {
            $data['password'] = Hash::make($request->password);
        }

        // Handle avatar upload
        if ($request->has('avatar') && $request->avatar) {
            $avatarData = $request->avatar;
            
            // Parse base64 data
            if (preg_match('/^data:image\/(\w+);base64,/', $avatarData, $matches)) {
                $imageType = $matches[1];
                $base64Image = substr($avatarData, strpos($avatarData, ',') + 1);
                $imageData = base64_decode($base64Image);
                
                if ($imageData !== false) {
                    $fileSize = strlen($imageData);
                    $filename = 'avatar_' . $user->id . '_' . time() . '.' . $imageType;
                    
                    // Store or update avatar in user_avatars table
                    \App\Models\UserAvatar::updateOrCreate(
                        ['user_id' => $user->id],
                        [
                            'filename' => $filename,
                            'original_name' => 'avatar.' . $imageType,
                            'mime_type' => 'image/' . $imageType,
                            'file_size' => $fileSize,
                            'storage_path' => 'avatars/' . $filename,
                            'base64_data' => $avatarData,
                            'storage_type' => 'base64',
                        ]
                    );
                    
                    // Also update the avatar column in users table for backward compatibility
                    $data['avatar'] = $avatarData;
                }
            }
        }

        $user->update($data);
        $user->load(['department', 'role', 'specialty', 'userAvatar']);

        // Create notification for profile update
        \App\Models\Notification::create([
            'user_id' => $user->id,
            'title' => 'Profile Updated',
            'message' => "Your profile information has been updated successfully.",
            'type' => 'general',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Store user info before deletion
        $userName = $user->name;
        $userRole = $user->role ? $user->role->display_name : 'Unknown';

        $user->delete();

        // Notify all admins about the deletion
        $admins = User::whereHas('role', function($q) {
            $q->where('name', 'admin');
        })->get();
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'title' => 'Staff Member Removed',
                'message' => "{$userName} ({$userRole}) has been removed from the system.",
                'type' => 'general',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
