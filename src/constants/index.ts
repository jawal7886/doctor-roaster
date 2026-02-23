/**
 * File: constants/index.ts
 * Purpose: Centralized constants for the hospital management system.
 * Includes shift types, roles, department names, and other static data.
 */

import { ShiftType, UserRole, UserStatus } from '@/types';

/** Human-readable labels for user roles */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  staff: 'Staff',
  department_head: 'Department Head',
};

/** Human-readable labels for shift types */
export const SHIFT_LABELS: Record<ShiftType, string> = {
  morning: 'Morning',
  evening: 'Evening',
  night: 'Night',
};

/** Shift time ranges */
export const SHIFT_TIMES: Record<ShiftType, { start: string; end: string }> = {
  morning: { start: '06:00', end: '14:00' },
  evening: { start: '14:00', end: '22:00' },
  night: { start: '22:00', end: '06:00' },
};

/** Status badge color mappings */
export const STATUS_VARIANTS: Record<UserStatus, string> = {
  active: 'success',
  inactive: 'muted',
  on_leave: 'warning',
};

/** Navigation items for sidebar */
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Doctors & Staff', path: '/users', icon: 'Users' },
  { label: 'Departments', path: '/departments', icon: 'Building2' },
  { label: 'Schedule', path: '/schedule', icon: 'CalendarDays' },
  { label: 'Leave Management', path: '/leaves', icon: 'CalendarOff' },
  { label: 'Notifications', path: '/notifications', icon: 'Bell' },
  { label: 'Reports', path: '/reports', icon: 'BarChart3' },
] as const;

/** Maximum working hours per week */
export const MAX_WEEKLY_HOURS = 48;

/** Specialties available in the hospital */
export const SPECIALTIES = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Surgery',
  'Emergency Medicine',
  'Internal Medicine',
  'Radiology',
  'Anesthesiology',
  'Dermatology',
  'Ophthalmology',
  'Psychiatry',
] as const;
