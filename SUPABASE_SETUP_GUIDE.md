# Hospital Harmony - Supabase Setup Guide

## Overview
This guide will help you set up your Supabase database for the Hospital Harmony application.

## Database Schema Summary

### Core Tables

1. **departments** - Hospital departments (Emergency, Cardiology, etc.)
2. **users** - All staff members (doctors, nurses, admins)
3. **shifts** - Shift definitions (morning, evening, night) per department
4. **schedule_entries** - Actual shift assignments to users
5. **leave_requests** - Staff leave/vacation requests
6. **notifications** - In-app notifications for users
7. **hospital_settings** - Global hospital configuration
8. **audit_logs** - Track all changes (optional)

### Key Relationships

```
departments (1) ←→ (many) users
departments (1) ←→ (many) shifts
users (1) ←→ (many) schedule_entries
shifts (1) ←→ (many) schedule_entries
users (1) ←→ (many) leave_requests
users (1) ←→ (many) notifications
```

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - Project name: `hospital-harmony`
   - Database password: (save this securely)
   - Region: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### Step 2: Run the Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Wait for completion (should see "Success" message)

### Step 3: Verify Tables

1. Go to **Table Editor** in the sidebar
2. You should see all 8 tables:
   - departments
   - users
   - shifts
   - schedule_entries
   - leave_requests
   - notifications
   - hospital_settings
   - audit_logs

### Step 4: Get Your API Keys

1. Go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (keep this secret!)

### Step 5: Configure Your App

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 7: Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Authentication Setup

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**
5. Copy the user's UUID

### Link Auth User to Users Table

After creating an auth user, insert them into the users table:

```sql
INSERT INTO users (id, name, email, phone, role, specialty, department_id, status)
VALUES (
  'auth-user-uuid-here',
  'Admin User',
  'admin@hospital.com',
  '+1-555-0000',
  'admin',
  'Administration',
  NULL,
  'active'
);
```

## Sample Data

The schema includes sample departments and shifts. To add sample users:

```sql
-- First, create auth users in Authentication → Users
-- Then link them to the users table:

INSERT INTO users (id, name, email, phone, role, specialty, department_id, status, join_date) VALUES
('user-uuid-1', 'Dr. Sarah Chen', 'sarah.chen@hospital.com', '+1-555-0101', 'doctor', 'Emergency Medicine', '11111111-1111-1111-1111-111111111111', 'active', '2021-03-15'),
('user-uuid-2', 'Dr. James Wilson', 'james.wilson@hospital.com', '+1-555-0102', 'doctor', 'Cardiology', '22222222-2222-2222-2222-222222222222', 'active', '2019-08-20');
```

## Updating Your Services

Replace mock data with Supabase queries:

### Example: userService.ts

```typescript
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export const getUsers = async (filters?: {
  role?: string;
  departmentId?: string;
  status?: string;
  search?: string;
}): Promise<User[]> => {
  let query = supabase.from('users').select('*');

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }
  if (filters?.departmentId) {
    query = query.eq('department_id', filters.departmentId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};
```

### Example: departmentService.ts

```typescript
import { supabase } from '@/lib/supabase';
import { Department } from '@/types';

export const getDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createDepartment = async (department: Omit<Department, 'id'>): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .insert(department)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
```

### Example: scheduleService.ts

```typescript
import { supabase } from '@/lib/supabase';
import { ScheduleEntry } from '@/types';

export const getScheduleEntries = async (filters?: {
  date?: string;
  departmentId?: string;
  userId?: string;
}): Promise<ScheduleEntry[]> => {
  let query = supabase.from('schedule_entries').select('*');

  if (filters?.date) {
    query = query.eq('date', filters.date);
  }
  if (filters?.departmentId) {
    query = query.eq('department_id', filters.departmentId);
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  const { data, error } = await query.order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const createScheduleEntry = async (entry: Omit<ScheduleEntry, 'id'>): Promise<ScheduleEntry> => {
  const { data, error } = await supabase
    .from('schedule_entries')
    .insert(entry)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
```

## Row Level Security (RLS) Policies

The schema includes basic RLS policies:

- **Departments**: Everyone can read, only admins can modify
- **Users**: Everyone can read, users can update their own profile
- **Schedules**: Users see their own + department schedules
- **Leaves**: Users manage their own, admins/dept heads manage all
- **Notifications**: Users only see their own

### Customize RLS Policies

You can modify policies in **Authentication** → **Policies** or via SQL:

```sql
-- Example: Allow department heads to manage their department's users
CREATE POLICY "Dept heads can manage their department users" ON users
FOR UPDATE USING (
  department_id IN (
    SELECT id FROM departments 
    WHERE head_id = auth.uid()
  )
);
```

## Useful Views

The schema includes helpful views:

1. **user_details** - Users with department info
2. **todays_schedule** - Today's schedule with full details
3. **pending_leaves** - All pending leave requests
4. **department_stats** - Department statistics

Use them like regular tables:

```typescript
const { data } = await supabase.from('user_details').select('*');
```

## Real-time Subscriptions

Enable real-time updates for notifications:

```typescript
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
      // Update UI
    }
  )
  .subscribe();

// Cleanup
return () => subscription.unsubscribe();
```

## Database Backups

1. Go to **Database** → **Backups**
2. Enable automatic daily backups
3. Download manual backup: Click **Create Backup**

## Performance Tips

1. **Use indexes** - Already created for common queries
2. **Limit results** - Use `.limit()` in queries
3. **Select specific columns** - Don't use `select('*')` in production
4. **Use views** - Pre-joined data for complex queries
5. **Enable caching** - Use React Query or SWR

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the entire schema SQL
- Check table names match (use snake_case in DB, camelCase in code)

### RLS blocking queries
- Temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
- Check policies match your auth setup
- Use service_role key for admin operations (server-side only!)

### Foreign key violations
- Insert data in correct order: departments → users → shifts → schedule_entries
- Check UUIDs match between related tables

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run schema SQL
3. ✅ Configure environment variables
4. ✅ Install Supabase client
5. ✅ Create admin user
6. 🔄 Update service files to use Supabase
7. 🔄 Implement authentication
8. 🔄 Test CRUD operations
9. 🔄 Add real-time features
10. 🔄 Deploy to production

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Note**: Remember to keep your `service_role` key secret and never expose it in client-side code!
