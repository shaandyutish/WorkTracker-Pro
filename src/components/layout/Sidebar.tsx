import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Users, LogOut, X, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/tasks', label: 'All Tasks', icon: ClipboardList },
  { to: '/admin/users', label: 'Users', icon: Users },
];

const employeeLinks = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/tasks', label: 'My Tasks', icon: CheckSquare },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-slate-900 flex flex-col z-40 transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-3">
          <span className={cn(
            'text-xs font-semibold px-2.5 py-1 rounded-full',
            user?.role === 'admin'
              ? 'bg-violet-500/20 text-violet-300'
              : 'bg-blue-500/20 text-blue-300'
          )}>
            {user?.role === 'admin' ? '⚡ Admin' : '👤 Employee'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="px-4 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2">
            <Avatar initials={user?.avatar || 'U'} name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.department}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-link w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
