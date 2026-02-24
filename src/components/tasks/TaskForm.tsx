import { useState } from 'react';
import { Task, TaskFormData, Priority, TaskStatus } from '../../types';
import { getUsers } from '../../store/dataStore';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TaskForm = ({ initialData, onSubmit, onCancel, isLoading }: TaskFormProps) => {
  const employees = getUsers().filter(u => u.role === 'employee');

  const [form, setForm] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'Medium',
    status: initialData?.status || 'Pending',
    deadline: initialData?.deadline || '',
    assignedTo: initialData?.assignedTo || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const validate = () => {
    const errs: Partial<Record<keyof TaskFormData, string>> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.deadline) errs.deadline = 'Deadline is required';
    if (!form.assignedTo) errs.assignedTo = 'Please assign this task to an employee';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  const inputClass = (field: keyof TaskFormData) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Task Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: '' })); }}
          className={inputClass('title')}
          placeholder="Enter task title..."
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
        <textarea
          value={form.description}
          onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setErrors(p => ({ ...p, description: '' })); }}
          rows={3}
          className={inputClass('description')}
          placeholder="Describe the task in detail..."
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
          <select
            value={form.priority}
            onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select
            value={form.status}
            onChange={e => setForm(p => ({ ...p, status: e.target.value as TaskStatus }))}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline *</label>
          <input
            type="date"
            value={form.deadline}
            onChange={e => { setForm(p => ({ ...p, deadline: e.target.value })); setErrors(p => ({ ...p, deadline: '' })); }}
            className={inputClass('deadline')}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>}
        </div>

        {/* Assign To */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To *</label>
          <select
            value={form.assignedTo}
            onChange={e => { setForm(p => ({ ...p, assignedTo: e.target.value })); setErrors(p => ({ ...p, assignedTo: '' })); }}
            className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${errors.assignedTo ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
          >
            <option value="">Select employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} — {emp.department}
              </option>
            ))}
          </select>
          {errors.assignedTo && <p className="mt-1 text-xs text-red-500">{errors.assignedTo}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};
