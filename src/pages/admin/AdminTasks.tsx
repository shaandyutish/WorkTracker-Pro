import { useState, useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from '../../store/dataStore';
import { Task, TaskFormData, Priority, TaskStatus } from '../../types';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { TaskForm } from '../../components/tasks/TaskForm';
import { Modal } from '../../components/ui/Modal';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format, parseISO } from 'date-fns';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';

type ViewMode = 'grid' | 'list';

export const AdminTasks = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { user } = useAuth();
  const users = getUsers();

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'All'>('All');
  const [filterUser, setFilterUser] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null);

  const employees = users.filter((u) => u.role === 'employee');

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchUser = filterUser === 'All' || t.assignedTo === filterUser;
      return matchSearch && matchPriority && matchStatus && matchUser;
    });
  }, [tasks, search, filterPriority, filterStatus, filterUser]);

  const handleCreate = (data: TaskFormData) => {
    addTask(data, user?.id || 'u1');
    setShowCreateModal(false);
  };

  const handleEdit = (data: TaskFormData) => {
    if (editTask) {
      updateTask(editTask.id, data);
      setEditTask(null);
    }
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteTask(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const selectClass =
    'px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400';

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter size={15} />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'All')}
            className={selectClass}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
            className={selectClass}
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className={selectClass}
          >
            <option value="All">All Users</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-slate-400 hover:text-slate-600'
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-slate-400 hover:text-slate-600'
              )}
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
        {tasks.length} tasks
      </p>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isAdmin
              showAssignee
              onView={() => setViewTask(task)}
              onEdit={() => setEditTask(task)}
              onDelete={() => setDeleteConfirm(task)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="font-medium">No tasks found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1">Deadline</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-50">
            {filtered.map((task) => {
              const assignee = users.find((u) => u.id === task.assignedTo);
              return (
                <div
                  key={task.id}
                  className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors gap-2 sm:gap-0"
                >
                  <div className="sm:col-span-4">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="sm:col-span-2">
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    {assignee && (
                      <>
                        <Avatar initials={assignee.avatar} size="sm" name={assignee.name} />
                        <span className="text-xs text-slate-600 hidden lg:block">
                          {assignee.name.split(' ')[0]}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="sm:col-span-1 text-xs text-slate-400">
                    {format(parseISO(task.deadline), 'MMM d')}
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => setViewTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors text-xs"
                    >
                      Del
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="font-medium">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && (
          <TaskForm
            initialData={editTask}
            onSubmit={handleEdit}
            onCancel={() => setEditTask(null)}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <TaskDetailModal
        task={viewTask}
        isOpen={!!viewTask}
        onClose={() => setViewTask(null)}
        isAdmin
      />

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Task"
        size="sm"
      >
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗑️</span>
          </div>
          <p className="text-slate-700 mb-1 font-medium">Delete "{deleteConfirm?.title}"?</p>
          <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
