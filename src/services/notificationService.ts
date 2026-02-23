/**
 * File: services/notificationService.ts
 * Purpose: Service layer for notification-related API operations.
 * Handles all notification CRUD operations with Laravel backend.
 */

import api from '@/lib/api';

export interface Notification {
  id: number;
  userId: number;
  userName?: string;
  title: string;
  message: string;
  type: 'shift' | 'swap' | 'leave' | 'emergency' | 'general';
  isRead: boolean;
  relatedId?: number | null;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
}

/** Fetch all notifications, optionally filtered */
export const getNotifications = async (filters?: {
  userId?: number;
  isRead?: boolean;
  type?: string;
}): Promise<Notification[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.userId) params.append('user_id', filters.userId.toString());
    if (filters?.isRead !== undefined) params.append('is_read', filters.isRead.toString());
    if (filters?.type) params.append('type', filters.type);

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/** Create a new notification */
export const createNotification = async (data: {
  userId: number;
  title: string;
  message: string;
  type: 'shift' | 'swap' | 'leave' | 'emergency' | 'general';
  relatedId?: number;
}): Promise<Notification> => {
  const response = await api.post('/notifications', {
    user_id: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    related_id: data.relatedId,
  });
  return response.data.data;
};

/** Get notification statistics */
export const getNotificationStats = async (userId?: number): Promise<NotificationStats> => {
  try {
    const params = userId ? `?user_id=${userId}` : '';
    const response = await api.get(`/notifications-stats${params}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return { total: 0, unread: 0, read: 0, byType: {} };
  }
};

/** Mark a notification as read */
export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};

/** Mark all notifications as read */
export const markAllNotificationsAsRead = async (userId?: number): Promise<void> => {
  const params = userId ? `?user_id=${userId}` : '';
  await api.post(`/notifications/read-all${params}`);
};

/** Delete a notification */
export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

/** Clear all read notifications */
export const clearReadNotifications = async (userId?: number): Promise<void> => {
  const params = userId ? `?user_id=${userId}` : '';
  await api.post(`/notifications/clear-read${params}`);
};
