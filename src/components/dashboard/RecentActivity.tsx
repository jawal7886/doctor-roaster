/**
 * File: components/dashboard/RecentActivity.tsx
 * Purpose: Shows recent notifications/activity feed on the dashboard.
 */

import { useState, useEffect } from 'react';
import { Bell, CalendarDays, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSchedules } from '@/services/scheduleService';
import { getLeaveRequests } from '@/services/leaveService';
import { ScheduleEntry, LeaveRequest } from '@/types';

interface Activity {
  id: string;
  type: 'schedule' | 'leave_pending' | 'leave_approved' | 'leave_rejected';
  title: string;
  message: string;
  timestamp: string;
  icon: React.ElementType;
  colorClass: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      
      // Get recent schedules (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      const [schedules, leaves] = await Promise.all([
        getSchedules({ startDate, endDate: today }),
        getLeaveRequests(),
      ]);

      const activityList: Activity[] = [];

      // Add schedule activities
      schedules.slice(0, 5).forEach((schedule: ScheduleEntry) => {
        activityList.push({
          id: `schedule-${schedule.id}`,
          type: 'schedule',
          title: 'Shift Scheduled',
          message: `${schedule.userName || 'Staff'} scheduled for ${schedule.shiftType} shift on ${new Date(schedule.date).toLocaleDateString()}`,
          timestamp: schedule.createdAt || schedule.date,
          icon: CalendarDays,
          colorClass: 'bg-info/10 text-info',
        });
      });

      // Add leave request activities
      leaves.slice(0, 5).forEach((leave: LeaveRequest) => {
        let type: Activity['type'] = 'leave_pending';
        let icon = Clock;
        let colorClass = 'bg-warning/10 text-warning';
        let title = 'Leave Request Pending';

        if (leave.status === 'approved') {
          type = 'leave_approved';
          icon = CheckCircle;
          colorClass = 'bg-accent/10 text-accent';
          title = 'Leave Approved';
        } else if (leave.status === 'rejected') {
          type = 'leave_rejected';
          icon = XCircle;
          colorClass = 'bg-destructive/10 text-destructive';
          title = 'Leave Rejected';
        }

        activityList.push({
          id: `leave-${leave.id}`,
          type,
          title,
          message: `Leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
          timestamp: leave.createdAt,
          icon,
          colorClass,
        });
      });

      // Sort by timestamp (most recent first)
      activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Take only the 10 most recent
      setActivities(activityList.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-card-foreground">Recent Activity</h3>
        <p className="text-xs text-muted-foreground">Latest notifications & updates</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
              >
                <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', activity.colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
