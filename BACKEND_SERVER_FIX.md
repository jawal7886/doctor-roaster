# Backend Server Fix - CRITICAL

## Problem Identified

The issue is that **the Laravel backend server is not running**. Here's what's happening:

1. **Port 8080** → Running Vite frontend (React app)
2. **Port 8000** → Nothing running (Laravel backend should be here)
3. Frontend is trying to call `http://192.168.100.145:8080/api/*` which returns the React app, not API responses

## Solution

### Step 1: Start the Laravel Backend Server

Open a **NEW terminal window** and run:

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

Or simply double-click the `start-backend.bat` file in the root directory.

You should see:
```
INFO  Server running on [http://0.0.0.0:8000].
Press Ctrl+C to stop the server
```

**IMPORTANT:** Keep this terminal window open. The backend server must stay running.

### Step 2: Verify Backend is Working

Open your browser and go to:
```
http://192.168.100.145:8000/api/health
```

You should see a JSON response like:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-19 08:00:00"
}
```

If you see this, the backend is working correctly!

### Step 3: Test the Frontend

1. Make sure the frontend is still running on port 8080
2. Go to `http://192.168.100.145:8080` (or `http://localhost:5173`)
3. Try to register a new account
4. Try to login

Everything should work now!

## What I Fixed

✅ Updated `src/lib/api.ts` to point to the correct backend URL:
   - Changed from: `http://192.168.100.145:8080/api`
   - Changed to: `http://192.168.100.145:8000/api`

✅ Created `start-backend.bat` script for easy backend startup

## Running Both Servers

You need TWO servers running simultaneously:

### Terminal 1: Frontend (Vite)
```bash
npm run dev
```
Runs on: `http://192.168.100.145:8080` or `http://localhost:5173`

### Terminal 2: Backend (Laravel)
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```
Runs on: `http://192.168.100.145:8000`

## Quick Test Checklist

After starting both servers:

### Test 1: Backend Health Check
```bash
curl http://192.168.100.145:8000/api/health
```
Expected: JSON response with "API is running"

### Test 2: Registration
1. Go to frontend: `http://192.168.100.145:8080/signup`
2. Fill in the form
3. Click "Create Account"
4. Should redirect to dashboard

### Test 3: Login
1. Go to: `http://192.168.100.145:8080/login`
2. Enter credentials
3. Click "Sign In"
4. Should redirect to dashboard with data

### Test 4: Dashboard Data
1. Dashboard should show:
   - Doctor count
   - Department count
   - Today's schedule
   - Recent activity

### Test 5: Profile Update
1. Click "Edit Profile" in sidebar
2. Update your information
3. Click "Save Changes"
4. Should show success message
5. Should NOT logout

## Troubleshooting

### Issue: "Connection refused" or "Network error"
**Cause:** Backend server not running
**Fix:** Start the backend server (see Step 1)

### Issue: Still getting 404 on API calls
**Cause:** Frontend still pointing to wrong URL
**Fix:** Clear browser cache and reload (Ctrl+Shift+R)

### Issue: "CORS error"
**Cause:** Backend CORS not configured
**Fix:** Already configured in `backend/config/cors.php`, just restart backend

### Issue: "Unauthenticated" after login
**Cause:** Token not being saved or sent
**Fix:** Check browser console for errors, verify token in localStorage

## Port Summary

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 8080 or 5173 | http://192.168.100.145:8080 |
| Backend (Laravel) | 8000 | http://192.168.100.145:8000 |
| Frontend API calls | → | http://192.168.100.145:8000/api |

## Next Steps

1. **Start the backend server** using the command above
2. **Verify it's working** by visiting the health check URL
3. **Test registration and login** from the frontend
4. **Everything should work now!**

The authentication system, profile updates, and data loading will all work once the backend server is running on the correct port.
