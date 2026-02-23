<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Account;
use Laravel\Sanctum\PersonalAccessToken;

class SanctumMultiAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Get the token from the Authorization header
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated - No token provided'
            ], 401);
        }

        // Find the token in personal_access_tokens table
        $accessToken = PersonalAccessToken::findToken($token);
        
        if (!$accessToken) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated - Invalid token'
            ], 401);
        }

        // Get the tokenable (User or Account)
        $tokenable = $accessToken->tokenable;
        
        if (!$tokenable) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated - Token owner not found'
            ], 401);
        }

        // Check if the user/account is active
        if ($tokenable->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is not active'
            ], 403);
        }

        // Set the authenticated user
        $request->setUserResolver(function () use ($tokenable) {
            return $tokenable;
        });

        return $next($request);
    }
}
