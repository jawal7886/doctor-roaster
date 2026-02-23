# Connect Frontend to Laravel Backend

## ✅ Backend API is Ready!

Your Laravel backend is now fully functional with:
- ✅ All database tables migrated
- ✅ API endpoints created
- ✅ CORS enabled
- ✅ User CRUD operations working
- ✅ Department CRUD operations working

## 🔗 Available API Endpoints

### Base URL
```
http://localhost:8000/api
```

### Users API
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get specific user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Departments API
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create new department
- `GET /api/departments/{id}` - Get specific department
- `PUT /api/departments/{id}` - Update department
- `DELETE /api/departments/{id}` - Delete department

### Health Check
- `GET /api/health` - Check if API is running

## 📝 Step-by-Step Frontend Integration

### Step 1: Create API Client

Create `src/lib/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
```

### Step 2: Update User Service

Update `src/services/userService.ts`:

```typescript
import api from '@/lib/api';
import { User, UserRole, UserStatus } from '@/types';

export const getUsers = async (filters?: {
  role?: UserRole;
  departmentId?: string;
  status?: UserStatus;
  search?: string;
}): Promise<User[]> => {
  const params = new URLSearchParams();
  
  if (filters?.role) params.append('role', filters.role);
  if (filters?.departmentId) params.append('department_id', filters.departmentId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const response = await api.get(`/users?${params.toString()}`);
  return response.data.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data.data;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getUserCountByRole = async (role: UserRole): Promise<number> => {
  const users = await getUsers({ role });
  return users.length;
};
```

### Step 3: Update Department Service

Update `src/services/departmentService.ts`:

```typescript
import api from '@/lib/api';
import { Department } from '@/types';

export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get('/departments');
  return response.data.data;
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  const response = await api.get(`/departments/${id}`);
  return response.data.data;
};

export const createDepartment = async (deptData: Omit<Department, 'id'>): Promise<Department> => {
  const response = await api.post('/departments', deptData);
  return response.data.data;
};

export const updateDepartment = async (id: string, deptData: Partial<Department>): Promise<Department> => {
  const response = await api.put(`/departments/${id}`, deptData);
  return response.data.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await api.delete(`/departments/${id}`);
};

export const getDepartmentName = (id: string, departments: Department[]): string => {
  return departments.find((d) => d.id === id)?.name ?? 'Unknown';
};
```

### Step 4: Install Axios

```bash
npm install axios
```

### Step 5: Update Type Definitions

Update `src/types/index.ts` to match backend response:

```typescript
// Update User interface to match backend
export interface User {
  id: number; // Changed from string to number
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  specialty: string;
  departmentId: number | null; // Changed from string
  status: UserStatus;
  avatar?: string;
  joinDate: string;
  department?: Department; // Added for API response
}

// Update Department interface
export interface Department {
  id: number; // Changed from string to number
  name: string;
  description: string;
  headId: number | null; // Changed from string
  maxHoursPerDoctor: number;
  doctorCount: number;
  color: string;
  isActive: boolean;
  head?: User; // Added for API response
}
```

### Step 6: Update Components to Use API

Example: Update `AddStaffModal.tsx`:

```typescript
import { useState } from 'react';
import { createUser } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

const AddStaffModal = ({ onClose, onSuccess }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newUser = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password, // Add password field
        phone: formData.phone,
        role: formData.role,
        specialty: formData.specialty,
        departmentId: formData.departmentId,
        status: 'active',
        joinDate: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Staff member added successfully',
      });

      onSuccess(newUser);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add staff member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

### Step 7: Update Pages to Fetch Data

Example: Update `UsersPage.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { getUsers } from '@/services/userService';
import { User } from '@/types';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAdded = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Your existing UI */}
      <AddStaffModal onSuccess={handleUserAdded} />
    </div>
  );
};
```

## 🧪 Testing the Integration

### Test 1: Check API Connection

```typescript
// In browser console or a test component
import api from '@/lib/api';

api.get('/health').then(res => console.log(res.data));
// Should log: { success: true, message: "API is running", timestamp: "..." }
```

### Test 2: Fetch Users

```typescript
import { getUsers } from '@/services/userService';

getUsers().then(users => console.log(users));
// Should log array of users
```

### Test 3: Create User

```typescript
import { createUser } from '@/services/userService';

createUser({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  phone: '+1-555-1234',
  role: 'doctor',
  specialty: 'General',
  departmentId: 1,
  status: 'active',
  joinDate: new Date().toISOString(),
}).then(user => console.log('Created:', user));
```

## 🔧 Common Issues & Solutions

### Issue 1: CORS Error
**Error**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution**: CORS is already configured in Laravel. Make sure:
1. Laravel server is running: `cd backend && php artisan serve`
2. Frontend is using correct API URL: `http://localhost:8000/api`

### Issue 2: 404 Not Found
**Error**: "GET http://localhost:8000/api/users 404"

**Solution**: 
1. Check Laravel server is running
2. Verify `backend/routes/api.php` exists
3. Restart Laravel server

### Issue 3: Type Mismatches
**Error**: Type 'string' is not assignable to type 'number'

**Solution**: Update your TypeScript types to match backend:
- Change `id: string` to `id: number`
- Change `departmentId: string` to `departmentId: number`

### Issue 4: Password Required
**Error**: "The password field is required"

**Solution**: Add password field to user creation form:
```typescript
<Input
  type="password"
  name="password"
  placeholder="Password"
  required
/>
```

## 📊 API Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful" // Optional
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... } // Validation errors
}
```

## 🎯 Next Steps

1. ✅ Install axios: `npm install axios`
2. ✅ Create `src/lib/api.ts`
3. ✅ Update `src/services/userService.ts`
4. ✅ Update `src/services/departmentService.ts`
5. ✅ Update type definitions in `src/types/index.ts`
6. ✅ Update components to use API
7. ✅ Update pages to fetch data
8. ✅ Test creating/updating/deleting users
9. ⏭️ Implement authentication
10. ⏭️ Add loading states and error handling

## 🚀 Quick Start Commands

```bash
# Terminal 1: Start Laravel Backend
cd backend
php artisan serve

# Terminal 2: Start React Frontend
npm run dev
```

Your frontend will now be connected to the Laravel backend and all data will be saved to the `dr_roaster` database!

## 📝 Example: Complete User Creation Flow

1. User clicks "Add Staff Member" button
2. Modal opens with form
3. User fills in details and submits
4. Frontend calls `createUser()` from `userService.ts`
5. API request sent to `POST http://localhost:8000/api/users`
6. Laravel validates data
7. Laravel creates user in database
8. Laravel returns created user
9. Frontend updates UI with new user
10. Success toast notification shown

**The user is now permanently saved in the database!** 🎉
