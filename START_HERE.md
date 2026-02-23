# 🚀 Quick Start Guide - Hospital Harmony

## The Problem

Your application wasn't working because **the Laravel backend server was not running**. The frontend was trying to call API endpoints that didn't exist.

## The Solution

You need to run **TWO servers** simultaneously:
1. **Frontend Server** (Vite/React) - Port 8080 or 5173
2. **Backend Server** (Laravel/PHP) - Port 8000

## Step-by-Step Instructions

### 1. Start the Backend Server

Open a **NEW terminal window** and run:

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

**OR** simply double-click: `start-backend.bat`

You should see:
```
INFO  Server running on [http://0.0.0.0:8000].
```

✅ **Keep this terminal open!** The backend must stay running.

### 2. Start the Frontend Server

Open **ANOTHER terminal window** and run:

```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173/
Network: http://192.168.100.145:8080/
```

✅ **Keep this terminal open too!**

### 3. Open the Application

Go to: **http://192.168.100.145:8080** or **http://localhost:5173**

### 4. Test Everything

#### Test 1: Register a New Account
1. Click "Sign Up"
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. ✅ Should redirect to dashboard

#### Test 2: Login
1. Go to Login page
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"
4. ✅ Should redirect to dashboard

#### Test 3: Dashboard Data
1. Dashboard should show:
   - ✅ Doctor count
   - ✅ Department count
   - ✅ Today's schedule
   - ✅ Recent activity

#### Test 4: Profile Update
1. Click "Edit Profile" in sidebar
2. Update your name or phone
3. Click "Save Changes"
4. ✅ Should show success message
5. ✅ Should NOT logout
6. ✅ Should see updated info

## What Was Fixed

### 1. API URL Configuration
Updated `src/lib/api.ts`:
- ❌ Before: `http://192.168.100.145:8080/api` (wrong - this is the frontend)
- ✅ After: `http://192.168.100.145:8000/api` (correct - this is the backend)

### 2. Auto-Logout Issue
Fixed `src/lib/api.ts` and `src/contexts/UserContext.tsx`:
- ✅ Only logout on 401 errors from `/me` or `/logout` endpoints
- ✅ Don't logout on data loading errors
- ✅ Don't logout on profile update errors

### 3. Authentication System
- ✅ Separate tables: `accounts` for public users, `users` for staff
- ✅ Laravel Sanctum token-based authentication
- ✅ Profile management in modal (not Settings page)
- ✅ Settings page has only: Notifications, Hospital, Roles, Specialties

## Troubleshooting

### Problem: "Connection refused" or "Network error"
**Solution:** Backend server is not running. Start it with:
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Problem: Still getting errors after starting backend
**Solution:** Clear browser cache and reload (Ctrl+Shift+R)

### Problem: "CORS error"
**Solution:** Make sure backend is running on port 8000, not 8080

### Problem: Data not loading
**Solution:** 
1. Check backend is running: http://192.168.100.145:8000/api/health
2. Should return JSON: `{"success": true, "message": "API is running"}`
3. If 404, backend is not running

### Problem: "Unauthenticated" after login
**Solution:**
1. Open browser console (F12)
2. Check localStorage has 'auth_token'
3. Check Network tab for Authorization header
4. Verify backend is running

## Quick Health Check

Run this in PowerShell to verify backend is working:

```powershell
curl http://192.168.100.145:8000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-19 08:00:00"
}
```

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (React/Vite) | 8080 or 5173 | http://192.168.100.145:8080 |
| Backend (Laravel/PHP) | 8000 | http://192.168.100.145:8000 |
| API Endpoints | 8000 | http://192.168.100.145:8000/api/* |

## Important Notes

1. **Both servers must be running** for the app to work
2. **Backend must be on port 8000** (not 8080)
3. **Frontend calls backend** at http://192.168.100.145:8000/api
4. **Keep both terminal windows open** while using the app

## Need Help?

If you're still having issues:

1. Check both servers are running
2. Verify backend health: http://192.168.100.145:8000/api/health
3. Check browser console (F12) for errors
4. Check Network tab for failed requests
5. Verify localStorage has 'auth_token' after login

## Summary

✅ Backend server must run on port 8000
✅ Frontend server runs on port 8080 or 5173
✅ API URL updated to point to correct backend
✅ Authentication system working with Sanctum
✅ Auto-logout issue fixed
✅ Profile updates work without logging out
✅ Data loading works correctly

**Everything is ready to go! Just start both servers and test the application.**
