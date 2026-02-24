import { useMemo } from 'react';
import { getUsers } from '../../store/dataStore';
import { useTasks } from '../../context/TaskContext';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { Mail, Building2, CheckCircle2, Clock, ListTodo } from 'lucide-react';

export const AdminUsers = () => {
  const { tasks } = useTasks();
  const users = getUsers();
  const employees = users.filter(u => u.role === 'employee');

  const employeeData = useMemo(() => {
    return employees.map(emp => {
      const empTasks = tasks.filter(t => t.assignedTo === emp.id);
      const completed = empTasks.filter(t => t.status === 'Completed').length;
      const inProgress = empTasks.filter(t => t.status === 'In Progress').length;
      const pending = empTasks.filter(t => t.status === 'Pending').length;
      const rate = empTasks.length > 0 ? Math.round((completed / empTasks.length) * 100) : 0;
      return { ...emp, total: empTasks.length, completed, inProgress, pending, rate, recentTasks: empTasks.slice(0, 3) };
    });
  }, [employees, tasks]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mt-1">{employees.length} active employees in the system</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Employees</p>
          <p className="text-3xl font-bold text-slate-900">{employees.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Tasks Assigned</p>
          <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Avg. Completion</p>
          <p className="text-3xl font-bold text-slate-900">
            {employees.length > 0
              ? Math.round(employeeData.reduce((sum, e) => sum + e.rate, 0) / employees.length)
              : 0}%
          </p>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {employeeData.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover">
            {/* Header */}
            <div className="p-5 flex items-start gap-4">
              <Avatar initials={emp.avatar} name={emp.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{emp.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Building2 size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500">{emp.department}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-400">{emp.email}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{emp.rate}%</div>
                <div className="text-xs text-slate-400">completion</div>
              </div>
            </div>

            {/* Progress */}
            <div className="px-5 pb-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${emp.rate}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                  <ListTodo size={12} />
                  <span className="text-xs">Total</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{emp.total}</p>
              </div>
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                  <Clock size={12} />
                  <span className="text-xs">Active</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{emp.inProgress}</p>
              </div>
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                  <CheckCircle2 size={12} />
                  <span className="text-xs">Done</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{emp.completed}</p>
              </div>
            </div>

            {/* Recent tasks */}
            {emp.recentTasks.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Tasks</p>
                <div className="space-y-1.5">
                  {emp.recentTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between">
                      <p className="text-xs text-slate-600 truncate flex-1 mr-2">{task.title}</p>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
