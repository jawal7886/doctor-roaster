# Authentication System - Quick Start Guide

## 🚀 How to Use

### For New Users (Registration)

1. **Navigate to Signup:**
   - Visit `http://localhost:5173/signup`
   - Or click "Sign up" link on login page

2. **Fill Registration Form:**
   ```
   Full Name: John Doe
   Email: john@example.com
   Phone: +1 (555) 123-4567 (optional)
   Password: ******** (min 8 characters)
   Confirm Password: ********
   ```

3. **Submit:**
   - Click "Sign Up" button
   - Automatically logged in and redirected to dashboard

### For Existing Users (Login)

1. **Navigate to Login:**
   - Visit `http://localhost:5173/login`
   - Or you'll be redirected here if trying to access protected pages

2. **Enter Credentials:**
   ```
   Email: john@example.com
   Password: ********
   ```

3. **Submit:**
   - Click "Sign In" button
   - Redirected to dashboard

### Edit Your Profile

1. **Open Profile Modal:**
   - Look at bottom of sidebar
   - Click "Edit Profile" button

2. **Update Information:**
   - Change name, email, phone
   - Upload new avatar (click camera icon)
   - Select different role

3. **Save Changes:**
   - Click "Save Changes" button
   - See updates immediately in sidebar

### Logout

1. **Click Logout:**
   - Look at bottom of sidebar
   - Click "Logout" button
   - Redirected to login page

## 📁 File Structure

```
src/
├── pages/
│   ├── LoginPage.tsx          ← Login form
│   └── SignupPage.tsx         ← Registration form
├── components/
│   ├── ProtectedRoute.tsx     ← Route protection
│   ├── layout/
│   │   └── AppSidebar.tsx     ← Edit Profile & Logout buttons
│   └── modals/
│       └── EditProfileModal.tsx ← Profile editing
├── contexts/
│   └── UserContext.tsx        ← Auth state management
├── services/
│   └── authService.ts         ← Auth API calls
└── lib/
    └── api.ts                 ← Token interceptor

backend/
├── app/Http/Controllers/Api/
│   └── AuthController.php     ← Auth endpoints
└── routes/
    └── api.php                ← Route definitions
```

## 🔐 How It Works

### Token Flow:
```
1. User logs in/registers
   ↓
2. Backend returns token
   ↓
3. Token saved to localStorage
   ↓
4. Token added to all API requests
   ↓
5. Backend validates token
   ↓
6. User data returned
```

### Route Protection:
```
User tries to access /dashboard
   ↓
ProtectedRoute checks: isAuthenticated?
   ↓
YES → Show dashboard
NO  → Redirect to /login
```

## 🎨 UI Changes

### Before:
```
Sidebar:
├── Navigation Links
├── Settings Link
└── User Info (static)
```

### After:
```
Sidebar:
├── Navigation Links
└── User Section
    ├── User Info (dynamic)
    ├── Edit Profile Button
    └── Logout Button
```

### Settings Page Before:
```
Tabs: Profile | Notifications | Hospital | Roles | Specialties
```

### Settings Page After:
```
Tabs: Notifications | Hospital | Roles | Specialties
(Profile moved to modal in sidebar)
```

## 🧪 Test Scenarios

### Scenario 1: New User Registration
```bash
1. Go to /signup
2. Fill form with valid data
3. Submit
4. ✅ Should redirect to /
5. ✅ Should see user name in sidebar
6. ✅ Should be able to access all pages
```

### Scenario 2: Existing User Login
```bash
1. Go to /login
2. Enter credentials
3. Submit
4. ✅ Should redirect to /
5. ✅ Should see user data loaded
```

### Scenario 3: Protected Route Access
```bash
1. Open browser (not logged in)
2. Try to go to /users
3. ✅ Should redirect to /login
4. Login
5. ✅ Should redirect back to /users
```

### Scenario 4: Profile Update
```bash
1. Login
2. Click "Edit Profile" in sidebar
3. Change name to "Jane Doe"
4. Upload new avatar
5. Click Save
6. ✅ Should see "Jane Doe" in sidebar
7. ✅ Should see new avatar in sidebar
```

### Scenario 5: Logout
```bash
1. Login
2. Click "Logout" in sidebar
3. ✅ Should redirect to /login
4. ✅ Should show toast notification
5. Try to go to /dashboard
6. ✅ Should redirect to /login
```

### Scenario 6: Token Persistence
```bash
1. Login
2. Refresh page (F5)
3. ✅ Should still be logged in
4. Close browser
5. Reopen browser
6. Go to /dashboard
7. ✅ Should still be logged in
```

## 🐛 Troubleshooting

### Issue: "Failed to login"
**Solution:** Check backend is running on port 8000
```bash
cd backend
php artisan serve
```

### Issue: "Redirected to login after refresh"
**Solution:** Check localStorage has auth_token
```javascript
// In browser console:
localStorage.getItem('auth_token')
// Should return a token string
```

### Issue: "Avatar not uploading"
**Solution:** Check file size < 2MB and database column is LONGTEXT
```bash
# Check migration was run:
cd backend
php artisan migrate:status
```

### Issue: "Edit Profile button not showing"
**Solution:** Clear browser cache and refresh
```bash
# Or hard refresh:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

## 📝 Default Test Credentials

If you ran the seeders, you can use:

```
Admin:
Email: admin@hospital.com
Password: password

Doctor:
Email: doctor@hospital.com
Password: password

Nurse:
Email: nurse@hospital.com
Password: password
```

## 🎯 Key Features

✅ **Secure Authentication**
- Token-based auth with Laravel Sanctum
- Passwords hashed with bcrypt
- Tokens stored securely

✅ **User Experience**
- Persistent login across sessions
- Loading states during auth
- Error messages for failed attempts
- Success notifications

✅ **Profile Management**
- Edit profile from anywhere
- Avatar upload with preview
- Real-time updates across app

✅ **Route Protection**
- All dashboard routes protected
- Automatic redirect to login
- Seamless navigation after login

## 🚦 Status

All features implemented and tested:
- ✅ Registration
- ✅ Login
- ✅ Logout
- ✅ Protected Routes
- ✅ Profile Editing
- ✅ Token Persistence
- ✅ Error Handling
- ✅ Loading States

Ready for production! 🎉
