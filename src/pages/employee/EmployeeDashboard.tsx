import { useMemo, useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { Task, TaskStatus } from '../../types';
import { CheckCircle2, Clock, ListTodo, AlertTriangle, TrendingUp } from 'lucide-react';
import { isPast, parseISO, format } from 'date-fns';
import { cn } from '../../utils/cn';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { tasks, updateTask } = useTasks();
  const [viewTask, setViewTask] = useState<Task | null>(null);

  const myTasks = useMemo(() =>
    tasks.filter(t => t.assignedTo === user?.id),
    [tasks, user]
  );

  const stats = useMemo(() => {
    const total = myTasks.length;
    const completed = myTasks.filter(t => t.status === 'Completed').length;
    const pending = myTasks.filter(t => t.status === 'Pending').length;
    const inProgress = myTasks.filter(t => t.status === 'In Progress').length;
    const overdue = myTasks.filter(t => t.status !== 'Completed' && isPast(parseISO(t.deadline))).length;
    return { total, completed, pending, inProgress, overdue };
  }, [myTasks]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const urgentTasks = myTasks
    .filter(t => t.status !== 'Completed' && (t.priority === 'High' || isPast(parseISO(t.deadline))))
    .slice(0, 3);

  const recentTasks = [...myTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-5 text-white">
        <p className="text-violet-200 text-sm mb-1">Welcome back 👋</p>
        <h2 className="text-2xl font-bold">{user?.name}</h2>
        <p className="text-violet-200 text-sm mt-1">{user?.department} Department</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div
              className="h-2 bg-white rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{completionRate}% complete</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Tasks', value: stats.total, icon: ListTodo, color: 'bg-violet-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-emerald-500' },
          { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'bg-blue-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-hover bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                <Icon size={18} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">
              You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-500">Please update these tasks as soon as possible.</p>
          </div>
        </div>
      )}

      {/* Two Column: Urgent + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Urgent Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Needs Attention</h3>
            <span className="text-xs text-slate-400">{urgentTasks.length} tasks</span>
          </div>
          <div className="p-4 space-y-3">
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">All caught up!</p>
                <p className="text-xs text-slate-400">No urgent tasks right now</p>
              </div>
            ) : (
              urgentTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showAssignee={false}
                  onView={() => setViewTask(task)}
                  onStatusChange={(s) => handleStatusChange(task.id, s)}
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No tasks yet</p>
              </div>
            ) : (
              recentTasks.map(task => (
                <div
                  key={task.id}
                  className="px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setViewTask(task)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs text-slate-400">
                          Due {format(parseISO(task.deadline), 'MMM d')}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={viewTask}
        isOpen={!!viewTask}
        onClose={() => setViewTask(null)}
        onStatusChange={(s) => {
          if (viewTask) handleStatusChange(viewTask.id, s);
          setViewTask(null);
        }}
      />
    </div>
  );
};
