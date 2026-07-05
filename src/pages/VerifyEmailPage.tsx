import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../lib/api';

type State = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setState('error');
      setMessage('El enlace de verificación es inválido.');
      return;
    }

    api.post('/auth/verify-email', { token })
      .then(() => setState('success'))
      .catch((err) => {
        const msg = err?.response?.data?.error ?? 'El enlace es inválido o ya expiró.';
        setMessage(msg);
        setState('error');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">

        {state === 'loading' && (
          <>
            <Loader size={40} className="text-primary animate-spin mx-auto mb-5" />
            <h1 className="text-xl font-bold text-gray-800">Verificando tu correo...</h1>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">¡Correo verificado!</h1>
            <p className="text-gray-500 text-sm mb-8">
              Tu cuenta está activa. Ya puedes iniciar sesión y unirte a la comunidad.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors"
            >
              Iniciar sesión
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Enlace inválido</h1>
            <p className="text-gray-500 text-sm mb-8">{message}</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
