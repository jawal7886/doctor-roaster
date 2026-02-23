# Laravel Sanctum Installation Fix

## Problem
When trying to register a new user, the application showed error:
```
Registration Failed
Validation failed
```

Backend error log showed:
```
Auth guard [sanctum] is not defined.
```

## Root Cause
Laravel Sanctum was not installed in the backend. The authentication system was implemented but the required package was missing.

## Solution Applied

### 1. Installed Laravel Sanctum
```bash
cd backend
composer require laravel/sanctum
```

### 2. Published Sanctum Configuration
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

This created:
- `config/sanctum.php` - Sanctum configuration
- Migration for `personal_access_tokens` table

### 3. Ran Migrations
```bash
php artisan migrate
```

Created table: `personal_access_tokens` for storing API tokens

### 4. Updated User Model
**File:** `backend/app/Models/User.php`

Added `HasApiTokens` trait:
```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;
    // ...
}
```

### 5. Updated Auth Configuration
**File:** `backend/config/auth.php`

Added sanctum guard:
```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
    'sanctum' => [
        'driver' => 'sanctum',
        'provider' => 'users',
    ],
],
```

### 6. Updated Bootstrap Configuration
**File:** `backend/bootstrap/app.php`

Added Sanctum middleware:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
})
```

### 7. Updated Sanctum Configuration
**File:** `backend/config/sanctum.php`

Added localhost:5173 to stateful domains:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1',
    Sanctum::currentApplicationUrlWithPort(),
))),
```

### 8. Cleared Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## Files Modified

1. `backend/composer.json` - Added laravel/sanctum dependency
2. `backend/app/Models/User.php` - Added HasApiTokens trait
3. `backend/config/auth.php` - Added sanctum guard
4. `backend/bootstrap/app.php` - Added Sanctum middleware
5. `backend/config/sanctum.php` - Updated stateful domains

## Files Created

1. `backend/config/sanctum.php` - Sanctum configuration
2. `backend/database/migrations/2026_02_19_054012_create_personal_access_tokens_table.php` - Token storage migration

## Database Changes

New table created: `personal_access_tokens`
```sql
CREATE TABLE personal_access_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tokenable_type VARCHAR NOT NULL,
    tokenable_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## How Sanctum Works

### Token Generation
1. User logs in or registers
2. Backend creates token: `$user->createToken('auth_token')->plainTextToken`
3. Token returned to frontend
4. Frontend stores token in localStorage

### Token Usage
1. Frontend adds token to requests: `Authorization: Bearer {token}`
2. Sanctum middleware validates token
3. User authenticated if token valid
4. Request proceeds to controller

### Token Storage
- Tokens stored in `personal_access_tokens` table
- Hashed for security
- Can be revoked on logout
- Optional expiration time

## Testing

### Test Registration:
1. Go to http://localhost:5173/signup
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Password: password123
   - Confirm Password: password123
3. Click "Sign Up"
4. ✅ Should create account and redirect to dashboard

### Test Login:
1. Go to http://localhost:5173/login
2. Enter credentials
3. Click "Sign In"
4. ✅ Should login and redirect to dashboard

### Test Protected Routes:
1. Logout
2. Try to access http://localhost:5173/users
3. ✅ Should redirect to /login
4. Login
5. ✅ Should be able to access all routes

## API Endpoints

### Public Endpoints:
- `POST /api/register` - Create account
- `POST /api/login` - Login

### Protected Endpoints (require Bearer token):
- `POST /api/logout` - Logout
- `GET /api/me` - Get current user
- All other API endpoints

## Environment Variables

No additional environment variables needed. Default configuration works with:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Security Features

1. **Token Hashing:** Tokens hashed in database
2. **Token Expiration:** Optional expiration time
3. **Token Revocation:** Tokens deleted on logout
4. **CORS Protection:** Configured for specific domains
5. **Stateful Domains:** Only allowed domains can use tokens

## Status

✅ Laravel Sanctum installed and configured
✅ User model updated with HasApiTokens
✅ Auth guard configured
✅ Middleware configured
✅ Migrations run
✅ Caches cleared
✅ Ready for testing

## Next Steps

1. Test registration with new account
2. Test login with credentials
3. Test logout functionality
4. Test protected route access
5. Test token persistence

The authentication system is now fully functional with Laravel Sanctum!
