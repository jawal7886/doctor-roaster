/**
 * File: services/profileService.ts
 * Purpose: Service for updating current user/account profile
 */

import api from '@/lib/api';
import { User } from '@/types';

interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  roleId?: number | null;
  specialtyId?: number | null;
  departmentId?: number | null;
}

/**
 * Update current user's profile
 * Uses user_type from currentUser to determine which endpoint to call
 */
export const updateProfile = async (currentUser: User, data: ProfileUpdateData): Promise<any> => {
  try {
    console.log('updateProfile called with data:', { ...data, avatar: data.avatar ? '[base64]' : null });
    console.log('Current user type:', currentUser.user_type);
    
    // If user_type is 'account', use account endpoint
    if (currentUser.user_type === 'account') {
      console.log('Updating account profile...');
      const response = await api.put('/account/profile', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
      });
      console.log('Account profile updated successfully');
      return {
        ...response.data.data,
        user_type: 'account'
      };
    }
    
    // Otherwise, use users endpoint (for staff)
    console.log('Updating user profile...');
    const response = await api.put(`/users/${currentUser.id}`, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role_id: data.roleId,
      specialty_id: data.specialtyId,
      department_id: data.departmentId,
      avatar: data.avatar,
    });
    console.log('User profile updated successfully');
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating profile:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getCurrentProfile = async (): Promise<any> => {
  const response = await api.get('/me');
  return response.data.data;
};
