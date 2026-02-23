# Separate Accounts System - Implementation Complete ✅

## Overview
Created a separate `accounts` table for public registration (patients/visitors) while keeping the `users` table for internal staff (doctors/nurses/admin).

## Problem Solved
- `users` table is for hospital staff (doctors, nurses, admin) - managed internally
- `accounts` table is for public users (patients, visitors) - self-registration

## Database Structure

### accounts Table (NEW - for public users)
```sql
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    account_type ENUM('patient', 'visitor', 'guest') DEFAULT 'patient',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    avatar TEXT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### users Table (EXISTING - for staff/doctors)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NULL,
    specialty_id BIGINT NULL,
    department_id BIGINT NULL,
    phone VARCHAR(20) NULL,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    avatar LONGTEXT NULL,
    join_date DATE NOT NULL,
    ... (other staff-specific fields)
);
```

## How It Works

### Registration (Public Users)
1. User visits `/signup` page
2. Fills registration form
3. POST to `/api/register`
4. Creates record in `accounts` table
5. Returns token for authentication
6. User can login with these credentials

### Login (Both User Types)
1. User enters email and password
2. POST to `/api/login`
3. Backend checks `accounts` table first
4. If not found, checks `users` table
5. Returns appropriate user data with `user_type` field:
   - `user_type: 'account'` - Public user from accounts table
   - `user_type: 'staff'` - Staff member from users table

### Authentication
- Both tables use Laravel Sanctum for tokens
- Tokens stored in `personal_access_tokens` table
- Same authentication mechanism for both

## API Endpoints

### POST /api/register
**Purpose:** Create new public account
**Table:** accounts
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "account": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "account_type": "patient",
      "status": "active",
      "avatar": null
    },
    "token": "1|..."
  }
}
```

### POST /api/login
**Purpose:** Login for both account types
**Tables:** accounts (checked first), then users
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response for Account:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "account_type": "patient",
      "status": "active",
      "avatar": null,
      "user_type": "account"
    },
    "token": "1|..."
  }
}
```

**Response for Staff:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Dr. Smith",
      "email": "doctor@hospital.com",
      "phone": "1234567890",
      "role": "doctor",
      "roleId": 2,
      "roleDisplay": "Doctor",
      "specialty": "Cardiology",
      "departmentId": 1,
      "status": "active",
      "avatar": null,
      "user_type": "staff"
    },
    "token": "1|..."
  }
}
```

### GET /api/me
**Purpose:** Get current authenticated user
**Tables:** Detects which table the user is from
**Response:** Returns appropriate user data with `user_type` field

### POST /api/logout
**Purpose:** Logout and invalidate token
**Works for:** Both account types

## Files Created

1. **Migration:** `backend/database/migrations/2026_02_19_060551_create_accounts_table.php`
   - Creates accounts table

2. **Model:** `backend/app/Models/Account.php`
   - Account model with HasApiTokens trait
   - Handles authentication for public users

## Files Modified

1. **AuthController:** `backend/app/Http/Controllers/Api/AuthController.php`
   - Updated `register()` - Creates Account instead of User
   - Updated `login()` - Checks both tables
   - Updated `me()` - Returns appropriate user data

2. **Auth Config:** `backend/config/auth.php`
   - Added `accounts` provider

## User Types

### Account (Public Users)
- **Table:** accounts
- **Types:** patient, visitor, guest
- **Access:** Limited to public features
- **Registration:** Self-service via signup page
- **Fields:** name, email, phone, account_type, status, avatar

### User (Staff/Doctors)
- **Table:** users
- **Types:** admin, doctor, nurse, etc. (via roles)
- **Access:** Full system access based on role
- **Registration:** Created by admin only
- **Fields:** name, email, phone, role_id, specialty_id, department_id, status, avatar, join_date

## Testing

### Test Public Registration:
```bash
POST http://localhost:8000/api/register
Body: {
  "name": "Test Patient",
  "email": "patient@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "1234567890"
}

Expected: 201 Created
Response: Account created in accounts table
```

### Test Public Login:
```bash
POST http://localhost:8000/api/login
Body: {
  "email": "patient@example.com",
  "password": "password123"
}

Expected: 200 OK
Response: user_type = "account"
```

### Test Staff Login:
```bash
POST http://localhost:8000/api/login
Body: {
  "email": "doctor@hospital.com",
  "password": "password"
}

Expected: 200 OK
Response: user_type = "staff"
```

### Verify Database:
```bash
# Check accounts table
php artisan tinker --execute="echo Account::count();"

# Check users table
php artisan tinker --execute="echo User::count();"
```

## Frontend Integration

The frontend doesn't need changes! The API response format is compatible:
- Registration works the same way
- Login works the same way
- Token storage works the same way
- Authentication works the same way

The only difference is the `user_type` field in the response, which can be used to show different UI for different user types.

## Benefits

1. **Separation of Concerns:**
   - Staff data separate from public users
   - Different fields for different user types
   - Easier to manage permissions

2. **Security:**
   - Public users can't access staff features
   - Staff credentials separate from public
   - Different validation rules possible

3. **Scalability:**
   - Can add more fields to accounts without affecting users
   - Can have different authentication rules
   - Easier to implement role-based access

4. **Data Integrity:**
   - Staff records remain clean
   - No accidental public registrations in users table
   - Clear distinction between user types

## Migration Status

✅ accounts table created
✅ Account model created
✅ AuthController updated
✅ Auth config updated
✅ Tested and working

## Database Verification

```bash
# Check tables exist
php artisan tinker --execute="echo json_encode(DB::select('SHOW TABLES'), JSON_PRETTY_PRINT);"

# Check accounts table structure
php artisan tinker --execute="echo json_encode(DB::select('DESCRIBE accounts'), JSON_PRETTY_PRINT);"

# Check accounts data
php artisan tinker --execute="echo json_encode(DB::table('accounts')->get(), JSON_PRETTY_PRINT);"
```

## Summary

✅ Created separate `accounts` table for public users
✅ Public registration now creates Account records
✅ Login checks both tables automatically
✅ Staff in `users` table, public in `accounts` table
✅ Same authentication mechanism for both
✅ Frontend works without changes
✅ Tested and verified working

**Now try registering a new account - it will be stored in the accounts table!** 🎉
