import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Car, Users, MessageCircle, User, LogOut, Building2, Briefcase, Menu, X, LayoutDashboard, Bookmark } from 'lucide-react';
import Flag from './Flag';
import { useAuthStore } from '../stores/authStore';
import { useUnreadCount } from '../hooks/useMessages';
import WelcomeModal from './WelcomeModal';

const nav = [
  { to: '/feed',        icon: Home,          label: 'Inicio' },
  { to: '/housing',     icon: Building2,     label: 'Alojamiento' },
  { to: '/jobs',        icon: Briefcase,     label: 'Empleos' },
  { to: '/trips',       icon: Car,           label: 'Viajes' },
  { to: '/community',   icon: Users,         label: 'Comunidad' },
  { to: '/saved',       icon: Bookmark,      label: 'Guardados' },
  { to: '/messages',    icon: MessageCircle, label: 'Mensajes' },
  { to: '/profile',     icon: User,          label: 'Perfil' },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
  }`;

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const isAdmin = !!ADMIN_EMAIL && user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!user) return;
    const key = `belfera_welcome_${user.id}`;
    if (!localStorage.getItem(key)) {
      setShowWelcome(true);
    }
  }, [user]);

  const handleCloseWelcome = () => {
    if (user) localStorage.setItem(`belfera_welcome_${user.id}`, '1');
    setShowWelcome(false);
  };

  const unreadCount = useUnreadCount();
  const handleLogout = () => { logout(); navigate('/login'); };
  const closeDrawer = () => setDrawerOpen(false);

  const UnreadBadge = () =>
    unreadCount > 0 ? (
      <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    ) : null;

  const UserAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const dim = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-9 h-9 text-base' : 'w-8 h-8 text-sm';
    return user?.avatarUrl
      ? <img src={user.avatarUrl} alt="" className={`${dim} rounded-full object-cover`} />
      : <div className={`${dim} rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold`}>{user?.name?.[0]?.toUpperCase()}</div>;
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0">
        <Link to="/feed" className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <img src="/logo.png" alt="Belfera" className="h-8 w-auto" />
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon size={18} /> {label}
              {to === '/messages' && <UnreadBadge />}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <LayoutDashboard size={18} /> Admin
            </NavLink>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg hover:bg-gray-100 transition-colors">
            <UserAvatar />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name}
                {user?.countryOrigin && <Flag code={user.countryOrigin} size={14} className="ml-1" />}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.cityNz ?? ''}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Mobile: backdrop ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={closeDrawer} />
      )}

      {/* ── Mobile: slide-out drawer ── */}
      <div className={`md:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <Link to="/feed" onClick={closeDrawer}>
            <img src="/logo.png" alt="Belfera" className="h-7 w-auto" />
          </Link>
          <button onClick={closeDrawer} className="btn-ghost p-2 -mr-2"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={closeDrawer} className={navLinkClass}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" onClick={closeDrawer} className={navLinkClass}>
              <LayoutDashboard size={18} /> Admin
            </NavLink>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <Link to="/profile" onClick={closeDrawer} className="flex items-center gap-3 px-3 py-3 mb-1 rounded-lg hover:bg-gray-100 transition-colors">
            <UserAvatar size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name}
                {user?.countryOrigin && <Flag code={user.countryOrigin} size={14} className="ml-1" />}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.cityNz ?? ''}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Mobile: top header ── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
        <button onClick={() => setDrawerOpen(true)} className="btn-ghost p-2 -ml-2 relative">
          <Menu size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
        <Link to="/feed" className="absolute left-1/2 -translate-x-1/2">
          <img src="/logo.png" alt="Belfera" className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/messages" className="btn-ghost p-2 relative">
            <MessageCircle size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/profile" className="shrink-0">
            <UserAvatar />
          </Link>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <Outlet />
      </main>

      {/* ── Welcome modal (first login) ── */}
      {showWelcome && user && (
        <WelcomeModal userName={user.name} onClose={handleCloseWelcome} />
      )}

    </div>
  );
}
