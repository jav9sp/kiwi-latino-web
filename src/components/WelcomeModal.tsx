import { useNavigate } from 'react-router-dom';
import { X, Pencil } from 'lucide-react';

const RULES = [
  {
    emoji: '🤝',
    title: 'Trátate como te gustaría que te traten',
    desc: 'Todos llegamos solos. Un poco de amabilidad hace mucha diferencia.',
  },
  {
    emoji: '✅',
    title: 'Publica con honestidad',
    desc: 'Precios reales, fotos reales, disponibilidad real. La confianza es lo que nos mantiene juntos.',
  },
  {
    emoji: '🙌',
    title: 'Comparte lo que sabes',
    desc: 'Si encontraste trabajo, un buen arriendo o un dato útil, compártelo. Alguien lo necesita hoy.',
  },
  {
    emoji: '🚩',
    title: 'Reporta lo que no está bien',
    desc: 'Entre todos cuidamos este espacio. Si algo no te parece, usa el botón de reportar.',
  },
];

interface Props {
  userName: string;
  onClose: () => void;
}

export default function WelcomeModal({ userName, onClose }: Props) {
  const navigate = useNavigate();
  const firstName = userName.split(' ')[0];

  const handleCreate = () => {
    onClose();
    navigate('/posts/new');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a6b3c] to-[#0d4525] rounded-t-2xl px-6 pt-8 pb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.05]" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/[0.05]" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X size={16} />
          </button>
          <p className="text-green-300 text-sm font-semibold mb-1 relative z-10">Bienvenido/a</p>
          <h2 className="text-2xl font-black text-white leading-snug relative z-10">
            Hola, {firstName}.<br />
            <span className="text-green-300">Nunca llegas solo.</span>
          </h2>
          <p className="text-white/70 text-sm mt-3 leading-relaxed relative z-10 max-w-sm">
            Belfera es una comunidad en crecimiento. Esto funciona porque las personas
            como tú se toman el tiempo de publicar, ayudar y conectar.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Cómo nos cuidamos
          </p>

          <div className="space-y-4">
            {RULES.map((rule) => (
              <div key={rule.title} className="flex gap-3">
                <span className="text-xl shrink-0 mt-0.5">{rule.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{rule.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Invite to participate */}
          <div className="mt-6 bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-primary">Esta comunidad somos todos.</span>{' '}
              Si ves que algo falta, publícalo. Si sabes algo útil, compártelo.
              Cada publicación hace que Belfera sea mejor para el que llega después de ti.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCreate}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <Pencil size={15} />
            Crear mi primera publicación
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Explorar la comunidad
          </button>
        </div>
      </div>
    </div>
  );
}
