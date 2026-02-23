/**
 * File: types/index.ts
 * Purpose: Central type definitions for the hospital management system.
 * All shared interfaces, enums, and types are defined here.
 */

/** User roles within the hospital system */
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'staff' | 'department_head';

/** User status */
export type UserStatus = 'active' | 'inactive' | 'on_leave';

/** Shift types available in the hospital */
export type ShiftType = 'morning' | 'evening' | 'night';

/** Days of the week */
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/** Department interface representing a hospital department */
export interface Department {
  id: number; // Changed from string to match backend
  name: string;
  description: string;
  headId: number | null; // Changed from string
  maxHoursPerDoctor: number;
  doctorCount: number;
  color: string;
  isActive: boolean;
  head?: User; // Added for API response
}

/** User interface representing any hospital staff member */
export interface User {
  id: number; // Changed from string to match backend
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleId: number | null;
  roleDisplay?: string;
  specialty: string;
  specialtyId: number | null;
  departmentId: number | null; // Changed from string
  status: UserStatus;
  avatar?: string;
  joinDate: string;
  department?: Department; // Added for API response
  user_type?: 'account' | 'staff'; // Added to identify user type
  account_type?: string; // For account users (patient, visitor, etc.)
}

/** Shift definition for a department */
export interface Shift {
  id: string;
  departmentId: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  requiredStaff: number;
}

/** Schedule entry — assignment of a user to a shift on a date */
export interface ScheduleEntry {
  id: number;
  userId: number;
  userName?: string;
  userRole?: string;
  shiftId: number | null;
  date: string;
  departmentId: number;
  departmentName?: string;
  departmentColor?: string;
  shiftType: ShiftType;
  status: 'scheduled' | 'confirmed' | 'swapped' | 'cancelled';
  isOnCall: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Leave request */
export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

/** Notification */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'shift' | 'swap' | 'leave' | 'emergency' | 'general';
  isRead: boolean;
  createdAt: string;
}

/** Stats card data */
export interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}
