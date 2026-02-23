# Registration Error Debug Guide

## Current Status

### Backend Status: ✅ WORKING
- Laravel backend is running on port 8000
- Database connection is working (MySQL: dr_roaster)
- Users table exists with correct structure
- personal_access_tokens table exists
- Laravel Sanctum is installed and configured
- API endpoint `/api/register` is working correctly

### Test Result:
```bash
POST http://localhost:8000/api/register
Body: {
  "name": "Test User",
  "email": "test123@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "1234567890"
}

Response: 200 OK
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {...},
    "token": "1|..."
  }
}
```

## Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for API requests
- Look for the POST request to `/api/register`
- Check the response status and body

### 2. Check Network Request
In Network tab, find the register request and check:
- Request URL: Should be `http://localhost:8000/api/register`
- Request Method: Should be POST
- Request Headers: Should include `Content-Type: application/json`
- Request Payload: Should include all form fields
- Response Status: Should be 200 or 201
- Response Body: Should contain success message and token

### 3. Common Issues and Solutions

#### Issue 1: CORS Error
**Symptoms:** Error in console about CORS policy
**Solution:** Already configured in `backend/config/cors.php`
```php
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

#### Issue 2: 422 Validation Error
**Symptoms:** "Validation failed" message
**Possible Causes:**
- Password too short (minimum 6 characters)
- Passwords don't match
- Email already exists
- Missing required fields

**Check:** Look at `error.response.data.errors` in console

#### Issue 3: 500 Server Error
**Symptoms:** "Internal Server Error"
**Solution:** Check Laravel logs
```bash
cd backend
Get-Content storage/logs/laravel.log -Tail 50
```

#### Issue 4: Network Error
**Symptoms:** "Network Error" or "Failed to fetch"
**Possible Causes:**
- Backend server not running
- Wrong API URL
- Firewall blocking connection

**Solution:** Verify backend is running:
```bash
netstat -ano | findstr :8000
```

### 4. Test Registration Manually

#### Using Browser DevTools Console:
```javascript
// Open browser console (F12) and run:
fetch('http://localhost:8000/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    password_confirmation: 'password123',
    phone: '1234567890'
  })
})
.then(r => r.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

#### Using PowerShell:
```powershell
$body = @{
  name='Test User'
  email='test@example.com'
  password='password123'
  password_confirmation='password123'
  phone='1234567890'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:8000/api/register' -Method POST -Body $body -ContentType 'application/json'
```

### 5. Check Frontend Code

#### Verify API Base URL:
File: `src/lib/api.ts`
```typescript
baseURL: 'http://localhost:8000/api',  // Should match backend URL
```

#### Verify Form Data:
File: `src/pages/SignupPage.tsx`
Check that formData includes:
- name
- email
- password
- password_confirmation
- phone (optional)

### 6. Enable Debug Logging

I've added console.log statements to `src/services/authService.ts`:
- Logs request data (with passwords hidden)
- Logs response data
- Logs errors with full details

Check browser console for these logs when you try to register.

## Quick Fix Checklist

- [ ] Backend server is running (`php artisan serve`)
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] Browser console is open (F12)
- [ ] Network tab is recording
- [ ] Try registration again
- [ ] Check console for error logs
- [ ] Check network tab for request/response
- [ ] Copy error message from console
- [ ] Check Laravel logs if 500 error

## Expected Flow

1. User fills registration form
2. Clicks "Sign Up" button
3. Frontend sends POST to `/api/register`
4. Backend validates data
5. Backend creates user in database
6. Backend generates Sanctum token
7. Backend returns user data + token
8. Frontend stores token in localStorage
9. Frontend refreshes user context
10. Frontend redirects to dashboard

## If Still Not Working

### Get Exact Error:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Try to register
5. Copy ALL error messages
6. Go to Network tab
7. Find the "register" request
8. Click on it
9. Check "Response" tab
10. Copy the response

### Check Backend Logs:
```bash
cd backend
Get-Content storage/logs/laravel.log -Tail 100
```

### Verify Database:
```bash
cd backend
php artisan tinker --execute="echo User::count();"
```

## Success Indicators

When registration works, you should see:
1. ✅ Console log: "Registering user with data: {...}"
2. ✅ Console log: "Registration response: {...}"
3. ✅ Network request: Status 200/201
4. ✅ Toast notification: "Account created successfully"
5. ✅ Redirect to dashboard
6. ✅ User info in sidebar

## Contact Information

If you're still seeing "Validation failed" error:
1. Open browser console (F12)
2. Look for red error messages
3. Copy the exact error text
4. Check what the actual validation error is
5. The error should show which field is failing validation

The backend is working correctly, so the issue is likely:
- Form data not being sent correctly
- Password confirmation not matching
- Email format invalid
- Or a frontend JavaScript error

Check the browser console for the exact error!
