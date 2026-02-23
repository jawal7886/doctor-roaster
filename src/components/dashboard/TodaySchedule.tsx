/**
 * File: components/dashboard/TodaySchedule.tsx
 * Purpose: Shows today's schedule summary on the dashboard.
 * Lists active shifts with assigned doctors for the current day.
 */

import { useState, useEffect } from 'react';
import { Clock, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleEntry } from '@/types';
import { getSchedules } from '@/services/scheduleService';
import { SHIFT_LABELS, SHIFT_TIMES } from '@/constants';
import { Badge } from '@/components/ui/badge';

const TodaySchedule = () => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaySchedule();
  }, []);

  const loadTodaySchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await getSchedules({
        startDate: today,
        endDate: today,
      });
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load today schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-card-foreground">Today's Schedule</h3>
        <p className="text-xs text-muted-foreground">{todayDate}</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-muted-foreground">Loading schedule...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CalendarIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">No shifts scheduled for today</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {schedules.map((entry) => {
            const shiftTime = SHIFT_TIMES[entry.shiftType];

            return (
              <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50">
                {/* Shift time indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="w-20 font-mono">{shiftTime.start}–{shiftTime.end}</span>
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{entry.userName}</p>
                  <p className="text-xs text-muted-foreground">{entry.departmentName}</p>
                </div>

                {/* Shift badge */}
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] font-medium',
                    entry.shiftType === 'morning' && 'bg-info/10 text-info',
                    entry.shiftType === 'evening' && 'bg-warning/10 text-warning',
                    entry.shiftType === 'night' && 'bg-primary/10 text-primary'
                  )}
                >
                  {SHIFT_LABELS[entry.shiftType]}
                </Badge>

                {/* On-call indicator */}
                {entry.isOnCall && (
                  <div className="flex items-center gap-1 text-destructive">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium">On-Call</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaySchedule;
