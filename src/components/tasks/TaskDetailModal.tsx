import { Task, TaskStatus } from '../../types';
import { Modal } from '../ui/Modal';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { getUsers } from '../../store/dataStore';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../../utils/cn';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  isAdmin?: boolean;
}

export const TaskDetailModal = ({ task, isOpen, onClose, onStatusChange, isAdmin }: TaskDetailModalProps) => {
  if (!task) return null;

  const users = getUsers();
  const assignee = users.find(u => u.id === task.assignedTo);
  const creator = users.find(u => u.id === task.createdBy);
  const statusOptions: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
      <div className="space-y-5">
        {/* Title & Badges */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">{task.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {format(parseISO(task.deadline), 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {format(parseISO(task.createdAt), 'MMM d, yyyy')}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</span>
            </div>
            {assignee && (
              <div className="flex items-center gap-2">
                <Avatar initials={assignee.avatar} name={assignee.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{assignee.name}</p>
                  <p className="text-xs text-slate-400">{assignee.department}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</span>
            </div>
            {creator && (
              <div className="flex items-center gap-2">
                <Avatar initials={creator.avatar} name={creator.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{creator.name}</p>
                  <p className="text-xs text-slate-400">{creator.department}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status update for employee */}
        {!isAdmin && onStatusChange && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Update Status</p>
            <div className="flex gap-2">
              {statusOptions.map(s => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(s); onClose(); }}
                  className={cn(
                    'flex-1 py-2 text-sm rounded-xl font-medium transition-all border',
                    task.status === s
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
