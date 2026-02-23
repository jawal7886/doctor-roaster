# Roles and Specialties Management System

## Overview
Implemented a flexible roles and specialties management system that allows administrators to create and manage roles and medical specialties from the settings page, replacing hardcoded values.

## Database Changes

### New Tables

1. **roles** table:
   - `id` - Primary key
   - `name` - Unique slug (e.g., 'physician_assistant')
   - `display_name` - Human-readable name (e.g., 'Physician Assistant')
   - `description` - Optional description
   - `is_active` - Boolean status
   - `timestamps`

2. **specialties** table:
   - `id` - Primary key
   - `name` - Unique specialty name (e.g., 'Cardiology')
   - `description` - Optional description
   - `is_active` - Boolean status
   - `timestamps`

### Updated Tables

**users** table:
- Removed: `role` (enum), `specialty` (string)
- Added: `role_id` (foreign key to roles), `specialty_id` (foreign key to specialties)

## Backend Implementation

### Models
- `Role` - Manages user roles
- `Specialty` - Manages medical specialties
- Updated `User` model with relationships to Role and Specialty

### Controllers
- `RoleController` - CRUD operations for roles
- `SpecialtyController` - CRUD operations for specialties
- Updated `UserController` to use role_id and specialty_id

### API Endpoints

**Roles:**
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `GET /api/roles/{id}` - Get role details
- `PUT /api/roles/{id}` - Update role
- `DELETE /api/roles/{id}` - Delete role (if not in use)

**Specialties:**
- `GET /api/specialties` - List all specialties
- `POST /api/specialties` - Create new specialty
- `GET /api/specialties/{id}` - Get specialty details
- `PUT /api/specialties/{id}` - Update specialty
- `DELETE /api/specialties/{id}` - Delete specialty (if not in use)

### Seeders
- `RoleSeeder` - Seeds default roles (admin, doctor, nurse, department_head, staff)
- `SpecialtySeeder` - Seeds default specialties (Cardiology, Neurology, Pediatrics, etc.)
- Updated `UserSeeder` to use role_id and specialty_id

## Frontend Implementation

### New Services
- `roleService.ts` - API calls for role management
- `specialtyService.ts` - API calls for specialty management

### Updated Components

1. **SettingsPage**:
   - Added "Roles" tab for managing roles
   - Added "Specialties" tab for managing specialties
   - Includes tables with add, edit, and delete functionality
   - Modal dialogs for creating/editing roles and specialties

2. **AddStaffModal**:
   - Updated to fetch roles and specialties dynamically
   - Dropdowns now populated from database instead of hardcoded constants

3. **EditStaffModal**:
   - Updated to fetch roles and specialties dynamically
   - Dropdowns now populated from database instead of hardcoded constants

### Updated Types
- Updated `User` interface to include `roleId`, `specialtyId`, and `roleDisplay`

## Features

### Role Management
- Create custom roles with display names and descriptions
- Edit existing roles
- Activate/deactivate roles
- Delete roles (only if not assigned to users)
- Auto-generates slug from display name

### Specialty Management
- Create custom medical specialties
- Edit existing specialties
- Activate/deactivate specialties
- Delete specialties (only if not assigned to doctors)
- One-to-many relationship with doctors

### Staff Management
- Select role from dynamic dropdown when adding/editing staff
- Select specialty from dynamic dropdown (for doctors)
- Both dropdowns only show active roles/specialties

## Usage

### For Administrators

1. **Managing Roles**:
   - Go to Settings → Roles tab
   - Click "Add Role" to create a new role
   - Enter display name (e.g., "Physician Assistant")
   - Add optional description
   - Set active status
   - Edit or delete existing roles as needed

2. **Managing Specialties**:
   - Go to Settings → Specialties tab
   - Click "Add Specialty" to create a new specialty
   - Enter specialty name (e.g., "Gastroenterology")
   - Add optional description
   - Set active status
   - Edit or delete existing specialties as needed

3. **Adding Staff**:
   - When adding staff, select from available roles
   - For doctors, select from available specialties
   - Only active roles and specialties appear in dropdowns

## Migration

To apply the database changes:

```bash
cd backend
php artisan migrate:fresh --seed
```

This will:
1. Create the new roles and specialties tables
2. Update the users table structure
3. Seed default roles and specialties
4. Create sample users with the new structure

## Benefits

1. **Flexibility**: No more hardcoded roles or specialties
2. **Scalability**: Easy to add new roles and specialties as hospital needs grow
3. **Maintainability**: Centralized management through settings page
4. **Data Integrity**: Foreign key relationships ensure consistency
5. **User-Friendly**: Admins can manage roles/specialties without code changes

## Default Roles

- Administrator
- Doctor
- Nurse
- Department Head
- Staff

## Default Specialties

- Cardiology
- Neurology
- Pediatrics
- Orthopedics
- Dermatology
- Oncology
- Emergency Medicine
- General Surgery

All defaults can be modified or extended through the settings page.
