/**
 * File: services/departmentService.ts
 * Purpose: Service layer for department-related operations.
 * Handles all department CRUD operations with Laravel backend.
 */

import api from '@/lib/api';
import { Department } from '@/types';

/** Fetch all departments */
export const getDepartments = async (): Promise<Department[]> => {
  try {
    console.log('[departmentService] Fetching departments...');
    const response = await api.get('/departments');
    console.log('[departmentService] Departments fetched successfully:', response.data.data?.length || 0, 'departments');
    return response.data.data;
  } catch (error: any) {
    console.error('[departmentService] Error fetching departments:', error.response?.data || error.message);
    throw error; // Throw error instead of returning empty array
  }
};

/** Fetch a single department by ID */
export const getDepartmentById = async (id: string | number): Promise<Department | undefined> => {
  try {
    console.log('[departmentService] Fetching department by ID:', id);
    const response = await api.get(`/departments/${id}`);
    console.log('[departmentService] Department fetched successfully');
    return response.data.data;
  } catch (error: any) {
    console.error('[departmentService] Error fetching department:', error.response?.data || error.message);
    throw error; // Throw error instead of returning undefined
  }
};

/** Get department name by ID — utility for display */
export const getDepartmentName = (id: string | number): string => {
  // This will be replaced with a cached version or passed departments array
  return 'Department';
};
