import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, LogOut, Edit2, Check, X, MapPin, MessageCircle, Camera, ChevronRight, Calendar, Users, DollarSign, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import OnboardingChecklist from '../components/OnboardingChecklist';
import { NZ_CITIES, POST_MODULES, LATAM_COUNTRIES, OFICIOS, getFlagEmoji } from '../constants';
import Flag from '../components/Flag';
import api from '../lib/api';
import { compressImage } from '../lib/imageUtils';
import { ApiResponse, Post, TripStatus } from '../types';
import { formatDate, timeAgo } from '../utils/date';

interface TripSummary {
  id: string; origin: string; destination: string;
  departureDate: string; seatsTotal: number; seatsAvailable: number;
  costPerPerson?: number; currency: string; status: TripStatus;
}

interface PublicProfile {
  id: string; name: string; cityNz?: string; countryOrigin?: string; avatarUrl?: string; bio?: string;
  lastSeenAt?: string;
  posts?: Pick<Post, 'id' | 'module' | 'title' | 'city' | 'images'>[];
  tripsCreated?: TripSummary[];
}

const TRIP_STATUS_LABEL: Record<string, string> = {
  OPEN: 'Disponible', FULL: 'Completo', COMPLETED: 'Finalizado', CANCELLED: 'Cancelado',
};
const TRIP_STATUS_CLASS: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700', FULL: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700', CANCELLED: 'bg-red-100 text-red-700',
};

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

  const { data: myData } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicProfile>>(`/users/${user!.id}`);
      return data.data!;
    },
    enabled: isOwn && !!user?.id,
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [city, setCity] = useState(user?.cityNz ?? '');
  const [country, setCountry] = useState(user?.countryOrigin ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [oficio, setOficio] = useState((user as { oficio?: string })?.oficio ?? '');
  const [descripcionServicio, setDescripcionServicio] = useState((user as { descripcionServicio?: string })?.descripcionServicio ?? '');
  const [contactoDirectorio, setContactoDirectorio] = useState((user as { contactoDirectorio?: string })?.contactoDirectorio ?? '');
  const [instagram, setInstagram] = useState((user as { instagram?: string })?.instagram ?? '');
  const [tiktok, setTiktok] = useState((user as { tiktok?: string })?.tiktok ?? '');
  const [facebook, setFacebook] = useState((user as { facebook?: string })?.facebook ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [changingPw, setChangingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingPw, setSavingPw] = useState(false);

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
      await updateProfile({
        name, cityNz: city, countryOrigin: country, bio,
        oficio: oficio || null,
        descripcionServicio: descripcionServicio || null,
        contactoDirectorio: contactoDirectorio || null,
        instagram: instagram || null,
        tiktok: tiktok || null,
        facebook: facebook || null,
      } as Parameters<typeof updateProfile>[0]);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPw !== confirmPw) { setPwError('Las contraseñas nuevas no coinciden'); return; }
    if (newPw.length < 6) { setPwError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    setSavingPw(true);
    try {
      await api.patch('/users/me/password', { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess('Contraseña actualizada correctamente');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setChangingPw(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setPwError(msg ?? 'Error al actualizar la contraseña');
    } finally {
      setSavingPw(false);
    }
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
  const posts = isOwn ? (myData?.posts ?? []) : (otherProfile?.posts ?? []);
  const trips = isOwn ? (myData?.tripsCreated ?? []) : (otherProfile?.tripsCreated ?? []);

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
                <span className="absolute -bottom-1 -right-1 pointer-events-none">
                  <Flag code={profile.countryOrigin} size={20} />
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
              {!isOwn && otherProfile?.lastSeenAt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Última conexión: {timeAgo(otherProfile.lastSeenAt)}
                </p>
              )}
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
              profile?.countryOrigin ? (
                <p className="text-sm flex items-center gap-1.5">
                  <Flag code={profile.countryOrigin} size={16} />
                  {LATAM_COUNTRIES.find((c) => c.code === profile.countryOrigin)?.name ?? profile.countryOrigin}
                </p>
              ) : (
                <p className="text-sm">No especificado</p>
              )
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

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Directorio de oficios</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Oficio o servicio</p>
                {editing ? (
                  <select className="input" value={oficio} onChange={(e) => setOficio(e.target.value)}>
                    <option value="">Sin oficio (no aparezco en el directorio)</option>
                    {OFICIOS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  (profile as { oficio?: string })?.oficio
                    ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{(profile as { oficio?: string }).oficio}</span>
                    : <p className="text-sm text-gray-400">No especificado</p>
                )}
              </div>
              {(editing || (profile as { oficio?: string })?.oficio) && (<>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Descripción del servicio</p>
                  {editing ? (
                    <textarea
                      className="input resize-none" rows={2}
                      value={descripcionServicio}
                      onChange={(e) => setDescripcionServicio(e.target.value)}
                      placeholder="Ej: Cortes, coloraciones y keratina a domicilio en Auckland"
                      maxLength={300}
                    />
                  ) : (
                    (profile as { descripcionServicio?: string })?.descripcionServicio
                      ? <p className="text-sm text-gray-600">{(profile as { descripcionServicio?: string }).descripcionServicio}</p>
                      : editing ? null : <p className="text-sm text-gray-400">Sin descripción</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Contacto <span className="text-gray-400 font-normal">(WhatsApp o teléfono)</span></p>
                  {editing ? (
                    <input type="text" className="input" value={contactoDirectorio} onChange={(e) => setContactoDirectorio(e.target.value)} placeholder="Ej: +64 21 123 456" />
                  ) : (
                    <p className="text-sm text-gray-600">{(profile as { contactoDirectorio?: string })?.contactoDirectorio ?? '—'}</p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Instagram</p>
                    {editing ? (
                      <input type="text" className="input text-sm" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
                    ) : (
                      <p className="text-sm text-gray-600">{(profile as { instagram?: string })?.instagram ?? '—'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">TikTok</p>
                    {editing ? (
                      <input type="text" className="input text-sm" value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@usuario" />
                    ) : (
                      <p className="text-sm text-gray-600">{(profile as { tiktok?: string })?.tiktok ?? '—'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Facebook</p>
                    {editing ? (
                      <input type="text" className="input text-sm" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="página o /usuario" />
                    ) : (
                      <p className="text-sm text-gray-600">{(profile as { facebook?: string })?.facebook ?? '—'}</p>
                    )}
                  </div>
                </div>
              </>)}
            </div>
          </div>
        </div>
      </div>

      {isOwn && <OnboardingChecklist />}

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
              {posts.map((p: NonNullable<PublicProfile['posts']>[number]) => {
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

      {(trips.length > 0 || isOwn) && (
        <div className="mb-4">
          <h2 className="font-semibold text-sm text-gray-700 mb-2 px-1">Viajes publicados</h2>
          {trips.length === 0 ? (
            <div className="card p-6 flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-gray-400">Aún no has publicado viajes</p>
              <Link to="/trips/new" className="btn-primary text-xs py-1.5 px-3 mt-1">
                Publicar viaje
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {trips.map((t: TripSummary) => (
                <Link key={t.id} to={`/trips/${t.id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 font-semibold text-sm mb-1.5">
                      <span className="truncate">{t.origin}</span>
                      <ChevronRight size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{t.destination}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={11} />{formatDate(t.departureDate)}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users size={11} />{t.seatsAvailable}/{t.seatsTotal} asientos
                      </span>
                      {t.costPerPerson != null && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <DollarSign size={11} />{t.costPerPerson} {t.currency}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`badge text-xs shrink-0 ${TRIP_STATUS_CLASS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {TRIP_STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {isOwn && (
        <div className="mb-4">
          {!changingPw ? (
            <button
              onClick={() => { setChangingPw(true); setPwError(''); setPwSuccess(''); }}
              className="btn-outline w-full text-sm"
            >
              <KeyRound size={15} /> Cambiar contraseña
            </button>
          ) : (
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <KeyRound size={15} className="text-primary" /> Cambiar contraseña
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {pwError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-lg">
                    <span className="shrink-0 mt-0.5">⚠</span>{pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-2.5 rounded-lg">
                    <Check size={13} className="shrink-0 mt-0.5" />{pwSuccess}
                  </div>
                )}

                {[
                  { label: 'Contraseña actual', value: currentPw, onChange: setCurrentPw },
                  { label: 'Nueva contraseña', value: newPw, onChange: setNewPw },
                  { label: 'Confirmar nueva contraseña', value: confirmPw, onChange: setConfirmPw },
                ].map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        className="input pl-8 pr-10 py-2.5 text-sm"
                        placeholder="••••••••"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={savingPw} className="btn-primary text-sm flex-1">
                    <Check size={14} /> {savingPw ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setChangingPw(false); setPwError(''); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}
                    className="btn-outline text-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              </form>
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
