<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AccountController extends Controller
{
    /**
     * Get current account profile
     */
    public function show(Request $request)
    {
        $account = $request->user();
        
        if (!$account instanceof Account) {
            return response()->json([
                'success' => false,
                'message' => 'Not an account user'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $account->id,
                'name' => $account->name,
                'email' => $account->email,
                'phone' => $account->phone,
                'account_type' => $account->account_type,
                'status' => $account->status,
                'avatar' => $account->avatar,
            ]
        ]);
    }

    /**
     * Update account profile
     */
    public function update(Request $request)
    {
        $account = $request->user();
        
        if (!$account instanceof Account) {
            return response()->json([
                'success' => false,
                'message' => 'Not an account user'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:accounts,email,' . $account->id,
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['name', 'email', 'phone', 'avatar']);
        
        // Handle password update
        if ($request->has('password') && $request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $account->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $account->id,
                'name' => $account->name,
                'email' => $account->email,
                'phone' => $account->phone,
                'account_type' => $account->account_type,
                'status' => $account->status,
                'avatar' => $account->avatar,
            ]
        ]);
    }
}
