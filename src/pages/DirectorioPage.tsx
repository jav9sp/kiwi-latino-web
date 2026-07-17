import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, MessageCircle, BookUser, Phone, Instagram } from 'lucide-react';
import api from '../lib/api';
import { ApiResponse } from '../types';
import { NZ_CITIES, OFICIOS } from '../constants';
import Flag from '../components/Flag';
import EmptyState from '../components/EmptyState';

interface DirectorioUser {
  id: string; name: string; avatarUrl?: string;
  oficio: string; descripcionServicio?: string; imagenOficio?: string;
  contactoDirectorio?: string; instagram?: string; tiktok?: string; facebook?: string;
  cityNz?: string; countryOrigin?: string;
}

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function DirectorioPage() {
  const navigate = useNavigate();
  const [filterOficio, setFilterOficio] = useState('');
  const [filterCity,   setFilterCity]   = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['directorio', filterOficio, filterCity],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filterOficio) params.oficio = filterOficio;
      if (filterCity)   params.city   = filterCity;
      const { data } = await api.get<ApiResponse<DirectorioUser[]>>('/users/directorio', { params });
      return data.data!;
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold">Directorio de oficios</h1>
        <p className="text-sm text-gray-500">Encuentra profesionales y personas con oficios en NZ</p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card px-3 py-2.5 flex items-center gap-2">
          <BookUser size={15} className="text-gray-400 shrink-0" />
          <select
            value={filterOficio}
            onChange={(e) => setFilterOficio(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            <option value="">Todos los oficios</option>
            {OFICIOS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="card px-3 py-2.5 flex items-center gap-2">
          <MapPin size={15} className="text-gray-400 shrink-0" />
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            <option value="">Todas las ciudades</option>
            {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={BookUser}
          title="Sin resultados"
          subtitle="Nadie con ese oficio en esta ciudad por ahora."
        />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="card overflow-hidden">
              {/* Banner imagen del oficio */}
              {u.imagenOficio && (
                <div
                  className="w-full h-40 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/profile/${u.id}`)}
                >
                  <img src={u.imagenOficio} alt={u.oficio} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              )}

              <div className="p-4 flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full overflow-hidden shrink-0 cursor-pointer"
                onClick={() => navigate(`/profile/${u.id}`)}
              >
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                    {u.name[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <button
                      onClick={() => navigate(`/profile/${u.id}`)}
                      className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors text-left"
                    >
                      {u.name}
                    </button>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {u.oficio}
                      </span>
                      {u.countryOrigin && <Flag code={u.countryOrigin} size={14} />}
                    </div>
                  </div>
                </div>

                {u.cityNz && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                    <MapPin size={11} /> {u.cityNz}
                  </p>
                )}

                {u.descripcionServicio && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                    {u.descripcionServicio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {u.contactoDirectorio && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone size={11} className="shrink-0" />{u.contactoDirectorio}
                    </span>
                  )}
                  {u.instagram && (
                    <a
                      href={`https://instagram.com/${u.instagram.replace(/^@/, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1"
                    >
                      <Instagram size={11} />{u.instagram.startsWith('@') ? u.instagram : `@${u.instagram}`}
                    </a>
                  )}
                  {u.tiktok && (
                    <a
                      href={`https://tiktok.com/@${u.tiktok.replace(/^@/, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-gray-800 dark:text-gray-200 hover:text-gray-600 flex items-center gap-1"
                    >
                      <TikTokIcon />{u.tiktok.startsWith('@') ? u.tiktok : `@${u.tiktok}`}
                    </a>
                  )}
                  {u.facebook && (
                    <a
                      href={u.facebook.startsWith('http') ? u.facebook : `https://facebook.com/${u.facebook.replace(/^\//, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <FacebookIcon />{u.facebook}
                    </a>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/chat/${u.id}`)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <MessageCircle size={13} /> Mensaje
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${u.id}`)}
                    className="btn-outline text-xs py-1.5 px-3"
                  >
                    Ver perfil
                  </button>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
