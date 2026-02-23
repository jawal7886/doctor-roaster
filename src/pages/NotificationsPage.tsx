/**
 * File: pages/NotificationsPage.tsx
 * Purpose: Notifications center showing all alerts and updates.
 */

import { useState, useEffect } from 'react';
import { Bell, CalendarDays, AlertTriangle, ArrowRightLeft, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications,
  Notification,
} from '@/services/notificationService';

/** Map notification type to icon */
const typeIcons: Record<string, React.ElementType> = {
  shift: CalendarDays,
  swap: ArrowRightLeft,
  leave: CalendarDays,
  emergency: AlertTriangle,
  general: Bell,
};

const typeColors: Record<string, string> = {
  shift: 'bg-info/10 text-info',
  swap: 'bg-accent/10 text-accent',
  leave: 'bg-warning/10 text-warning',
  emergency: 'bg-destructive/10 text-destructive',
  general: 'bg-muted text-muted-foreground',
};

const NotificationsPage = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      // Trigger event to update header badge
      window.dispatchEvent(new CustomEvent('notificationRead'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
      // Trigger event to update header badge
      window.dispatchEvent(new CustomEvent('notificationRead'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
      // Trigger event to update header badge
      window.dispatchEvent(new CustomEvent('notificationRead'));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const handleClearRead = async () => {
    try {
      setActionLoading(true);
      await clearReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
      toast({
        title: 'Success',
        description: 'Read notifications cleared',
      });
      // Trigger event to update header badge
      window.dispatchEvent(new CustomEvent('notificationRead'));
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear read notifications',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notifications"
        description="Stay updated with shift changes, approvals, and alerts"
        actions={
          <div className="flex gap-2">
            {readCount > 0 && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleClearRead}
                disabled={actionLoading}
              >
                <Trash2 className="h-4 w-4" />
                Clear Read
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleMarkAllAsRead}
                disabled={actionLoading}
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-card-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => {
              const Icon = typeIcons[notif.type] || Bell;
              const colorClass = typeColors[notif.type] || typeColors.general;

              return (
                <div
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30',
                    !notif.isRead && 'bg-primary/[0.02]'
                  )}
                >
                  <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-card-foreground">{notif.title}</h4>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notif.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.isRead && (
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDelete(notif.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
