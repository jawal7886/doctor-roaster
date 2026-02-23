# 🔧 Troubleshooting Guide

## Quick Diagnostics

### Check 1: Is Backend Running?

Run:
```bash
curl http://192.168.100.145:8000/api/health
```

**If you see JSON response** → Backend is running ✅
**If you see error** → Backend is NOT running ❌

### Check 2: Is Frontend Running?

Open browser: http://192.168.100.145:8080

**If you see the app** → Frontend is running ✅
**If you see error** → Frontend is NOT running ❌

### Check 3: Are Ports Correct?

Run:
```bash
netstat -ano | findstr :8000
netstat -ano | findstr :8080
```

**Expected:**
- Port 8000: Backend (Laravel)
- Port 8080: Frontend (Vite)

## Common Problems & Solutions

### Problem 1: "Connection refused" or "Network error"

**Symptoms:**
- Can't register
- Can't login
- Dashboard shows no data

**Cause:** Backend server is not running

**Solution:**
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

Keep the terminal open!

---

### Problem 2: "404 Not Found" on API calls

**Symptoms:**
- API calls return HTML instead of JSON
- Browser console shows 404 errors

**Cause:** Backend is not running or running on wrong port

**Solution:**
1. Stop any server on port 8080
2. Start backend on port 8000:
   ```bash
   cd backend
   php artisan serve --host=0.0.0.0 --port=8000
   ```

---

### Problem 3: Still logging out automatically

**Symptoms:**
- Logout after profile update
- Logout after page refresh
- Logout on any error

**Cause:** Browser cache has old code

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Or use incognito mode

---

### Problem 4: "CORS error"

**Symptoms:**
- Console shows CORS policy error
- Requests blocked by browser

**Cause:** Backend CORS not configured (already fixed)

**Solution:**
1. Restart backend server
2. Clear browser cache
3. Verify `backend/config/cors.php` has:
   ```php
   'allowed_origins' => ['*'],
   ```

---

### Problem 5: "Unauthenticated" after login

**Symptoms:**
- Login succeeds but immediately logs out
- Token not being saved

**Cause:** Token not being stored or sent

**Solution:**
1. Open browser console (F12)
2. Go to Application tab → Local Storage
3. Check if `auth_token` exists after login
4. If not, check Network tab for login response
5. Verify response has `token` field

---

### Problem 6: Data not loading (zeros everywhere)

**Symptoms:**
- Dashboard shows 0 for all stats
- No departments, users, schedules

**Cause:** Backend not running or database empty

**Solution:**
1. Verify backend is running
2. Check database has data:
   ```bash
   cd backend
   php artisan tinker
   >>> \App\Models\User::count()
   >>> \App\Models\Department::count()
   ```
3. If empty, run seeders:
   ```bash
   php artisan db:seed
   ```

---

### Problem 7: "Failed to create account"

**Symptoms:**
- Registration fails
- Error message on signup

**Cause:** Backend not running or validation error

**Solution:**
1. Verify backend is running
2. Check browser console for error details
3. Check backend logs:
   ```bash
   cd backend
   Get-Content storage/logs/laravel.log -Tail 50
   ```
4. Verify password is at least 8 characters

---

### Problem 8: Profile update fails

**Symptoms:**
- "Failed to update profile" error
- Changes not saved

**Cause:** Backend not running or validation error

**Solution:**
1. Verify backend is running
2. Check browser console for error
3. Check Network tab for request details
4. Verify token is being sent in Authorization header

---

## Advanced Diagnostics

### Check Laravel Logs

```bash
cd backend
Get-Content storage/logs/laravel.log -Tail 50
```

Look for errors or exceptions.

### Check Browser Console

1. Press F12
2. Go to Console tab
3. Look for red errors
4. Check what API calls are failing

### Check Network Requests

1. Press F12
2. Go to Network tab
3. Try to login or register
4. Click on failed request
5. Check:
   - Request URL (should be port 8000)
   - Request Headers (should have Authorization)
   - Response (check error message)

### Verify Token

After login, check localStorage:

1. Press F12
2. Go to Application tab
3. Expand Local Storage
4. Click on your domain
5. Look for `auth_token`
6. Should be like: `14|abc123...`

### Test API Directly

Test login with curl:

```bash
curl -X POST http://192.168.100.145:8000/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Should return user data and token.

### Verify Routes

```bash
cd backend
php artisan route:list --path=api
```

Should show 57 routes including:
- POST api/login
- POST api/register
- GET api/me
- etc.

### Clear All Caches

```bash
cd backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

Then restart backend server.

## Port Conflicts

### Check What's Using Port 8000

```bash
netstat -ano | findstr :8000
```

If something else is using it:

**Option 1:** Stop that process
**Option 2:** Use different port:
```bash
php artisan serve --host=0.0.0.0 --port=8001
```

Then update `src/lib/api.ts`:
```typescript
baseURL: 'http://192.168.100.145:8001/api'
```

### Check What's Using Port 8080

```bash
netstat -ano | findstr :8080
```

Should be Vite (frontend). If not:

**Option 1:** Stop that process
**Option 2:** Use different port:
```bash
npm run dev -- --port 5173
```

## Database Issues

### Check Database Connection

```bash
cd backend
php artisan tinker
>>> DB::connection()->getPdo();
```

Should connect without error.

### Check Tables Exist

```bash
php artisan tinker
>>> Schema::hasTable('users')
>>> Schema::hasTable('accounts')
>>> Schema::hasTable('personal_access_tokens')
```

All should return `true`.

### Run Migrations

If tables don't exist:

```bash
cd backend
php artisan migrate
```

### Seed Database

If no data:

```bash
cd backend
php artisan db:seed
```

## Still Not Working?

### 1. Restart Everything

```bash
# Stop all servers (Ctrl+C in terminals)

# Clear all caches
cd backend
php artisan optimize:clear

# Start backend
php artisan serve --host=0.0.0.0 --port=8000

# In another terminal, start frontend
npm run dev
```

### 2. Check Environment

Verify `backend/.env`:
```
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dr_roaster
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Verify Dependencies

```bash
# Backend
cd backend
composer install

# Frontend
npm install
```

### 4. Check PHP Version

```bash
php -v
```

Should be PHP 8.1 or higher.

### 5. Check MySQL

```bash
mysql -u root -p
```

Should connect to MySQL.

## Getting Help

If still having issues, provide:

1. Error message from browser console
2. Error from backend logs
3. Network request details (URL, headers, response)
4. Output of health check: `curl http://192.168.100.145:8000/api/health`
5. Output of route list: `php artisan route:list --path=api`

## Summary

Most issues are caused by:
1. Backend not running (90% of cases)
2. Wrong port configuration
3. Browser cache
4. Database not seeded

The solution is usually:
1. Start backend on port 8000
2. Clear browser cache
3. Test health endpoint
4. Try again

**Remember: Backend MUST be running on port 8000 for the app to work!**
