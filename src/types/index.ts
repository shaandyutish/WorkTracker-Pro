export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  department: string;
  createdAt: string;
}

export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  deadline: string;
  assignedTo: string; // user id
  createdBy: string; // admin user id
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  deadline: string;
  assignedTo: string;
}
