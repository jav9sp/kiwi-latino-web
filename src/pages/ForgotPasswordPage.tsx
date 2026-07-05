import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Ocurrió un error. Inténtalo de nuevo.');
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
            <Mail size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Recupera tu<br />contraseña
          </h2>
          <p className="text-white/65 text-sm leading-relaxed max-w-xs">
            Te enviaremos un enlace a tu correo para que puedas crear una nueva contraseña de forma segura.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white overflow-y-auto">
        <div className="max-w-md mx-auto w-full">

          {/* Header mobile */}
          <div className="lg:hidden mb-10">
            <img src="/logo.png" alt="Belfera" className="h-7 w-auto" />
          </div>

          <Link
            to="/login"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Volver al inicio de sesión
          </Link>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Revisa tu correo</h1>
              <p className="text-gray-500 text-sm mb-6">
                Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <Link to="/login" className="btn-primary text-sm inline-flex">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black text-gray-900 mb-1">¿Olvidaste tu contraseña?</h1>
              <p className="text-gray-500 mb-8 text-sm">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <span className="shrink-0 mt-0.5">⚠</span>{error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5 transition-colors">
                  <ArrowLeft size={14} /> Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
