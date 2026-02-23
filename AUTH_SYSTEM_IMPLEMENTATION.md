# Authentication System Implementation - Complete Plan

## Overview
Implementing a full authentication system with login/signup, protected routes, and UI updates.

## What's Been Completed

### ✅ Backend (Laravel)
1. **AuthController Created** - `backend/app/Http/Controllers/Api/AuthController.php`
   - `register()` - User registration
   - `login()` - User login with token
   - `logout()` - Logout and revoke token
   - `me()` - Get current authenticated user

2. **API Routes Updated** - `backend/routes/api.php`
   - Public routes: `/api/register`, `/api/login`
   - Protected routes: All other routes wrapped in `auth:sanctum` middleware
   - `/api/logout` - Logout endpoint
   - `/api/me` - Get current user endpoint

## What Needs to Be Done

### Frontend Implementation

#### 1. Create Auth Service
**File**: `src/services/authService.ts`
- `login(email, password)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout user
- `getCurrentUser()` - Get authenticated user
- Token management (localStorage)

#### 2. Update UserContext
**File**: `src/contexts/UserContext.tsx`
- Add authentication state
- Add login/logout functions
- Load user from token on app start
- Clear user on logout

#### 3. Create Login Page
**File**: `src/pages/LoginPage.tsx`
- Email and password inputs
- Login button
- Link to signup page
- Error handling
- Redirect to dashboard on success

#### 4. Create Signup Page
**File**: `src/pages/SignupPage.tsx`
- Name, email, password, confirm password inputs
- Phone (optional)
- Register button
- Link to login page
- Error handling
- Redirect to dashboard on success

#### 5. Create Protected Route Component
**File**: `src/components/ProtectedRoute.tsx`
- Check if user is authenticated
- Redirect to login if not
- Show loading state

#### 6. Update App.tsx
- Add login/signup routes
- Wrap dashboard routes with ProtectedRoute
- Handle authentication state

#### 7. Update Sidebar
**File**: `src/components/layout/AppSidebar.tsx`
- Remove Settings link from navigation
- Add "Edit Profile" button in user section
- Add "Logout" button in user section
- Handle logout click

#### 8. Remove Profile Tab from Settings
**File**: `src/pages/SettingsPage.tsx`
- Remove Profile tab
- Keep only: Notifications, Hospital, Roles, Specialties tabs

#### 9. Create Edit Profile Modal
**File**: `src/components/modals/EditProfileModal.tsx`
- Same as current Profile tab
- Avatar upload
- Name, email, phone, role fields
- Save button

## Implementation Steps

### Step 1: Frontend Auth Service
```typescript
// src/services/authService.ts
import api from '@/lib/api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  const { token, user } = response.data.data;
  localStorage.setItem('auth_token', token);
  return user;
};

export const register = async (userData: any) => {
  const response = await api.post('/register', userData);
  const { token, user } = response.data.data;
  localStorage.setItem('auth_token', token);
  return user;
};

export const logout = async () => {
  await api.post('/logout');
  localStorage.removeItem('auth_token');
};

export const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data.data;
};

export const getToken = () => localStorage.getItem('auth_token');
export const setToken = (token: string) => localStorage.setItem('auth_token', token);
export const removeToken = () => localStorage.removeItem('auth_token');
```

### Step 2: Update API Client
```typescript
// src/lib/api.ts
import axios from 'axios';
import { getToken } from '@/services/authService';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3: Update UserContext
```typescript
// Add to UserContext
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true);

const login = async (email: string, password: string) => {
  const user = await authService.login(email, password);
  setCurrentUser(user);
  setIsAuthenticated(true);
};

const logout = async () => {
  await authService.logout();
  setCurrentUser(null);
  setIsAuthenticated(false);
};

// Load user on mount
useEffect(() => {
  const loadUser = async () => {
    const token = authService.getToken();
    if (token) {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        authService.removeToken();
      }
    }
    setIsLoading(false);
  };
  loadUser();
}, []);
```

### Step 4: Create Login Page
```tsx
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Login to MedScheduler</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
```

### Step 5: Update Sidebar
```tsx
// Add to AppSidebar.tsx
import { LogOut, UserCog } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const { logout } = useUser();
const navigate = useNavigate();
const [editProfileOpen, setEditProfileOpen] = useState(false);

const handleLogout = async () => {
  await logout();
  navigate('/login');
};

// In user section:
<div className="border-t border-sidebar-border px-4 py-3">
  <div className="flex items-center gap-3 mb-3">
    {/* Avatar and name */}
  </div>
  <div className="space-y-2">
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={() => setEditProfileOpen(true)}
    >
      <UserCog className="h-4 w-4" />
      Edit Profile
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  </div>
</div>
```

## Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Token stored in localStorage
- [ ] Protected routes redirect to login
- [ ] Logout clears token
- [ ] Edit profile from sidebar
- [ ] Profile tab removed from settings
- [ ] All API calls include token
- [ ] 401 errors redirect to login

## Files to Create/Modify

### Create
1. `src/services/authService.ts`
2. `src/pages/LoginPage.tsx`
3. `src/pages/SignupPage.tsx`
4. `src/components/ProtectedRoute.tsx`
5. `src/components/modals/EditProfileModal.tsx`

### Modify
1. `src/lib/api.ts` - Add token interceptor
2. `src/contexts/UserContext.tsx` - Add auth functions
3. `src/App.tsx` - Add login/signup routes
4. `src/components/layout/AppSidebar.tsx` - Add logout/edit profile
5. `src/pages/SettingsPage.tsx` - Remove profile tab

## Next Steps

Would you like me to:
1. Continue with the frontend implementation?
2. Create all the files step by step?
3. Focus on a specific part first?

Let me know and I'll proceed with the implementation!
