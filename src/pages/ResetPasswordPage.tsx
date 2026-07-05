import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../lib/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card p-10 max-w-sm w-full text-center">
          <p className="text-red-500 font-medium mb-4">Enlace inválido o expirado.</p>
          <Link to="/forgot-password" className="btn-primary text-sm">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'El enlace es inválido o ya expiró. Solicita uno nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex w-[44%] flex-col justify-center bg-gradient-to-br from-[#1a6b3c] via-[#1a6b3c] to-[#0d4525] p-12 relative overflow-hidden">
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/[0.05]" />
        <div className="absolute bottom-1/3 -left-20 w-64 h-64 rounded-full bg-white/[0.05]" />
        <Link to="/landing" className="absolute top-10 left-10 z-10">
          <img src="/logo.png" alt="Belfera" className="h-8 w-auto brightness-0 invert" />
        </Link>
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Nueva<br />contraseña
          </h2>
          <p className="text-white/65 text-sm leading-relaxed max-w-xs">
            Elige una contraseña segura de al menos 6 caracteres. Después de cambiarla tendrás que iniciar sesión de nuevo.
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white overflow-y-auto">
        <div className="max-w-md mx-auto w-full">

          <div className="lg:hidden mb-10">
            <img src="/logo.png" alt="Belfera" className="h-7 w-auto" />
          </div>

          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">¡Contraseña actualizada!</h1>
              <p className="text-gray-500 text-sm mb-6">
                Tu contraseña fue cambiada correctamente. Inicia sesión con tu nueva contraseña.
              </p>
              <button onClick={() => navigate('/login')} className="btn-primary text-sm">
                Iniciar sesión
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden lg:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Volver al inicio de sesión
              </Link>

              <h1 className="text-3xl font-black text-gray-900 mb-1">Nueva contraseña</h1>
              <p className="text-gray-500 mb-8 text-sm">Elige una contraseña segura de al menos 6 caracteres.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <span className="shrink-0 mt-0.5">⚠</span>{error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input pl-10 pr-11 py-3"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input pl-10 py-3"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm mt-2"
                >
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
