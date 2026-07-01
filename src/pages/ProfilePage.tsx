import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, LogOut, Edit2, Check, X, MapPin, MessageCircle, Camera } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { NZ_CITIES, POST_MODULES, LATAM_COUNTRIES, getFlagEmoji } from '../constants';
import api from '../lib/api';
import { compressImage } from '../lib/imageUtils';
import { ApiResponse, Post } from '../types';

interface PublicProfile {
  id: string; name: string; cityNz?: string; countryOrigin?: string; avatarUrl?: string; bio?: string;
  posts?: Pick<Post, 'id' | 'module' | 'title' | 'city' | 'images'>[];
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();
  const isOwn = !userId || userId === user?.id;

  const { data: otherProfile, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicProfile>>(`/users/${userId}`);
      return data.data!;
    },
    enabled: !isOwn && !!userId,
  });

  const { data: myPosts } = useQuery({
    queryKey: ['user', user?.id, 'posts'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicProfile>>(`/users/${user!.id}`);
      return data.data?.posts ?? [];
    },
    enabled: isOwn && !!user?.id,
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [city, setCity] = useState(user?.cityNz ?? '');
  const [country, setCountry] = useState(user?.countryOrigin ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const blob = await compressImage(file, 800, 0.85);
      const formData = new FormData();
      formData.append('image', blob, 'avatar.jpg');
      const { data } = await api.post<{ data: { url: string } }>('/upload/image', formData, { timeout: 60_000 });
      await updateProfile({ avatarUrl: data.data.url });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, cityNz: city, countryOrigin: country, bio });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isOwn && isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!isOwn && !otherProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2"><ArrowLeft size={18} /> Volver</button>
        <div className="card p-10 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"><User size={28} className="text-gray-400" /></div>
          <p className="text-gray-500 text-sm">Perfil no disponible</p>
        </div>
      </div>
    );
  }

  const profile = isOwn ? user : otherProfile;
  const posts = isOwn ? (myPosts ?? []) : (otherProfile?.posts ?? []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      {!isOwn && (
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2"><ArrowLeft size={18} /> Volver</button>
      )}

      <div className="card p-6 mb-4">
        <div className="space-y-4 md:flex md:items-start md:justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              {isOwn && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              )}
              <div
                className={`relative w-16 h-16 rounded-full overflow-hidden ${isOwn ? 'cursor-pointer group' : ''}`}
                onClick={() => isOwn && !uploadingAvatar && fileInputRef.current?.click()}
              >
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                    {profile?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                {isOwn && (
                  <div className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {uploadingAvatar
                      ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      : <Camera size={18} className="text-white" />
                    }
                  </div>
                )}
              </div>
              {profile?.countryOrigin && (
                <span className="absolute -bottom-1 -right-1 text-xl leading-none pointer-events-none">
                  {getFlagEmoji(profile.countryOrigin)}
                </span>
              )}
            </div>
            <div>
              {editing ? (
                <input type="text" className="input text-lg font-bold mb-1" value={name} onChange={(e) => setName(e.target.value)} />
              ) : (
                <h1 className="text-xl font-bold">{profile?.name}</h1>
              )}
              {isOwn && <p className="text-sm text-gray-500">{user?.email}</p>}
            </div>
          </div>
          {isOwn && !editing && (
            <button onClick={() => setEditing(true)} className="btn-outline text-sm">
              <Edit2 size={15} /> Editar
            </button>
          )}
          {!isOwn && otherProfile && (
            <button onClick={() => navigate(`/chat/${otherProfile.id}`)} className="btn-primary text-sm">
              <MessageCircle size={15} /> Enviar mensaje
            </button>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                <Check size={15} /> {saving ? '...' : 'Guardar'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-outline text-sm">
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">País de origen</p>
            {editing ? (
              <select className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Sin especificar</option>
                {LATAM_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{getFlagEmoji(c.code)} {c.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm">
                {profile?.countryOrigin
                  ? `${getFlagEmoji(profile.countryOrigin)} ${LATAM_COUNTRIES.find((c) => c.code === profile.countryOrigin)?.name ?? profile.countryOrigin}`
                  : 'No especificado'}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Ciudad en NZ</p>
            {editing ? (
              <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Sin especificar</option>
                {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <p className="text-sm">{profile?.cityNz ?? 'No especificada'}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Sobre mí</p>
            {editing ? (
              <textarea className="input resize-none" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntanos sobre ti..." />
            ) : (
              <p className="text-sm text-gray-600">{profile?.bio ?? 'Sin descripción'}</p>
            )}
          </div>
        </div>
      </div>

      {(posts.length > 0 || isOwn) && (
        <div className="mb-4">
          <h2 className="font-semibold text-sm text-gray-700 mb-2 px-1">Publicaciones</h2>
          {posts.length === 0 ? (
            <div className="card p-6 flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-gray-400">Aún no has publicado nada</p>
              <Link to="/posts/new" className="btn-primary text-xs py-1.5 px-3 mt-1">
                Crear primera publicación
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((p) => {
                const mod = POST_MODULES.find((m) => m.key === p.module);
                return (
                  <Link key={p.id} to={`/posts/${p.id}`} className="card p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                        {(() => { const mod2 = POST_MODULES.find((m) => m.key === p.module); return mod2 ? <span className="text-lg">{mod2.label[0]}</span> : null; })()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {mod && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: mod.color + '20', color: mod.color }}>{mod.label}</span>}
                        <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin size={10} /> {p.city}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isOwn && (
        <button onClick={handleLogout} className="btn w-full border border-red-200 text-red-600 hover:bg-red-50">
          <LogOut size={16} /> Cerrar sesión
        </button>
      )}
    </div>
  );
}
