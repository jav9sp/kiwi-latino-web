import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Car, Users, MessageCircle, User, LogOut, Leaf, Building2, Briefcase, Menu, X, LayoutDashboard } from 'lucide-react';
import { getFlagEmoji } from '../constants';
import { useAuthStore } from '../stores/authStore';

const nav = [
  { to: '/feed',      icon: Home,          label: 'Inicio' },
  { to: '/housing',   icon: Building2,     label: 'Alojamiento' },
  { to: '/jobs',      icon: Briefcase,     label: 'Empleos' },
  { to: '/trips',     icon: Car,           label: 'Viajes' },
  { to: '/community', icon: Users,         label: 'Comunidad' },
  { to: '/messages',  icon: MessageCircle, label: 'Mensajes' },
  { to: '/profile',   icon: User,          label: 'Perfil' },
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
  const isAdmin = !!ADMIN_EMAIL && user?.email === ADMIN_EMAIL;

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeDrawer = () => setDrawerOpen(false);

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
        <Link to="/feed" className="flex items-center gap-2 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <Leaf className="text-primary" size={24} />
          <span className="font-bold text-lg text-primary">Kiwi Latino</span>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon size={18} /> {label}
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
                {user?.countryOrigin && <span className="ml-1">{getFlagEmoji(user.countryOrigin)}</span>}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.cityNz ?? 'NZ'}</p>
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
          <Link to="/feed" onClick={closeDrawer} className="flex items-center gap-2">
            <Leaf className="text-primary" size={22} />
            <span className="font-bold text-lg text-primary">Kiwi Latino</span>
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
                {user?.countryOrigin && <span className="ml-1">{getFlagEmoji(user.countryOrigin)}</span>}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.cityNz ?? 'NZ'}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Mobile: top header ── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
        <button onClick={() => setDrawerOpen(true)} className="btn-ghost p-2 -ml-2">
          <Menu size={22} />
        </button>
        <Link to="/feed" className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          <Leaf className="text-primary" size={20} />
          <span className="font-bold text-primary">Kiwi Latino</span>
        </Link>
        <Link to="/profile" className="shrink-0">
          <UserAvatar />
        </Link>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <Outlet />
      </main>

    </div>
  );
}
