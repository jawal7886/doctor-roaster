# 🔄 Page Refresh Logout Issue - Debugging Guide

## The Problem

When you refresh the page, you get logged out and redirected to the login page.

## What Should Happen

1. User logs in → Token stored in localStorage
2. User refreshes page → UserContext reads token from localStorage
3. UserContext calls `/me` endpoint with token
4. Backend validates token and returns user data
5. User stays logged in ✅

## What's Actually Happening

1. User logs in → Token stored in localStorage
2. User refreshes page → UserContext reads token
3. UserContext calls `/me` endpoint
4. Something fails → User gets logged out ❌

## Backend Verification

I tested the backend and it's working correctly:

```
✓ Login successful - Token generated
✓ /me endpoint works with token
✓ Token persists across multiple calls
✓ Backend is NOT the problem
```

## Frontend Debugging Steps

### Step 1: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Refresh the page
4. Look for these log messages:

```
[UserContext] refreshUser called
[UserContext] Token from localStorage: ...
[UserContext] Calling /me endpoint...
```

**What to look for:**
- Is the token present?
- Does the `/me` call succeed or fail?
- What error is returned?

### Step 2: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for the `/me` request

**Check:**
- Status code (should be 200, not 401)
- Request headers (Authorization header present?)
- Response (user data or error?)

### Step 3: Check localStorage

1. Open DevTools (F12)
2. Go to Application tab
3. Expand "Local Storage"
4. Click on your domain
5. Look for `auth_token`

**Check:**
- Is the token present after login?
- Is it still there after refresh?
- Does it get cleared?

## Common Causes

### Cause 1: Token Not Being Saved

**Symptom:** No token in localStorage after login

**Fix:** Check if login is calling `localStorage.setItem('auth_token', token)`

### Cause 2: Token Being Cleared on Refresh

**Symptom:** Token disappears from localStorage on refresh

**Fix:** Check if any code is calling `localStorage.clear()` or `localStorage.removeItem('auth_token')`

### Cause 3: /me Endpoint Returning 401

**Symptom:** Token exists but `/me` returns 401

**Possible reasons:**
- Token format is wrong
- Authorization header not being sent
- Backend not recognizing the token

**Fix:** Check the Authorization header in Network tab

### Cause 4: CORS Issues

**Symptom:** `/me` request fails with CORS error

**Fix:** Backend CORS is already configured, but check if the request is being blocked

### Cause 5: API Base URL Mismatch

**Symptom:** `/me` request goes to wrong URL

**Fix:** Verify `src/lib/api.ts` has `baseURL: 'http://localhost:8000/api'`

## Debugging Code

Add this to your browser console after refresh:

```javascript
// Check if token exists
const token = localStorage.getItem('auth_token');
console.log('Token:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');

// Try calling /me manually
if (token) {
  fetch('http://localhost:8000/api/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })
  .then(r => r.json())
  .then(data => console.log('/me response:', data))
  .catch(err => console.error('/me error:', err));
}
```

## Temporary Workaround

If you need to keep working while debugging:

1. **Don't refresh the page** - Navigate using the sidebar instead
2. **Use browser back/forward** - This doesn't trigger a full refresh
3. **Keep DevTools open** - This helps you see what's happening

## Potential Fixes

### Fix 1: Add Error Handling to refreshUser

The current code might be clearing auth on non-401 errors. Update `UserContext.tsx`:

```typescript
const refreshUser = async () => {
  const token = authService.getToken();
  if (!token) {
    setLoading(false);
    setIsAuthenticated(false);
    return;
  }

  try {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    
    // ONLY clear auth on 401, not on network errors
    if (error.response?.status === 401) {
      authService.removeToken();
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    // For network errors, keep user logged in
  } finally {
    setLoading(false);
  }
};
```

### Fix 2: Check API Interceptor

Make sure the API interceptor isn't clearing the token on `/me` errors:

```typescript
// In src/lib/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // Only logout on /logout endpoint, not /me
      if (url.includes('/logout')) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Fix 3: Add Retry Logic

Sometimes the first `/me` call fails due to timing. Add retry:

```typescript
const refreshUser = async (retries = 2) => {
  const token = authService.getToken();
  if (!token) {
    setLoading(false);
    setIsAuthenticated(false);
    return;
  }

  try {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.removeToken();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } else if (retries > 0) {
      // Retry on network errors
      await new Promise(resolve => setTimeout(resolve, 500));
      return refreshUser(retries - 1);
    }
  } finally {
    setLoading(false);
  }
};
```

## What to Report

When you check the browser console, please report:

1. **Console logs:** What does `[UserContext]` show?
2. **Network tab:** What's the status of the `/me` request?
3. **localStorage:** Is `auth_token` present after refresh?
4. **Error message:** What error (if any) is shown?

## Next Steps

1. **Open browser DevTools** (F12)
2. **Login** as a staff user
3. **Refresh the page**
4. **Check Console, Network, and Application tabs**
5. **Report what you see**

Then I can provide a specific fix based on what's actually happening.

## Summary

✅ Backend is working correctly
✅ Token persistence works on backend
✅ `/me` endpoint works with valid token
❌ Something in the frontend is causing logout on refresh

**Need to debug the frontend to find the exact cause.**
