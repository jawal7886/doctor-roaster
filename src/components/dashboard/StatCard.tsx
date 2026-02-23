/**
 * File: components/dashboard/StatCard.tsx
 * Purpose: Reusable statistics card for the dashboard.
 * Displays a metric with icon, value, and change indicator.
 */

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  /** Card title label */
  title: string;
  /** Main metric value */
  value: string | number;
  /** Change percentage or description */
  change?: string;
  /** Direction of change */
  changeType?: 'positive' | 'negative' | 'neutral';
  /** Icon component to display */
  icon: React.ReactNode;
  /** Optional accent color class */
  accentClass?: string;
}

const StatCard = ({ title, value, change, changeType = 'neutral', icon, accentClass }: StatCardProps) => {
  return (
    <div className="card-hover rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        {/* Label and value */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
          {/* Change indicator */}
          {change && (
            <div className="flex items-center gap-1">
              {changeType === 'positive' && <TrendingUp className="h-3 w-3 text-success" />}
              {changeType === 'negative' && <TrendingDown className="h-3 w-3 text-destructive" />}
              {changeType === 'neutral' && <Minus className="h-3 w-3 text-muted-foreground" />}
              <span
                className={cn(
                  'text-xs font-medium',
                  changeType === 'positive' && 'text-success',
                  changeType === 'negative' && 'text-destructive',
                  changeType === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', accentClass || 'bg-primary/10 text-primary')}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
