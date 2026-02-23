/**
 * File: services/leaveService.ts
 * Purpose: Service layer for leave request operations.
 */

import api from '@/lib/api';

export interface LeaveRequest {
  id: number;
  userId: number;
  userName?: string;
  userRole?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface LeaveFilters {
  status?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

interface CreateLeaveData {
  userId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

/** Fetch all leave requests with optional filters */
export const getLeaveRequests = async (filters?: LeaveFilters): Promise<LeaveRequest[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('user_id', filters.userId.toString());
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const response = await api.get(`/leave-requests?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    throw error;
  }
};

/** Fetch a single leave request by ID */
export const getLeaveRequestById = async (id: number): Promise<LeaveRequest> => {
  try {
    const response = await api.get(`/leave-requests/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching leave request:', error);
    throw error;
  }
};

/** Create a new leave request */
export const createLeaveRequest = async (data: CreateLeaveData): Promise<LeaveRequest> => {
  try {
    const response = await api.post('/leave-requests', {
      user_id: data.userId,
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating leave request:', error);
    throw error;
  }
};

/** Update an existing leave request */
export const updateLeaveRequest = async (id: number, data: Partial<CreateLeaveData>): Promise<LeaveRequest> => {
  try {
    const payload: any = {};
    if (data.startDate) payload.start_date = data.startDate;
    if (data.endDate) payload.end_date = data.endDate;
    if (data.reason) payload.reason = data.reason;

    const response = await api.put(`/leave-requests/${id}`, payload);
    return response.data.data;
  } catch (error) {
    console.error('Error updating leave request:', error);
    throw error;
  }
};

/** Approve a leave request */
export const approveLeaveRequest = async (id: number, approvedBy?: number): Promise<void> => {
  try {
    await api.post(`/leave-requests/${id}/approve`, {
      approved_by: approvedBy,
    });
  } catch (error) {
    console.error('Error approving leave request:', error);
    throw error;
  }
};

/** Reject a leave request */
export const rejectLeaveRequest = async (id: number, rejectionReason: string, approvedBy?: number): Promise<void> => {
  try {
    await api.post(`/leave-requests/${id}/reject`, {
      rejection_reason: rejectionReason,
      approved_by: approvedBy,
    });
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    throw error;
  }
};

/** Delete a leave request */
export const deleteLeaveRequest = async (id: number): Promise<void> => {
  try {
    await api.delete(`/leave-requests/${id}`);
  } catch (error) {
    console.error('Error deleting leave request:', error);
    throw error;
  }
};

/** Get leave statistics */
export const getLeaveStats = async () => {
  try {
    const response = await api.get('/leave-requests-stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    throw error;
  }
};
