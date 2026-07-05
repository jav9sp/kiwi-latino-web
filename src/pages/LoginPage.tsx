import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const MODULE_CHIPS = [
  { label: 'Alojamiento', color: '#4CAF50' },
  { label: 'Trabajo', color: '#2196F3' },
  { label: 'Marketplace', color: '#FF9800' },
  { label: 'Viajes', color: '#9C27B0' },
  { label: 'Comunidad', color: '#F44336' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/feed');
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — decorativo ────────────────────── */}
      <div className="hidden lg:flex w-[44%] flex-col justify-between bg-gradient-to-br from-[#1a6b3c] via-[#1a6b3c] to-[#0d4525] p-12 relative overflow-hidden">
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/[0.05]" />
        <div className="absolute bottom-1/3 -left-20 w-64 h-64 rounded-full bg-white/[0.05]" />
        <div className="absolute -bottom-20 right-1/4 w-56 h-56 rounded-full bg-white/[0.04]" />

        {/* Logo */}
        <Link to="/landing" className="relative z-10 flex items-center gap-2.5 w-fit">
          <span className="text-2xl select-none">✈️</span>
          <span className="font-black text-white text-xl">Belfera</span>
        </Link>

        {/* Headline + chips */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            La comunidad<br />
            latina en<br />
            <span className="text-green-300">Nueva Zelanda</span>
          </h2>
          <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-xs">
            Alojamiento, trabajo, viajes y comunidad. Todo en un solo lugar, en español, sin costo.
          </p>
          <div className="flex flex-wrap gap-2">
            {MODULE_CHIPS.map(({ label, color }) => (
              <span
                key={label}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{ background: `${color}28`, border: `1px solid ${color}55` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 border border-white/20 rounded-2xl p-5">
          <p className="text-white/90 text-sm italic leading-relaxed mb-4">
            "Encontré trabajo en una semana y después un arriendo cerca de la ciudad. Belfera me cambió la vida acá."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-400/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
              M
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-none mb-0.5">María G.</p>
              <p className="text-white/50 text-xs">Auckland · 🇨🇱 Chile</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ───────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white overflow-y-auto">

        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between mb-10">
          <Link to="/landing" className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="font-black text-primary text-lg">Belfera</span>
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

          <h1 className="text-3xl font-black text-gray-900 mb-1">Iniciar sesión</h1>
          <p className="text-gray-500 mb-8 text-sm">Bienvenido de vuelta a la comunidad</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span className="shrink-0 mt-0.5">⚠</span>
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  className="input pl-10 py-3"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pl-10 pr-11 py-3"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
