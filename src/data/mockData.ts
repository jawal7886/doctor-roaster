/**
 * File: data/mockData.ts
 * Purpose: Mock data for development and demonstration.
 * Provides realistic sample data for all entities in the system.
 */

import { Department, User, ScheduleEntry, LeaveRequest, Notification } from '@/types';

/** Mock departments */
export const mockDepartments: Department[] = [
  { id: 'dept-1', name: 'Emergency', description: 'Emergency and trauma care', headId: 'user-1', maxHoursPerDoctor: 40, doctorCount: 12, color: '#ef4444', isActive: true },
  { id: 'dept-2', name: 'Cardiology', description: 'Heart and cardiovascular system', headId: 'user-2', maxHoursPerDoctor: 44, doctorCount: 8, color: '#3b82f6', isActive: true },
  { id: 'dept-3', name: 'Pediatrics', description: 'Children and adolescent care', headId: 'user-3', maxHoursPerDoctor: 40, doctorCount: 6, color: '#22c55e', isActive: true },
  { id: 'dept-4', name: 'Neurology', description: 'Brain and nervous system', headId: 'user-4', maxHoursPerDoctor: 42, doctorCount: 5, color: '#a855f7', isActive: true },
  { id: 'dept-5', name: 'Surgery', description: 'General and specialized surgery', headId: 'user-5', maxHoursPerDoctor: 48, doctorCount: 10, color: '#f59e0b', isActive: true },
  { id: 'dept-6', name: 'Orthopedics', description: 'Musculoskeletal system', headId: null, maxHoursPerDoctor: 40, doctorCount: 7, color: '#06b6d4', isActive: true },
];

/** Mock users/staff */
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Dr. Sarah Chen', email: 'sarah.chen@hospital.com', phone: '+1-555-0101', role: 'doctor', specialty: 'Emergency Medicine', departmentId: 'dept-1', status: 'active', joinDate: '2021-03-15' },
  { id: 'user-2', name: 'Dr. James Wilson', email: 'james.wilson@hospital.com', phone: '+1-555-0102', role: 'doctor', specialty: 'Cardiology', departmentId: 'dept-2', status: 'active', joinDate: '2019-08-20' },
  { id: 'user-3', name: 'Dr. Maria Garcia', email: 'maria.garcia@hospital.com', phone: '+1-555-0103', role: 'department_head', specialty: 'Pediatrics', departmentId: 'dept-3', status: 'active', joinDate: '2018-01-10' },
  { id: 'user-4', name: 'Dr. Ahmed Hassan', email: 'ahmed.hassan@hospital.com', phone: '+1-555-0104', role: 'doctor', specialty: 'Neurology', departmentId: 'dept-4', status: 'on_leave', joinDate: '2020-06-01' },
  { id: 'user-5', name: 'Dr. Emily Zhang', email: 'emily.zhang@hospital.com', phone: '+1-555-0105', role: 'doctor', specialty: 'Surgery', departmentId: 'dept-5', status: 'active', joinDate: '2022-02-14' },
  { id: 'user-6', name: 'Nurse Rachel Kim', email: 'rachel.kim@hospital.com', phone: '+1-555-0106', role: 'nurse', specialty: 'Emergency Medicine', departmentId: 'dept-1', status: 'active', joinDate: '2021-09-01' },
  { id: 'user-7', name: 'Dr. Michael Brown', email: 'michael.brown@hospital.com', phone: '+1-555-0107', role: 'doctor', specialty: 'Orthopedics', departmentId: 'dept-6', status: 'active', joinDate: '2020-11-30' },
  { id: 'user-8', name: 'Nurse Lisa Park', email: 'lisa.park@hospital.com', phone: '+1-555-0108', role: 'nurse', specialty: 'Cardiology', departmentId: 'dept-2', status: 'active', joinDate: '2023-01-15' },
  { id: 'user-9', name: 'Dr. David Lee', email: 'david.lee@hospital.com', phone: '+1-555-0109', role: 'doctor', specialty: 'Cardiology', departmentId: 'dept-2', status: 'inactive', joinDate: '2017-05-20' },
  { id: 'user-10', name: 'Admin John Smith', email: 'john.smith@hospital.com', phone: '+1-555-0110', role: 'admin', specialty: '', departmentId: '', status: 'active', joinDate: '2016-01-01' },
];

/** Mock schedule entries for the current week */
export const mockScheduleEntries: ScheduleEntry[] = [
  { id: 'sch-1', userId: 'user-1', shiftId: 'shift-1', date: '2026-02-13', departmentId: 'dept-1', shiftType: 'morning', status: 'confirmed', isOnCall: false },
  { id: 'sch-2', userId: 'user-2', shiftId: 'shift-2', date: '2026-02-13', departmentId: 'dept-2', shiftType: 'morning', status: 'scheduled', isOnCall: false },
  { id: 'sch-3', userId: 'user-5', shiftId: 'shift-3', date: '2026-02-13', departmentId: 'dept-5', shiftType: 'evening', status: 'confirmed', isOnCall: true },
  { id: 'sch-4', userId: 'user-6', shiftId: 'shift-4', date: '2026-02-13', departmentId: 'dept-1', shiftType: 'night', status: 'scheduled', isOnCall: false },
  { id: 'sch-5', userId: 'user-7', shiftId: 'shift-5', date: '2026-02-14', departmentId: 'dept-6', shiftType: 'morning', status: 'scheduled', isOnCall: false },
  { id: 'sch-6', userId: 'user-1', shiftId: 'shift-6', date: '2026-02-14', departmentId: 'dept-1', shiftType: 'evening', status: 'confirmed', isOnCall: false },
  { id: 'sch-7', userId: 'user-3', shiftId: 'shift-7', date: '2026-02-15', departmentId: 'dept-3', shiftType: 'morning', status: 'scheduled', isOnCall: false },
  { id: 'sch-8', userId: 'user-8', shiftId: 'shift-8', date: '2026-02-15', departmentId: 'dept-2', shiftType: 'night', status: 'scheduled', isOnCall: true },
];

/** Mock leave requests */
export const mockLeaveRequests: LeaveRequest[] = [
  { id: 'leave-1', userId: 'user-4', startDate: '2026-02-10', endDate: '2026-02-17', reason: 'Personal leave', status: 'approved', createdAt: '2026-02-05' },
  { id: 'leave-2', userId: 'user-2', startDate: '2026-02-20', endDate: '2026-02-22', reason: 'Conference attendance', status: 'pending', createdAt: '2026-02-12' },
  { id: 'leave-3', userId: 'user-7', startDate: '2026-02-25', endDate: '2026-02-28', reason: 'Family emergency', status: 'pending', createdAt: '2026-02-13' },
];

/** Mock notifications */
export const mockNotifications: Notification[] = [
  { id: 'notif-1', userId: 'user-1', title: 'Shift Assigned', message: 'You have been assigned morning shift on Feb 13', type: 'shift', isRead: false, createdAt: '2026-02-12T10:00:00' },
  { id: 'notif-2', userId: 'user-5', title: 'On-Call Duty', message: 'You are on-call for Surgery on Feb 13 evening', type: 'emergency', isRead: false, createdAt: '2026-02-12T14:30:00' },
  { id: 'notif-3', userId: 'user-2', title: 'Leave Request Update', message: 'Your leave request is pending approval', type: 'leave', isRead: true, createdAt: '2026-02-12T09:00:00' },
];
