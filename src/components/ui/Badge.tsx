import { Priority, TaskStatus } from '../../types';
import { getPriorityColor, getStatusColor, getStatusDot } from '../../store/dataStore';
import { cn } from '../../utils/cn';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const icons: Record<Priority, string> = {
    High: '↑',
    Medium: '→',
    Low: '↓',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      getPriorityColor(priority),
      className
    )}>
      <span>{icons[priority]}</span>
      {priority}
    </span>
  );
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      getStatusColor(status),
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', getStatusDot(status))} />
      {status}
    </span>
  );
};
