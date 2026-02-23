/**
 * File: services/userService.ts
 * Purpose: Service layer for user-related API operations.
 * Handles all user CRUD operations with Laravel backend.
 */

import api from '@/lib/api';
import { User, UserRole, UserStatus } from '@/types';

/** Fetch all users, optionally filtered by role, department, or status */
export const getUsers = async (filters?: {
  role?: UserRole;
  departmentId?: string;
  status?: UserStatus;
  search?: string;
}): Promise<User[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.role) params.append('role', filters.role);
    if (filters?.departmentId) params.append('department_id', filters.departmentId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    console.log('[userService] Fetching users from:', url);
    const response = await api.get(url);
    console.log('[userService] Users fetched successfully:', response.data.data?.length || 0, 'users');
    return response.data.data;
  } catch (error: any) {
    console.error('[userService] Error fetching users:', error.response?.data || error.message);
    throw error; // Throw error instead of returning empty array
  }
};

/** Fetch a single user by ID */
export const getUserById = async (id: string | number): Promise<User | undefined> => {
  try {
    console.log('[userService] Fetching user by ID:', id);
    const response = await api.get(`/users/${id}`);
    console.log('[userService] User fetched successfully');
    return response.data.data;
  } catch (error: any) {
    console.error('[userService] Error fetching user:', error.response?.data || error.message);
    throw error; // Throw error instead of returning undefined
  }
};

/** Create a new user */
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId: number | null;
  specialtyId?: number | null;
  departmentId?: number | null;
  status?: UserStatus;
}): Promise<User> => {
  const response = await api.post('/users', {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    phone: userData.phone,
    role_id: userData.roleId,
    specialty_id: userData.specialtyId,
    department_id: userData.departmentId,
    status: userData.status || 'active',
  });
  return response.data.data;
};

/** Update an existing user */
export const updateUser = async (id: string | number, userData: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, {
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role_id: userData.roleId,
    specialty_id: userData.specialtyId,
    department_id: userData.departmentId,
    status: userData.status,
    avatar: userData.avatar,
  });
  return response.data.data;
};

/** Delete a user */
export const deleteUser = async (id: string | number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

/** Get count of users by role */
export const getUserCountByRole = async (role: UserRole): Promise<number> => {
  const users = await getUsers({ role });
  return users.length;
};
