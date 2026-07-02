import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { NZ_CITIES, LATAM_COUNTRIES, getFlagEmoji } from '../constants';
import Flag from '../components/Flag';

const BENEFITS = [
  'Publica arriendos, trabajo y más sin comisiones',
  'Conecta con latinos en tu ciudad de NZ',
  'Chat en tiempo real, sin aplicaciones externas',
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', country: '' });
  const [showPw, setShowPw] = useState(false);
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
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — decorativo ────────────────────── */}
      <div className="hidden lg:flex w-[44%] flex-col justify-between bg-gradient-to-br from-[#1a6b3c] via-[#1a6b3c] to-[#0d4525] p-12 relative overflow-hidden">
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/[0.05]" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-20 right-1/3 w-56 h-56 rounded-full bg-white/[0.05]" />

        {/* Logo */}
        <Link to="/landing" className="relative z-10 flex items-center gap-2.5 w-fit">
          <span className="text-2xl select-none">🥝</span>
          <span className="font-black text-white text-xl">Kiwi Latino</span>
        </Link>

        {/* Headline + benefits */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Únete a miles<br />
            de latinos en<br />
            <span className="text-green-300">Nueva Zelanda</span>
          </h2>
          <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-xs">
            Crea tu cuenta gratis y accede a todo lo que la comunidad tiene para ofrecerte.
          </p>
          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/80">
                <CheckCircle size={16} className="text-green-300 shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Country flags strip */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Comunidad de toda Latinoamérica</p>
          <div className="flex flex-wrap gap-2">
            {LATAM_COUNTRIES.slice(0, 8).map((c) => (
              <div
                key={c.code}
                className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"
                title={c.name}
              >
                <Flag code={c.code} size={20} />
              </div>
            ))}
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/60 text-xs font-semibold">
              +{LATAM_COUNTRIES.length - 8}
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ───────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16 bg-white overflow-y-auto">

        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <Link to="/landing" className="flex items-center gap-2">
            <span className="text-xl">🥝</span>
            <span className="font-black text-primary text-lg">Kiwi Latino</span>
          </Link>
          <Link to="/landing" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Inicio
          </Link>
        </div>

        <div className="max-w-md mx-auto w-full">

          {/* Back link desktop */}
          <Link
            to="/landing"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Volver al inicio
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Crear cuenta</h1>
          <p className="text-gray-500 mb-7 text-sm">Gratis · En español · Para latinos en NZ</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span className="shrink-0 mt-0.5">⚠</span>
                {error}
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  className="input pl-10 py-3"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={set('name')}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  className="input pl-10 py-3"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pl-10 pr-11 py-3"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">País de origen</label>
              <div className="relative">
                {selectedCountry ? (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Flag code={selectedCountry.code} size={18} />
                  </span>
                ) : (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-base select-none">🌎</span>
                )}
                <select
                  className={`input py-3 ${selectedCountry ? 'pl-10' : 'pl-10'} appearance-none`}
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

            {/* Ciudad NZ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ciudad en NZ{' '}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  className="input pl-10 py-3 appearance-none"
                  value={form.city}
                  onChange={set('city')}
                >
                  <option value="">Selecciona una ciudad</option>
                  {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm mt-1"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Al registrarte aceptas el uso responsable de la plataforma y el respeto hacia la comunidad.
            </p>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
