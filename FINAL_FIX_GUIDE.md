# Complete Authentication & Data Loading Fix

## Current Issues
1. Profile update fails with "Failed to update profile"
2. Dashboard shows no data (all zeros)
3. API returns 404 for `/api/*` routes

## Root Cause
The server at `http://192.168.100.145:8080` is not properly configured to serve Laravel API routes.

## Solution

### Step 1: Verify Backend Server
Make sure your Laravel backend is running properly:

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8080
```

This will start the server accessible from your network.

### Step 2: Test API Endpoint
Open browser and go to:
```
http://192.168.100.145:8080/api/login
```

You should see a JSON response (even if it's an error about missing credentials).

If you see 404, the API routes aren't working.

### Step 3: Check .htaccess (if using Apache)
If you're using Apache, make sure `.htaccess` exists in `backend/public/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

### Step 4: Check nginx config (if using nginx)
If using nginx, your config should have:

```nginx
location /api {
    try_files $uri $uri/ /index.php?$query_string;
}
```

### Step 5: Update Frontend API URL
I've already updated `src/lib/api.ts` to use:
```
http://192.168.100.145:8080/api
```

### Step 6: Clear All Caches
```bash
cd backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan optimize:clear
```

### Step 7: Verify Routes Exist
```bash
cd backend
php artisan route:list | findstr api
```

You should see routes like:
- POST api/login
- POST api/register
- GET api/me
- etc.

## Quick Test

### Test 1: Check if backend is accessible
Open browser: `http://192.168.100.145:8080`
- Should show Laravel welcome page or your app

### Test 2: Check if API routes work
Open browser: `http://192.168.100.145:8080/api/login`
- Should show JSON response (not 404)

### Test 3: Test login via PowerShell
```powershell
$body = @{
    email = 'test@example.com'
    password = 'password123'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://192.168.100.145:8080/api/login' `
    -Method POST `
    -Body $body `
    -ContentType 'application/json'
```

Should return user data and token (or validation error if credentials wrong).

## If Still Getting 404

### Option A: Use Laravel's built-in server
```bash
cd backend
php artisan serve --host=192.168.100.145 --port=8080
```

### Option B: Check your web server configuration
If using Apache/nginx, make sure:
1. Document root points to `backend/public`
2. mod_rewrite is enabled (Apache)
3. URL rewriting is configured

### Option C: Use localhost
If the network server isn't working, use localhost:

1. Update `src/lib/api.ts`:
```typescript
baseURL: 'http://localhost:8000/api',
```

2. Start backend:
```bash
cd backend
php artisan serve
```

3. Access frontend at: `http://localhost:5173`

## Expected Behavior After Fix

### Login:
1. Enter credentials
2. Click "Sign In"
3. ✅ Should redirect to dashboard
4. ✅ Should see user name in sidebar
5. ✅ Should see data loading

### Dashboard:
1. ✅ Should show doctor count
2. ✅ Should show department count
3. ✅ Should show today's schedule
4. ✅ Should show recent activity

### Profile Update:
1. Click "Edit Profile"
2. Update information
3. Click "Save Changes"
4. ✅ Should show success message
5. ✅ Should stay logged in
6. ✅ Should see updated info

## Debug Steps

### 1. Check Backend Logs
```bash
cd backend
Get-Content storage/logs/laravel.log -Tail 50
```

### 2. Check Browser Console
- Press F12
- Go to Console tab
- Look for errors
- Check Network tab for failed requests

### 3. Check Network Requests
- Press F12
- Go to Network tab
- Try to login
- Click on failed request
- Check:
  - Request URL
  - Request Headers
  - Response

### 4. Verify Token
After login, check localStorage:
```javascript
// In browser console:
localStorage.getItem('auth_token')
```

Should show a token like: `14|abc123...`

## Common Issues

### Issue 1: 404 on all API routes
**Cause:** Web server not configured correctly
**Fix:** Use `php artisan serve` or fix web server config

### Issue 2: 401 Unauthenticated
**Cause:** Token not being sent or not valid
**Fix:** Check Authorization header in Network tab

### Issue 3: CORS errors
**Cause:** Backend not allowing frontend origin
**Fix:** Already configured in `backend/config/cors.php`

### Issue 4: Data not loading
**Cause:** Authentication failing, so API calls return 401
**Fix:** Fix authentication first, then data will load

## Status

✅ Frontend API URL updated to match your server
✅ Sanctum configuration fixed
✅ Exception handling fixed
✅ Caches cleared

❌ Need to verify backend is serving API routes correctly
❌ Need to test authentication works

## Next Steps

1. **Verify backend is running** on `http://192.168.100.145:8080`
2. **Test API endpoint** - visit `http://192.168.100.145:8080/api/login` in browser
3. **If 404:** Backend routes not working - use `php artisan serve`
4. **If working:** Try login again from frontend
5. **Check browser console** for any errors

The main issue is that the API routes are returning 404, which means the backend isn't configured correctly for that server. Once the backend is serving the API routes properly, everything else should work!
