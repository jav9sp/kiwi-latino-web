import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, LogOut, Edit2, Check, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { NZ_CITIES } from '../constants';

export default function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();
  const isOwn = !userId || userId === user?.id;
  const profile = isOwn ? user : null;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [city, setCity] = useState(user?.cityNz ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, cityNz: city, bio });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isOwn && !profile) {
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      {!isOwn && (
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2"><ArrowLeft size={18} /> Volver</button>
      )}

      <div className="card p-6 mb-4">
        <div className="space-y-4 md:flex md:items-start md:justify-between mb-5">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              {editing ? (
                <input type="text" className="input text-lg font-bold mb-1" value={name} onChange={(e) => setName(e.target.value)} />
              ) : (
                <h1 className="text-xl font-bold">{user?.name}</h1>
              )}
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          {isOwn && !editing && (
            <button onClick={() => setEditing(true)} className="btn-outline text-sm">
              <Edit2 size={15} /> Editar
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
            <p className="text-xs font-medium text-gray-500 mb-1">Ciudad</p>
            {editing ? (
              <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Sin especificar</option>
                {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <p className="text-sm">{user?.cityNz ?? 'No especificada'}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Sobre mí</p>
            {editing ? (
              <textarea className="input resize-none" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntanos sobre ti..." />
            ) : (
              <p className="text-sm text-gray-600">{user?.bio ?? 'Sin descripción'}</p>
            )}
          </div>
        </div>
      </div>

      {isOwn && (
        <button onClick={handleLogout} className="btn w-full border border-red-200 text-red-600 hover:bg-red-50">
          <LogOut size={16} /> Cerrar sesión
        </button>
      )}
    </div>
  );
}
