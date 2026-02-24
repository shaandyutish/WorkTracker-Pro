import { cn } from '../../utils/cn';

const colors = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
];

const getColor = (initials: string) => {
  const index = initials.charCodeAt(0) % colors.length;
  return colors[index];
};

interface AvatarProps {
  initials: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar = ({ initials, name, size = 'md', className }: AvatarProps) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
        getColor(initials),
        sizes[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
};
