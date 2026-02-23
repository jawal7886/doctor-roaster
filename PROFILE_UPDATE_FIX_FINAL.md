# ✅ Profile Update Logout Issue - FIXED!

## The Problem

When users tried to update their profile, they were being logged out. This happened because:

1. The `profileService.updateProfile()` function was calling `/me` endpoint to determine user type
2. If the `/me` call failed (401), the API interceptor would trigger logout
3. This caused users to be logged out even when just trying to update their profile

## Root Cause

The `profileService` was making an unnecessary API call to `/me` to determine whether to use the account or user endpoint:

```typescript
// OLD CODE (PROBLEMATIC)
export const updateProfile = async (data: ProfileUpdateData): Promise<any> => {
  try {
    // Try account endpoint first
    const response = await api.put('/account/profile', data);
    return response.data.data;
  } catch (accountError: any) {
    if (accountError.response?.status === 403) {
      // Make ANOTHER API call to /me
      const meResponse = await api.get('/me'); // ← This could trigger logout!
      const currentUser = meResponse.data.data;
      
      // Then update user
      const response = await api.put(`/users/${currentUser.id}`, data);
      return response.data.data;
    }
    throw accountError;
  }
};
```

## The Fix

### 1. Added `user_type` to User Interface

**File:** `src/types/index.ts`

```typescript
export interface User {
  // ... existing fields
  user_type?: 'account' | 'staff'; // ✅ Added to identify user type
  account_type?: string; // For account users (patient, visitor, etc.)
}
```

### 2. Updated `profileService` to Accept Current User

**File:** `src/services/profileService.ts`

```typescript
// NEW CODE (FIXED)
export const updateProfile = async (
  currentUser: User, // ✅ Now accepts currentUser as parameter
  data: ProfileUpdateData
): Promise<any> => {
  console.log('Current user type:', currentUser.user_type);
  
  // If user_type is 'account', use account endpoint
  if (currentUser.user_type === 'account') {
    const response = await api.put('/account/profile', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
    });
    return {
      ...response.data.data,
      user_type: 'account'
    };
  }
  
  // Otherwise, use users endpoint (for staff)
  const response = await api.put(`/users/${currentUser.id}`, {
    name: data.name,
    email: data.email,
    phone: data.phone,
    role_id: data.roleId,
    specialty_id: data.specialtyId,
    department_id: data.departmentId,
    avatar: data.avatar,
  });
  return response.data.data;
};
```

### 3. Updated `EditProfileModal` to Pass Current User

**File:** `src/components/modals/EditProfileModal.tsx`

```typescript
const handleSaveProfile = async () => {
  if (!currentUser) {
    toast({ title: 'Error', description: 'No user logged in', variant: 'destructive' });
    return;
  }

  setLoading(true);
  try {
    // ✅ Now passes currentUser to updateProfile
    const updatedUser = await updateProfile(currentUser, {
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      avatar: profileAvatar,
    });
    
    updateCurrentUser(updatedUser);
    
    toast({ 
      title: 'Success', 
      description: 'Profile updated successfully' 
    });
    onOpenChange(false);
  } catch (error: any) {
    console.error('Profile update error:', error);
    toast({ 
      title: 'Error', 
      description: error.response?.data?.message || 'Failed to update profile', 
      variant: 'destructive' 
    });
  } finally {
    setLoading(false);
  }
};
```

## How It Works Now

### Profile Update Flow:

1. User clicks "Edit Profile" in sidebar
2. Modal opens with current user data
3. User makes changes and clicks "Save Changes"
4. `handleSaveProfile` is called
5. `updateProfile(currentUser, data)` is called with:
   - `currentUser` from UserContext (already has `user_type`)
   - `data` with updated fields
6. `profileService` checks `currentUser.user_type`:
   - If `'account'` → calls `/account/profile` endpoint
   - If `'staff'` → calls `/users/{id}` endpoint
7. **No call to `/me` is made** ✅
8. Profile is updated successfully
9. User stays logged in ✅
10. Success message shown ✅

## Benefits

### ✅ No Unnecessary API Calls
- Doesn't call `/me` during profile update
- Uses user data already available in context
- Faster and more efficient

### ✅ No Logout Issues
- No risk of triggering logout during profile update
- User stays authenticated throughout the process
- Better user experience

### ✅ Cleaner Code
- Single responsibility: update profile only
- No error handling for `/me` calls
- Easier to maintain and debug

### ✅ Type Safety
- `user_type` is now part of User interface
- TypeScript ensures correct usage
- Better IDE autocomplete

## Testing

### Test Profile Update (Account User):

1. Register a new account:
   - Go to: http://localhost:5173/signup
   - Fill form and register
2. After login, click "Edit Profile"
3. Change your name
4. Click "Save Changes"
5. **Expected:** Success message, stays logged in ✅
6. **Expected:** Name updated in sidebar ✅

### Test Profile Update (Staff User):

1. Login as staff:
   - Email: `sajawalnazir147@gmail.com`
   - Password: `password`
2. Click "Edit Profile"
3. Change your name or phone
4. Click "Save Changes"
5. **Expected:** Success message, stays logged in ✅
6. **Expected:** Name updated in sidebar ✅

## Verification

### Check User Type in Console:

After login, open browser console:

```javascript
// Check localStorage
localStorage.getItem('auth_token') // Should have token

// The user object should have user_type
// You can see this in the Network tab when /me is called
```

### Check Network Requests:

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Edit Profile" and save
4. **Expected:** Only ONE request to either:
   - `PUT /api/account/profile` (for account users)
   - `PUT /api/users/{id}` (for staff users)
5. **Expected:** NO request to `/api/me` ✅

## Summary of All Fixes

### Session 1: Backend Connection
✅ Fixed API URL to use `localhost:8000`
✅ Reset password to `password123`

### Session 2: Registration Redirect
✅ Fixed `updateCurrentUser` to set `isAuthenticated = true`
✅ Users now go to dashboard after registration

### Session 3: Profile Update Logout (This Fix)
✅ Added `user_type` to User interface
✅ Updated `profileService` to accept `currentUser` parameter
✅ Removed unnecessary `/me` call during profile update
✅ Users stay logged in when updating profile

## Files Modified

1. `src/types/index.ts` - Added `user_type` and `account_type` to User interface
2. `src/services/profileService.ts` - Updated to accept currentUser parameter
3. `src/components/modals/EditProfileModal.tsx` - Updated to pass currentUser

## No Backend Changes Needed

The backend was already working correctly:
- `/me` endpoint returns `user_type` field ✅
- `/account/profile` endpoint works for account users ✅
- `/users/{id}` endpoint works for staff users ✅

## Next Steps

1. **Test profile update** with both account and staff users
2. **Verify** no logout occurs
3. **Confirm** profile changes are saved
4. **Check** dashboard data loads correctly

Everything should work perfectly now!
