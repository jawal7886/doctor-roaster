# Complete Testing Guide for All Fixes

## Prerequisites
1. Backend server running: `php artisan serve` (in backend folder)
2. Frontend server running: `npm run dev` (in root folder)
3. Clear browser cache and localStorage before testing

## Test 1: New Account Registration & Immediate Login

### Steps:
1. Open browser to `http://localhost:5173/signup`
2. Register a new account:
   - Name: Test User
   - Email: testuser@example.com
   - Password: password123
   - Confirm Password: password123
   - Phone: 1234567890
3. Click "Sign Up"
4. Should redirect to login page
5. Login with the same credentials:
   - Email: testuser@example.com
   - Password: password123
6. Click "Sign In"

### Expected Result:
✅ Login should succeed without "Invalid credentials" error
✅ Should redirect to dashboard
✅ User info should appear in sidebar

### If it fails:
- Check browser console for errors
- Check Network tab for API responses
- Look for token in localStorage (key: `auth_token`)

---

## Test 2: Page Refresh Persistence

### Steps:
1. Login to the system (use any valid account)
2. Navigate to any page (e.g., Users, Departments)
3. Press F5 or Ctrl+R to refresh the page
4. Wait for page to reload

### Expected Result:
✅ Should remain logged in
✅ User info should still appear in sidebar
✅ Current page should reload with data

### If it fails:
- Check browser console for `[UserContext]` logs
- Check if token is still in localStorage after refresh
- Look for 401 errors in Network tab

---

## Test 3: Profile Update Without Logout

### Steps:
1. Login to the system
2. Click on user avatar/name in sidebar
3. Click "Edit Profile" or navigate to profile settings
4. Update your information:
   - Change name to "Updated Name"
   - Change phone to "9876543210"
5. Click "Save" or "Update Profile"

### Expected Result:
✅ Profile should update successfully
✅ Should show success message
✅ Should NOT logout
✅ Updated info should appear in sidebar immediately

### If it fails:
- Check browser console for errors
- Check Network tab for the PUT request to `/api/account/profile` or `/api/users/{id}`
- Look for 401 or 403 errors

---

## Test 4: Data Loading from APIs

### Steps:
1. Login to the system
2. Navigate to Users page
3. Wait for data to load
4. Navigate to Departments page
5. Wait for data to load
6. Open browser console (F12)

### Expected Result:
✅ Users page should show list of users (not empty)
✅ Departments page should show list of departments (not empty)
✅ Console should show logs like:
   - `[userService] Fetching users from: /users`
   - `[userService] Users fetched successfully: X users`
   - `[departmentService] Fetching departments...`
   - `[departmentService] Departments fetched successfully: X departments`

### If it fails:
- Check console for `[userService]` or `[departmentService]` error logs
- Check Network tab for API responses
- Verify backend has seeded data: `php artisan db:seed`

---

## Test 5: Token Validation

### Steps:
1. Login to the system
2. Open browser DevTools (F12)
3. Go to Application tab > Local Storage
4. Find `auth_token` key
5. Copy the token value
6. Go to Network tab
7. Navigate to any page (e.g., Users)
8. Find the API request (e.g., GET /api/users)
9. Check Request Headers

### Expected Result:
✅ Request should have `Authorization: Bearer {token}` header
✅ Token should match the one in localStorage
✅ Response should be 200 OK with data

---

## Debugging Tips

### Check Backend Logs
```bash
cd backend
tail -f storage/logs/laravel.log
```

### Check Frontend Console
Look for these log prefixes:
- `[UserContext]` - Authentication state management
- `[userService]` - User API calls
- `[departmentService]` - Department API calls
- `API Error:` - API request failures

### Common Issues

**Issue**: "Unauthenticated" error
**Solution**: 
- Clear browser localStorage
- Logout and login again
- Check if token exists in localStorage
- Verify backend middleware is working

**Issue**: Empty data on pages
**Solution**:
- Check console for error logs
- Verify backend has data: `php artisan tinker` then `User::count()`
- Check Network tab for API responses
- Seed database if empty: `php artisan db:seed`

**Issue**: Profile update fails
**Solution**:
- Check if you're logged in as Account or User
- Verify the correct endpoint is being called
- Check backend logs for validation errors

---

## Quick Reset

If you need to start fresh:

```bash
# Backend
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Frontend - Clear browser
# 1. Open DevTools (F12)
# 2. Application tab > Local Storage > Clear All
# 3. Hard refresh: Ctrl+Shift+R
```
