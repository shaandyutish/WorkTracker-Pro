import { useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { getUsers } from '../../store/dataStore';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import {
  CheckCircle2, Clock, ListTodo, Users, TrendingUp, AlertTriangle
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { cn } from '../../utils/cn';

const StatCard = ({
  label, value, icon: Icon, color, sub
}: {
  label: string; value: number | string; icon: React.ElementType;
  color: string; sub?: string;
}) => (
  <div className="card-hover bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { tasks } = useTasks();
  const users = getUsers();
  const employees = users.filter(u => u.role === 'employee');

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const overdue = tasks.filter(t => t.status !== 'Completed' && isPast(parseISO(t.deadline))).length;
    const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;
    return { total, completed, pending, inProgress, overdue, highPriority };
  }, [tasks]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const employeeStats = employees.map(emp => {
    const empTasks = tasks.filter(t => t.assignedTo === emp.id);
    return {
      ...emp,
      total: empTasks.length,
      completed: empTasks.filter(t => t.status === 'Completed').length,
      inProgress: empTasks.filter(t => t.status === 'In Progress').length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} color="bg-violet-500" sub="All assigned tasks" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="bg-emerald-500" sub={`${completionRate}% completion rate`} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="bg-amber-500" sub={`${stats.inProgress} in progress`} />
        <StatCard label="Total Users" value={employees.length} icon={Users} color="bg-blue-500" sub="Active employees" />
      </div>

      {/* Progress & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Completion Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Task Overview</h3>
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <TrendingUp size={16} />
              {completionRate}% done
            </div>
          </div>

          {/* Progress bars */}
          <div className="space-y-3">
            {[
              { label: 'Completed', count: stats.completed, total: stats.total, color: 'bg-emerald-500' },
              { label: 'In Progress', count: stats.inProgress, total: stats.total, color: 'bg-blue-500' },
              { label: 'Pending', count: stats.pending, total: stats.total, color: 'bg-amber-400' },
            ].map(({ label, count, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="text-slate-400">{count} / {total}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', color)}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Alerts</h3>
          <div className="space-y-3">
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              stats.overdue > 0 ? 'bg-red-50 border border-red-100' : 'bg-slate-50'
            )}>
              <div className={cn('p-2 rounded-lg', stats.overdue > 0 ? 'bg-red-100' : 'bg-slate-100')}>
                <AlertTriangle size={16} className={stats.overdue > 0 ? 'text-red-500' : 'text-slate-400'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{stats.overdue} Overdue</p>
                <p className="text-xs text-slate-400">Tasks past deadline</p>
              </div>
            </div>
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              stats.highPriority > 0 ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50'
            )}>
              <div className={cn('p-2 rounded-lg', stats.highPriority > 0 ? 'bg-orange-100' : 'bg-slate-100')}>
                <AlertTriangle size={16} className={stats.highPriority > 0 ? 'text-orange-500' : 'text-slate-400'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{stats.highPriority} High Priority</p>
                <p className="text-xs text-slate-400">Urgent incomplete tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks & Employee Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Tasks</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTasks.map(task => {
              const assignee = users.find(u => u.id === task.assignedTo);
              return (
                <div key={task.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-slate-400">
                        {format(parseISO(task.deadline), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={task.status} />
                    {assignee && <Avatar initials={assignee.avatar} size="sm" name={assignee.name} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Employee Stats */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Employee Performance</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {employeeStats.map(emp => (
              <div key={emp.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar initials={emp.avatar} name={emp.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-800">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.completed}/{emp.total} done</p>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: emp.total > 0 ? `${(emp.completed / emp.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
