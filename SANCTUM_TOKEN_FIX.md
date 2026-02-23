# Sanctum Token Authentication Fix

## Problem
When updating profile or calling `/api/me`, getting 401 Unauthenticated error even with valid token.

## Root Cause
Laravel was trying to redirect to a 'login' route that doesn't exist for API requests, causing authentication to fail.

## Solution
Updated `bootstrap/app.php` to return JSON response for API authentication failures instead of trying to redirect.

## Changes Made

### File: backend/bootstrap/app.php
```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }
    });
})
```

## How to Test

### 1. Login and get token:
```bash
POST http://localhost:8000/api/login
Body: {
  "email": "patient@example.com",
  "password": "password123"
}

Response: {
  "data": {
    "token": "11|..."
  }
}
```

### 2. Use token to access protected endpoint:
```bash
GET http://localhost:8000/api/me
Headers: {
  "Authorization": "Bearer 11|...",
  "Accept": "application/json"
}

Should return user data
```

### 3. Update profile:
```bash
PUT http://localhost:8000/api/account/profile
Headers: {
  "Authorization": "Bearer 11|...",
  "Accept": "application/json"
}
Body: {
  "name": "Updated Name"
}

Should update successfully
```

## Next Steps

If still getting 401 errors:
1. Check browser console for the exact error
2. Check Network tab to see the request headers
3. Verify token is being sent correctly
4. Check Laravel logs for detailed error

The token should be in format: `{id}|{hash}`
Example: `11|E6rDXogDCXaEqf7nsIQHWviCkC0lampN5TH5olumc7e16895`
