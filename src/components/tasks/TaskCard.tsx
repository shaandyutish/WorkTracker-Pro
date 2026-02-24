import { Task, TaskStatus } from '../../types';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { getUsers } from '../../store/dataStore';
import { Calendar, Edit2, Trash2, Eye } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  showAssignee?: boolean;
  isAdmin?: boolean;
}

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  showAssignee = true,
  isAdmin = false,
}: TaskCardProps) => {
  const users = getUsers();
  const assignee = users.find(u => u.id === task.assignedTo);
  const isOverdue = task.status !== 'Completed' && isPast(parseISO(task.deadline));

  const statusOptions: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

  return (
    <div className={cn(
      'card-hover bg-white rounded-2xl border border-slate-100 p-5 shadow-sm',
      isOverdue && 'border-red-200'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">
            {task.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onView && (
            <button
              onClick={onView}
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
              title="View details"
            >
              <Eye size={14} />
            </button>
          )}
          {isAdmin && onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit task"
            >
              <Edit2 size={14} />
            </button>
          )}
          {isAdmin && onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        {isOverdue && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200">
            Overdue
          </span>
        )}
      </div>

      {/* Deadline & Assignee */}
      <div className="flex items-center justify-between">
        <div className={cn(
          'flex items-center gap-1.5 text-xs',
          isOverdue ? 'text-red-500' : 'text-slate-400'
        )}>
          <Calendar size={12} />
          <span>{format(parseISO(task.deadline), 'MMM d, yyyy')}</span>
        </div>

        {showAssignee && assignee && (
          <div className="flex items-center gap-1.5">
            <Avatar initials={assignee.avatar} name={assignee.name} size="sm" />
            <span className="text-xs text-slate-500 hidden sm:block">{assignee.name.split(' ')[0]}</span>
          </div>
        )}
      </div>

      {/* Status Change (Employee) */}
      {!isAdmin && onStatusChange && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Update Status</label>
          <div className="flex gap-2">
            {statusOptions.map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={cn(
                  'flex-1 py-1.5 text-xs rounded-lg font-medium transition-all border',
                  task.status === s
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                )}
              >
                {s === 'In Progress' ? 'In Prog.' : s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
