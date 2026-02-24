import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, TaskFormData } from '../types';
import { getTasks, saveTasks, generateId } from '../store/dataStore';

interface TaskContextType {
  tasks: Task[];
  addTask: (data: TaskFormData, createdById: string) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksForUser: (userId: string) => Task[];
}

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(() => {
    setTasks(getTasks());
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = (data: TaskFormData, createdById: string) => {
    const newTask: Task = {
      id: generateId(),
      ...data,
      createdBy: createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    saveTasks(updated);
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const getTaskById = (id: string) => tasks.find((t) => t.id === id);

  const getTasksForUser = (userId: string) => tasks.filter((t) => t.assignedTo === userId);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTaskById, getTasksForUser }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
