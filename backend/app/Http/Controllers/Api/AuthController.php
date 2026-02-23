<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new account (public registration)
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:accounts,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $account = Account::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'account_type' => 'patient',
            'status' => 'active',
        ]);

        $token = $account->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => [
                    'id' => $account->id,
                    'name' => $account->name,
                    'email' => $account->email,
                    'phone' => $account->phone,
                    'account_type' => $account->account_type,
                    'status' => $account->status,
                    'avatar' => $account->avatar,
                    'user_type' => 'account',
                ],
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * Login user or account
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Try to find in accounts table first (public users)
        $account = Account::where('email', $request->email)->first();
        
        if ($account && Hash::check($request->password, $account->password)) {
            if ($account->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is not active. Please contact support.'
                ], 403);
            }

            $token = $account->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $account->id,
                        'name' => $account->name,
                        'email' => $account->email,
                        'phone' => $account->phone,
                        'account_type' => $account->account_type,
                        'status' => $account->status,
                        'avatar' => $account->avatar,
                        'user_type' => 'account', // Identify as public account
                    ],
                    'token' => $token,
                ]
            ]);
        }

        // Try to find in users table (staff/doctors)
        $user = User::where('email', $request->email)->first();
        
        if ($user && Hash::check($request->password, $user->password)) {
            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is not active. Please contact administration.'
                ], 403);
            }

            $user->load(['role', 'specialty', 'department']);
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role ? $user->role->name : null,
                        'roleId' => $user->role_id,
                        'roleDisplay' => $user->role ? $user->role->display_name : null,
                        'specialty' => $user->specialty ? $user->specialty->name : null,
                        'specialtyId' => $user->specialty_id,
                        'departmentId' => $user->department_id,
                        'status' => $user->status,
                        'avatar' => $user->avatar,
                        'user_type' => 'staff', // Identify as staff/doctor
                    ],
                    'token' => $token,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get current authenticated user or account
     */
    public function me(Request $request)
    {
        $authenticatable = $request->user();
        
        // Check if it's an Account model
        if ($authenticatable instanceof Account) {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $authenticatable->id,
                    'name' => $authenticatable->name,
                    'email' => $authenticatable->email,
                    'phone' => $authenticatable->phone,
                    'account_type' => $authenticatable->account_type,
                    'status' => $authenticatable->status,
                    'avatar' => $authenticatable->avatar,
                    'user_type' => 'account',
                ]
            ]);
        }
        
        // Otherwise it's a User model (staff/doctor)
        $authenticatable->load(['role', 'specialty', 'department']);
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $authenticatable->id,
                'name' => $authenticatable->name,
                'email' => $authenticatable->email,
                'phone' => $authenticatable->phone,
                'role' => $authenticatable->role ? $authenticatable->role->name : null,
                'roleId' => $authenticatable->role_id,
                'roleDisplay' => $authenticatable->role ? $authenticatable->role->display_name : null,
                'specialty' => $authenticatable->specialty ? $authenticatable->specialty->name : null,
                'specialtyId' => $authenticatable->specialty_id,
                'departmentId' => $authenticatable->department_id,
                'status' => $authenticatable->status,
                'avatar' => $authenticatable->avatar,
                'user_type' => 'staff',
            ]
        ]);
    }
}
