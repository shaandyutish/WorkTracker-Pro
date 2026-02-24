import { useState, useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Task, TaskStatus, Priority } from '../../types';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { Search, Filter } from 'lucide-react';

export const EmployeeTasks = () => {
  const { user } = useAuth();
  const { tasks, updateTask } = useTasks();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [viewTask, setViewTask] = useState<Task | null>(null);

  const myTasks = useMemo(() =>
    tasks.filter(t => t.assignedTo === user?.id),
    [tasks, user]
  );

  const filtered = useMemo(() => {
    return myTasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [myTasks, search, filterStatus, filterPriority]);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
    if (viewTask?.id === taskId) {
      setViewTask(prev => prev ? { ...prev, status } : null);
    }
  };

  const selectClass = 'px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400';

  // Group by status for kanban-style display
  const groups: { label: TaskStatus; tasks: Task[] }[] = [
    { label: 'Pending', tasks: filtered.filter(t => t.status === 'Pending') },
    { label: 'In Progress', tasks: filtered.filter(t => t.status === 'In Progress') },
    { label: 'Completed', tasks: filtered.filter(t => t.status === 'Completed') },
  ];

  const groupColors: Record<TaskStatus, string> = {
    'Pending': 'border-amber-300 bg-amber-50 text-amber-700',
    'In Progress': 'border-blue-300 bg-blue-50 text-blue-700',
    'Completed': 'border-emerald-300 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your tasks..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter size={15} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | 'All')} className={selectClass}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | 'All')} className={selectClass}>
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {myTasks.length} assigned tasks
      </p>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {groups.map(({ label, tasks: groupTasks }) => (
          <div key={label} className="space-y-3">
            {/* Column Header */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${groupColors[label]}`}>
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">
                {groupTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="space-y-3">
              {groupTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showAssignee={false}
                  onView={() => setViewTask(task)}
                  onStatusChange={(s) => handleStatusChange(task.id, s)}
                />
              ))}
              {groupTasks.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-xs text-slate-400">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={viewTask}
        isOpen={!!viewTask}
        onClose={() => setViewTask(null)}
        onStatusChange={(s) => {
          if (viewTask) handleStatusChange(viewTask.id, s);
        }}
      />
    </div>
  );
};
