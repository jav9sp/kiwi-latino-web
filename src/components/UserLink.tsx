import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { User } from '../types';

interface Props {
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  size?: number;
  subtitle?: string;
  className?: string;
  stopPropagation?: boolean;
  children?: React.ReactNode;
}

export default function UserLink({ user, size = 28, subtitle, className = '', stopPropagation: stop = false, children }: Props) {
  const navigate = useNavigate();
  const { user: me } = useAuthStore();

  const handleClick = (e: React.MouseEvent) => {
    if (stop) e.stopPropagation();
    if (!user?.id) return;
    navigate(user.id === me?.id ? '/profile' : `/profile/${user.id}`);
  };

  const initSize = Math.max(10, Math.floor(size * 0.4));

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-2 hover:opacity-75 transition-opacity ${className}`}
    >
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          style={{ width: size, height: size }}
          className="rounded-full object-cover shrink-0"
        />
      ) : (
        <div
          style={{ width: size, height: size, fontSize: initSize }}
          className="rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0"
        >
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      {(user?.name || subtitle) && (
        <div className="text-left leading-tight">
          {user?.name && <p className="font-medium">{user.name}</p>}
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </button>
  );
}
