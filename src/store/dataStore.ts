import { User, Task, Priority, TaskStatus } from '../types';

// Simulated hashed passwords (in real app, use bcrypt)
const hashPassword = (password: string): string => {
  return btoa(password + '_taskflow_salt_2024');
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

const USERS_KEY = 'taskflow_users';
const TASKS_KEY = 'taskflow_tasks';
const AUTH_KEY = 'taskflow_auth';

const defaultUsers: User[] = [
  {
    id: 'u1',
    name: 'Dyutishmaan Das',
    email: 'admin@worktrackerpro.com',
    password: hashPassword('admin123'),
    role: 'admin',
    avatar: 'AR',
    department: 'Management',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Shiv Mishra',
    email: 'shiv@worktrackerpro.com',
    password: hashPassword('emp123'),
    role: 'employee',
    avatar: 'JW',
    department: 'Engineering',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'Kush Bansal',
    email: 'kush@worktrackerpro.com',
    password: hashPassword('emp123'),
    role: 'employee',
    avatar: 'SC',
    department: 'Design',
    createdAt: '2024-01-06T00:00:00Z',
  },
  {
    id: 'u4',
    name: 'Lakshya Kumar',
    email: 'lakshya@worktrackerpro.com',
    password: hashPassword('emp123'),
    role: 'employee',
    avatar: 'MT',
    department: 'Marketing',
    createdAt: '2024-01-07T00:00:00Z',
  },
  {
    id: 'u5',
    name: 'Roshni Kumari',
    email: 'roshni@worktrackerpro.com',
    password: hashPassword('emp123'),
    role: 'employee',
    avatar: 'EJ',
    department: 'Engineering',
    createdAt: '2024-01-08T00:00:00Z',
  },
];

const defaultTasks: Task[] = [
  {
    id: 't1',
    title: 'Design new landing page',
    description: 'Create a modern and responsive landing page for the product relaunch. Include hero section, features, testimonials, and CTA.',
    priority: 'High',
    status: 'In Progress',
    deadline: '2025-02-15',
    assignedTo: 'u3',
    createdBy: 'u1',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-12T14:30:00Z',
  },
  {
    id: 't2',
    title: 'Implement authentication API',
    description: 'Build secure JWT-based authentication endpoints including login, logout, refresh tokens, and password reset functionality.',
    priority: 'High',
    status: 'Completed',
    deadline: '2025-01-31',
    assignedTo: 'u2',
    createdBy: 'u1',
    createdAt: '2025-01-08T10:00:00Z',
    updatedAt: '2025-01-28T16:00:00Z',
  },
  {
    id: 't3',
    title: 'Create Q1 marketing campaign',
    description: 'Develop and execute a comprehensive marketing campaign for Q1. Includes social media strategy, email sequences, and ad creatives.',
    priority: 'Medium',
    status: 'Pending',
    deadline: '2025-03-01',
    assignedTo: 'u4',
    createdBy: 'u1',
    createdAt: '2025-01-15T11:00:00Z',
    updatedAt: '2025-01-15T11:00:00Z',
  },
  {
    id: 't4',
    title: 'Database optimization',
    description: 'Analyze and optimize slow database queries. Add necessary indexes, refactor N+1 queries, and implement caching strategies.',
    priority: 'Medium',
    status: 'In Progress',
    deadline: '2025-02-20',
    assignedTo: 'u2',
    createdBy: 'u1',
    createdAt: '2025-01-14T08:00:00Z',
    updatedAt: '2025-01-18T12:00:00Z',
  },
  {
    id: 't5',
    title: 'Mobile app UI revamp',
    description: 'Redesign the mobile app UI following new brand guidelines. Focus on improved UX, accessibility, and modern visual design.',
    priority: 'High',
    status: 'Pending',
    deadline: '2025-03-10',
    assignedTo: 'u3',
    createdBy: 'u1',
    createdAt: '2025-01-16T09:00:00Z',
    updatedAt: '2025-01-16T09:00:00Z',
  },
  {
    id: 't6',
    title: 'Write technical documentation',
    description: 'Create comprehensive API documentation, developer guides, and onboarding materials for the engineering team.',
    priority: 'Low',
    status: 'Pending',
    deadline: '2025-02-28',
    assignedTo: 'u5',
    createdBy: 'u1',
    createdAt: '2025-01-17T10:00:00Z',
    updatedAt: '2025-01-17T10:00:00Z',
  },
  {
    id: 't7',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline using GitHub Actions. Include unit tests, integration tests, and staging deployments.',
    priority: 'Medium',
    status: 'Completed',
    deadline: '2025-01-25',
    assignedTo: 'u5',
    createdBy: 'u1',
    createdAt: '2025-01-10T11:00:00Z',
    updatedAt: '2025-01-24T17:00:00Z',
  },
  {
    id: 't8',
    title: 'Conduct user research interviews',
    description: 'Schedule and conduct 15 user interviews to gather feedback on current product features and identify pain points.',
    priority: 'Low',
    status: 'In Progress',
    deadline: '2025-02-10',
    assignedTo: 'u4',
    createdBy: 'u1',
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-01-20T09:00:00Z',
  },
];

export const initializeData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(TASKS_KEY)) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(defaultTasks));
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getTasks = (): Task[] => {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getAuthUser = (): User | null => {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
};

export const setAuthUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Low': return 'bg-green-100 text-green-700 border-green-200';
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'Pending': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
};

export const getStatusDot = (status: TaskStatus): string => {
  switch (status) {
    case 'Pending': return 'bg-slate-400';
    case 'In Progress': return 'bg-blue-500';
    case 'Completed': return 'bg-emerald-500';
  }
};
