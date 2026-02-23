# Profile Update & Refresh Logout Issue - FIXED

## Problems
1. When updating profile → System logs out
2. When refreshing page → System logs out
3. `/api/me` endpoint failing for Account users

## Root Causes

### 1. Wrong Update Endpoint
- EditProfileModal was using `/users/{id}` endpoint
- This endpoint only works for staff (User model)
- Account users need `/account/profile` endpoint

### 2. Missing user_type Field
- `/api/me` response needs `user_type` field
- Frontend uses this to determine Account vs User
- Without it, profile updates fail

### 3. Aggressive Logout on Errors
- Any API error was triggering logout
- Even non-authentication errors
- Fixed in previous update

## Solutions Applied

### 1. Created Profile Service
**File:** `src/services/profileService.ts`

**Purpose:** Automatically detects user type and calls correct endpoint

```typescript
export const updateProfile = async (data) => {
  // Get current user to check type
  const currentUser = await getCurrentUser();
  
  // If Account user, use account endpoint
  if (currentUser.user_type === 'account') {
    return api.put('/account/profile', data);
  }
  
  // If Staff user, use users endpoint
  return api.put(`/users/${currentUser.id}`, data);
};
```

### 2. Updated EditProfileModal
**File:** `src/components/modals/EditProfileModal.tsx`

- Now uses `updateProfile()` from profileService
- Automatically works for both Account and User
- No need to check user type manually

### 3. Added Logging
**Files:** `src/services/authService.ts`, `src/services/profileService.ts`

- Added console.log statements
- Shows what's happening during profile update
- Helps debug issues

### 4. Fixed API Interceptor
**File:** `src/lib/api.ts`

- Only logout on authentication errors
- Don't logout on data loading errors
- Check URL before logging out

## How It Works Now

### Profile Update Flow:
1. User clicks "Edit Profile" in sidebar
2. Modal opens with current data
3. User updates fields
4. Clicks "Save Changes"
5. `updateProfile()` is called
6. Service checks user type from `/api/me`
7. Calls appropriate endpoint:
   - Account → `/account/profile`
   - Staff → `/users/{id}`
8. Backend updates database
9. Returns updated user data
10. Frontend updates UserContext
11. UI updates everywhere
12. ✅ User stays logged in!

### Page Refresh Flow:
1. User refreshes page
2. ProtectedRoute checks authentication
3. Calls `/api/me` to get current user
4. Backend returns user data with `user_type`
5. UserContext updates
6. ✅ User stays logged in!

## API Endpoints

### GET /api/me
**Purpose:** Get current authenticated user
**Works for:** Both Account and User
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "user_type": "account",  // or "staff"
    ...
  }
}
```

### PUT /account/profile
**Purpose:** Update Account user profile
**For:** Public users (from accounts table)
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "avatar": "data:image/png;base64,..."
}
```

### PUT /users/{id}
**Purpose:** Update User profile
**For:** Staff users (from users table)
**Request:**
```json
{
  "name": "Dr. Smith",
  "email": "doctor@hospital.com",
  "phone": "1234567890",
  "role_id": 2,
  "specialty_id": 1,
  "department_id": 1,
  "avatar": "data:image/png;base64,..."
}
```

## Testing

### Test 1: Account Profile Update
1. Register as public user (Account)
2. Login
3. Click "Edit Profile" in sidebar
4. Update name, email, phone, or avatar
5. Click "Save Changes"
6. ✅ Should update successfully
7. ✅ Should stay logged in
8. ✅ Should see updated info in sidebar

### Test 2: Staff Profile Update
1. Login as staff user (doctor/nurse/admin)
2. Click "Edit Profile" in sidebar
3. Update name, email, phone, or avatar
4. Click "Save Changes"
5. ✅ Should update successfully
6. ✅ Should stay logged in
7. ✅ Should see updated info in sidebar

### Test 3: Page Refresh
1. Login (as either Account or Staff)
2. Navigate to any page
3. Press F5 to refresh
4. ✅ Should stay logged in
5. ✅ Should see user info in sidebar
6. ✅ Should be able to use the app

### Test 4: Error Handling
1. Login
2. Stop backend server
3. Try to update profile
4. ✅ Should show error message
5. ✅ Should stay logged in
6. Start backend and retry
7. ✅ Should work

## Debug Console Logs

When you update profile, you'll see in browser console:

```
updateProfile called with data: {...}
getCurrentUser response: {...}
Current user type: account
Updating account profile...
Account profile updated successfully
```

Or for staff:

```
updateProfile called with data: {...}
getCurrentUser response: {...}
Current user type: staff
Updating user profile...
User profile updated successfully
```

If there's an error:

```
Error updating profile: {...}
```

## Files Modified

1. **src/services/profileService.ts** (created)
   - Smart profile update service
   - Detects user type automatically
   - Calls correct endpoint

2. **src/services/authService.ts**
   - Added logging to getCurrentUser
   - Better error messages

3. **src/lib/api.ts** (previous fix)
   - Only logout on auth errors
   - Don't logout on data errors

4. **src/contexts/UserContext.tsx** (previous fix)
   - Better error handling
   - Only logout on 401 errors

5. **src/components/modals/EditProfileModal.tsx**
   - Uses profileService
   - Works for both user types

## Backend Files

1. **backend/app/Http/Controllers/Api/AccountController.php**
   - Handles account profile updates
   - Validates data
   - Updates accounts table

2. **backend/app/Http/Controllers/Api/AuthController.php**
   - Returns user_type in /me endpoint
   - Handles both Account and User

3. **backend/routes/api.php**
   - Routes for account profile
   - Protected with auth:sanctum

## Common Issues Fixed

### Issue 1: "Not an account user" error
**Cause:** Trying to use account endpoint for staff user
**Fix:** profileService automatically detects and uses correct endpoint

### Issue 2: Logout on profile update
**Cause:** API error triggering logout
**Fix:** Only logout on authentication errors, not data errors

### Issue 3: Logout on page refresh
**Cause:** /api/me failing or returning wrong format
**Fix:** Ensured /api/me works for both user types with user_type field

### Issue 4: Role field error for Account users
**Cause:** Accounts don't have roles
**Fix:** Removed role selector from EditProfileModal

## Status

✅ Profile service created
✅ EditProfileModal updated
✅ Logging added for debugging
✅ API interceptor fixed
✅ UserContext error handling improved
✅ Works for both Account and User
✅ No more automatic logout

## Try It Now!

1. **Login** (as either Account or Staff)
2. **Click "Edit Profile"** in sidebar
3. **Update your info**
4. **Click "Save Changes"**
5. **Check browser console** (F12) for logs
6. ✅ Should update successfully
7. ✅ Should stay logged in!

If you see any errors, check the browser console - the logs will show exactly what's happening!
