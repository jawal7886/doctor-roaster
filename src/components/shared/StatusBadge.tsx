/**
 * File: components/shared/StatusBadge.tsx
 * Purpose: Reusable status badge component for showing user/entity status.
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  /** Status string to display */
  status: string;
  /** Optional size variant */
  size?: 'sm' | 'default';
}

/** Map status values to visual styles */
const statusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-border',
  on_leave: 'bg-warning/10 text-warning border-warning/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  scheduled: 'bg-info/10 text-info border-info/20',
  swapped: 'bg-accent/10 text-accent border-accent/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

/** Format status string for display */
const formatStatus = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const StatusBadge = ({ status, size = 'default' }: StatusBadgeProps) => {
  const style = statusStyles[status] || statusStyles.inactive;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        style,
        size === 'sm' && 'text-[10px] px-1.5 py-0'
      )}
    >
      {formatStatus(status)}
    </Badge>
  );
};

export default StatusBadge;
