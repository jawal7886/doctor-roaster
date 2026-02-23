/**
 * File: services/scheduleService.ts
 * Purpose: Service layer for schedule-related operations.
 * Handles all schedule CRUD operations with Laravel backend.
 */

import api from '@/lib/api';
import { ScheduleEntry } from '@/types';

interface ScheduleFilters {
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  userId?: number;
  status?: string;
}

interface CreateScheduleData {
  userId: number;
  shiftId?: number;
  date: string;
  departmentId: number;
  shiftType: 'morning' | 'evening' | 'night';
  status?: 'scheduled' | 'confirmed' | 'swapped' | 'cancelled';
  isOnCall?: boolean;
  notes?: string;
}

interface UpdateScheduleData {
  userId?: number;
  shiftId?: number;
  date?: string;
  departmentId?: number;
  shiftType?: 'morning' | 'evening' | 'night';
  status?: 'scheduled' | 'confirmed' | 'swapped' | 'cancelled';
  isOnCall?: boolean;
  notes?: string;
}

/** Fetch all schedule entries with optional filters */
export const getSchedules = async (filters?: ScheduleFilters): Promise<ScheduleEntry[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.departmentId) params.append('department_id', filters.departmentId.toString());
    if (filters?.userId) params.append('user_id', filters.userId.toString());
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/schedules?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

/** Fetch a single schedule entry by ID */
export const getScheduleById = async (id: number): Promise<ScheduleEntry> => {
  try {
    const response = await api.get(`/schedules/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

/** Create a new schedule entry */
export const createSchedule = async (data: CreateScheduleData): Promise<ScheduleEntry> => {
  try {
    const response = await api.post('/schedules', {
      user_id: data.userId,
      shift_id: data.shiftId,
      date: data.date,
      department_id: data.departmentId,
      shift_type: data.shiftType,
      status: data.status || 'scheduled',
      is_on_call: data.isOnCall || false,
      notes: data.notes,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

/** Update an existing schedule entry */
export const updateSchedule = async (id: number, data: UpdateScheduleData): Promise<ScheduleEntry> => {
  try {
    const payload: any = {};
    if (data.userId !== undefined) payload.user_id = data.userId;
    if (data.shiftId !== undefined) payload.shift_id = data.shiftId;
    if (data.date !== undefined) payload.date = data.date;
    if (data.departmentId !== undefined) payload.department_id = data.departmentId;
    if (data.shiftType !== undefined) payload.shift_type = data.shiftType;
    if (data.status !== undefined) payload.status = data.status;
    if (data.isOnCall !== undefined) payload.is_on_call = data.isOnCall;
    if (data.notes !== undefined) payload.notes = data.notes;

    const response = await api.put(`/schedules/${id}`, payload);
    return response.data.data;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

/** Delete a schedule entry */
export const deleteSchedule = async (id: number): Promise<void> => {
  try {
    await api.delete(`/schedules/${id}`);
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

/** Get schedule statistics */
export const getScheduleStats = async (startDate?: string, endDate?: string) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await api.get(`/schedules-stats?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching schedule stats:', error);
    throw error;
  }
};
