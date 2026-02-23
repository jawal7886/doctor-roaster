/**
 * File: services/reportService.ts
 * Purpose: Service layer for reports and analytics API operations.
 */

import api from '@/lib/api';

export interface OverviewStats {
  totalDutyHours: number;
  shiftsThisWeek: number;
  staffOnLeave: number;
  coverageRate: number;
}

export interface DepartmentDutyHours {
  departmentId: number;
  departmentName: string;
  departmentColor: string;
  doctors: number;
  maxHours: number;
  usedHours: number;
  coverage: number;
}

export interface StaffAttendance {
  userId: number;
  userName: string;
  userRole: string;
  departmentName: string;
  scheduledShifts: number;
  completedShifts: number;
  cancelledShifts: number;
  leaveDays: number;
  attendanceRate: number;
}

export interface LeaveSummary {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  byDepartment: Array<{
    departmentId: number;
    departmentName: string;
    totalLeaves: number;
    approvedLeaves: number;
  }>;
}

/** Get overview statistics */
export const getOverviewStats = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<OverviewStats> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const response = await api.get(`/reports/overview?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    throw error;
  }
};

/** Get department duty hours report */
export const getDepartmentDutyHours = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<DepartmentDutyHours[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const response = await api.get(`/reports/department-duty-hours?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching department duty hours:', error);
    throw error;
  }
};

/** Get staff attendance report */
export const getStaffAttendance = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<StaffAttendance[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const response = await api.get(`/reports/staff-attendance?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching staff attendance:', error);
    throw error;
  }
};

/** Get leave summary report */
export const getLeaveSummary = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<LeaveSummary> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const response = await api.get(`/reports/leave-summary?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching leave summary:', error);
    throw error;
  }
};

/** Export report to Excel (CSV) */
export const exportReport = async (
  reportType: 'department_duty_hours' | 'staff_attendance' | 'leave_summary',
  filters?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<void> => {
  try {
    const params = new URLSearchParams();
    params.append('report_type', reportType);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const response = await api.get(`/reports/export?${params.toString()}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};
