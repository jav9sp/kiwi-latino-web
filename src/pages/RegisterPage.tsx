import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { NZ_CITIES, LATAM_COUNTRIES, getFlagEmoji } from '../constants';
import Flag from '../components/Flag';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        cityNz: form.city || undefined,
        countryOrigin: form.country || undefined,
      });
      navigate('/feed');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      setError(data?.error ?? data?.message ?? 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = LATAM_COUNTRIES.find((c) => c.code === form.country);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <Leaf size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">Únete a la comunidad latina en NZ</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input type="text" className="input" value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo</label>
            <input type="email" className="input" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">País de origen</label>
            <div className="relative">
              {selectedCountry && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Flag code={selectedCountry.code} size={18} />
                </span>
              )}
              <select
                className={`input ${selectedCountry ? 'pl-10' : ''}`}
                value={form.country}
                onChange={set('country')}
              >
                <option value="">Selecciona tu país</option>
                {LATAM_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {getFlagEmoji(c.code)} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad en NZ <span className="text-gray-400 font-normal">(opcional)</span></label>
            <select className="input" value={form.city} onChange={set('city')}>
              <option value="">Selecciona una ciudad</option>
              {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Ingresar</Link>
        </p>
      </div>
    </div>
  );
}
