import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export const Header = ({ onMenuClick, title }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5">
          <Avatar initials={user?.avatar || 'U'} name={user?.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
