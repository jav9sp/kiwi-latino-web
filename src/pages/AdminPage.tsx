import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Car, MessageCircle, Heart, TrendingUp, MapPin, Globe, Send } from 'lucide-react';
import api from '../lib/api';
import { ApiResponse } from '../types';
import { POST_MODULES, LATAM_COUNTRIES } from '../constants';
import Flag from '../components/Flag';
import { formatDistanceToNow } from '../utils/date';

interface AdminStats {
  users: {
    total: number; thisWeek: number; thisMonth: number;
    byCountry: { country: string | null; count: number }[];
    byCity:    { city: string | null; count: number }[];
  };
  posts: {
    total: number; active: number;
    byModule: { module: string; count: number }[];
  };
  trips: {
    total: number;
    byStatus: { status: string; count: number }[];
  };
  engagement: { messages: number; comments: number; likes: number };
  recentUsers: {
    id: string; name: string; email: string;
    countryOrigin?: string; cityNz?: string; createdAt: string;
  }[];
}

interface AdminUser {
  id: string; name: string; email: string;
  avatarUrl?: string; countryOrigin?: string; cityNz?: string;
  createdAt: string; lastSeenAt?: string;
}

const TRIP_STATUS_LABEL: Record<string, string> = {
  OPEN: 'Disponibles', FULL: 'Completos', COMPLETED: 'Finalizados', CANCELLED: 'Cancelados',
};
const TRIP_STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700', FULL: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700', CANCELLED: 'bg-red-100 text-red-700',
};

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: number; sub?: string; color: string;
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BarRow({ label, count, max, color }: { label: React.ReactNode; count: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminStats>>('/admin/stats');
      return data.data!;
    },
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminUser[]>>('/admin/users');
      return data.data!;
    },
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">No tienes acceso a este panel o ocurrió un error.</p>
        <p className="text-xs text-gray-400 mt-2">Verifica que <code>ADMIN_EMAIL</code> esté configurado en el servidor.</p>
      </div>
    );
  }

  const maxModuleCount = Math.max(...stats.posts.byModule.map((m) => m.count), 1);
  const maxCountryCount = Math.max(...stats.users.byCountry.map((c) => c.count), 1);
  const maxCityCount = Math.max(...stats.users.byCity.map((c) => c.count), 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de administrador</h1>
        <p className="text-sm text-gray-500 mt-0.5">Métricas de uso de la plataforma</p>
      </div>

      {/* ── Resumen principal ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumen</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Users} label="Usuarios" value={stats.users.total}
            sub={`+${stats.users.thisWeek} esta semana`}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={FileText} label="Publicaciones activas" value={stats.posts.active}
            sub={`${stats.posts.total} en total`}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={Car} label="Viajes" value={stats.trips.total}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={MessageCircle} label="Mensajes" value={stats.engagement.messages}
            color="bg-orange-100 text-orange-600"
          />
        </div>
      </section>

      {/* ── Engagement ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Engagement</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 flex items-center gap-3">
            <Heart size={18} className="text-red-400 shrink-0" />
            <div>
              <p className="text-lg font-bold">{stats.engagement.likes.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Me gusta</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <MessageCircle size={18} className="text-indigo-400 shrink-0" />
            <div>
              <p className="text-lg font-bold">{stats.engagement.comments.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Comentarios</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <TrendingUp size={18} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-lg font-bold">+{stats.users.thisMonth}</p>
              <p className="text-xs text-gray-500">Usuarios este mes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Publicaciones por módulo ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Publicaciones por módulo</h2>
        <div className="card p-5 space-y-3">
          {POST_MODULES.map(({ key, label, color }) => {
            const entry = stats.posts.byModule.find((m) => m.module === key);
            return (
              <BarRow
                key={key} label={label}
                count={entry?.count ?? 0}
                max={maxModuleCount}
                color={color}
              />
            );
          })}
          {stats.posts.byModule.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Sin publicaciones aún</p>
          )}
        </div>
      </section>

      {/* ── Viajes por estado ── */}
      {stats.trips.total > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Viajes por estado</h2>
          <div className="card p-4 flex flex-wrap gap-3">
            {['OPEN', 'FULL', 'COMPLETED', 'CANCELLED'].map((s) => {
              const entry = stats.trips.byStatus.find((t) => t.status === s);
              return (
                <div key={s} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${TRIP_STATUS_COLOR[s]}`}>
                  <span className="font-bold">{entry?.count ?? 0}</span>
                  <span>{TRIP_STATUS_LABEL[s]}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Distribución de usuarios ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {stats.users.byCountry.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Globe size={14} /> Usuarios por país
            </h2>
            <div className="card p-5 space-y-3">
              {stats.users.byCountry.map(({ country, count }) => {
                if (!country) return null;
                const found = LATAM_COUNTRIES.find((c) => c.code === country);
                return (
                  <BarRow
                    key={country}
                    label={<span className="flex items-center gap-1.5"><Flag code={country} size={14} />{found?.name ?? country}</span>}
                    count={count}
                    max={maxCountryCount}
                    color="#3b82f6"
                  />
                );
              })}
            </div>
          </section>
        )}

        {stats.users.byCity.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <MapPin size={14} /> Usuarios por ciudad NZ
            </h2>
            <div className="card p-5 space-y-3">
              {stats.users.byCity.map(({ city, count }) => {
                if (!city) return null;
                return (
                  <BarRow
                    key={city} label={city} count={count}
                    max={maxCityCount} color="#10b981"
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* ── Todos los usuarios ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Usuarios ({allUsers.length})
        </h2>
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {allUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/profile/${u.id}`)}
              >
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                    {u.name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
                    {u.lastSeenAt ? `Visto ${formatDistanceToNow(u.lastSeenAt)}` : 'Sin actividad'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    {u.cityNz && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                        <MapPin size={10} /> {u.cityNz}
                      </p>
                    )}
                    {u.countryOrigin && <Flag code={u.countryOrigin} size={14} />}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/chat/${u.id}`); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Enviar mensaje"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            ))}
            {allUsers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Sin usuarios registrados</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
