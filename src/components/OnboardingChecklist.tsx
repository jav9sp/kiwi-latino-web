import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, ChevronUp, Sparkles, Trophy } from 'lucide-react';
import api from '../lib/api';
import { ApiResponse } from '../types';

const CONFETTI_STYLE = `
@keyframes cf-fall {
  0%   { opacity: 1; transform: translateY(-16px) rotate(0deg) scale(1); }
  75%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(380px) rotate(800deg) scale(0.4); }
}
@keyframes cf-celebrate {
  0%   { opacity: 0; transform: scale(0.92); }
  12%  { opacity: 1; transform: scale(1.02); }
  20%  { transform: scale(1); }
  80%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.95); }
}
@keyframes cf-trophy {
  0%   { transform: scale(0) rotate(-15deg); }
  60%  { transform: scale(1.15) rotate(8deg); }
  80%  { transform: scale(0.95) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); }
}
`;

const COLORS = ['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#ef4444','#14b8a6','#f97316','#06b6d4','#84cc16'];

interface OnboardingSteps {
  avatar: boolean; bio: boolean; post: boolean;
  message: boolean; like: boolean; saved: boolean;
}

const STEPS: { key: keyof OnboardingSteps; label: string; sub: string; to: string }[] = [
  { key: 'avatar',  label: 'Sube una foto de perfil',      sub: 'Tu primera impresión',       to: '/profile'   },
  { key: 'bio',     label: 'Escribe una descripción',       sub: 'Cuéntanos sobre ti',         to: '/profile'   },
  { key: 'post',    label: 'Crea tu primera publicación',   sub: 'Comparte con la comunidad',  to: '/posts/new' },
  { key: 'message', label: 'Envía un mensaje',              sub: 'Conecta con alguien',        to: '/chat'      },
  { key: 'like',    label: 'Dale like a una publicación',   sub: 'Apoya el contenido',         to: '/feed'      },
  { key: 'saved',   label: 'Guarda una publicación',        sub: 'Para encontrarla luego',     to: '/feed'      },
];

const TOTAL = STEPS.length;
const STORAGE_KEY = 'onboarding_celebrated';

function ConfettiParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 55 }, (_, i) => ({
      id: i,
      left:   Math.random() * 100,
      color:  COLORS[Math.floor(Math.random() * COLORS.length)],
      w:      5 + Math.random() * 9,
      h:      4 + Math.random() * 7,
      delay:  Math.random() * 1.4,
      dur:    1.6 + Math.random() * 1.4,
      round:  Math.random() > 0.45,
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animation: `cf-fall ${p.dur}s ${p.delay}s ease-in both`,
          }}
        />
      ))}
    </div>
  );
}

function CelebrationCard() {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/40 border border-amber-200/60 dark:border-amber-700/30 mb-4"
      style={{ animation: `cf-celebrate 3.6s ease forwards` }}
    >
      <ConfettiParticles />
      <div className="relative flex flex-col items-center justify-center py-10 px-6 text-center">
        <div style={{ animation: `cf-trophy 0.55s 0.3s cubic-bezier(0.34,1.56,0.64,1) both` }}>
          <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center mb-3">
            <Trophy size={32} className="text-amber-500" />
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">¡Lo lograste!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completaste todos los primeros pasos.<br />¡Bienvenido a la comunidad!</p>
      </div>
    </div>
  );
}

export default function OnboardingChecklist() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [open, setOpen]           = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const [dismissed,   setDismissed]   = useState(false);

  // inject keyframes once
  useEffect(() => {
    if (document.getElementById('cf-style')) return;
    const el = document.createElement('style');
    el.id = 'cf-style';
    el.textContent = CONFETTI_STYLE;
    document.head.appendChild(el);
  }, []);

  const { data: steps } = useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OnboardingSteps>>('/users/me/onboarding');
      return data.data!;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (!steps) return;
    const completed = Object.values(steps).filter(Boolean).length;
    if (completed < TOTAL) {
      // reset so celebration shows again if somehow steps reset
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    // all done
    if (localStorage.getItem(STORAGE_KEY)) {
      setDismissed(true); // already celebrated before
      return;
    }
    localStorage.setItem(STORAGE_KEY, '1');
    setCelebrating(true);
    const t = setTimeout(() => {
      setCelebrating(false);
      setDismissed(true);
    }, 3700);
    return () => clearTimeout(t);
  }, [steps]);

  if (dismissed) return null;
  if (celebrating) return <CelebrationCard />;
  if (!steps) return null;

  const completed = Object.values(steps).filter(Boolean).length;
  if (completed === TOTAL) return null; // waiting for useEffect to trigger celebration

  const pct = Math.round((completed / TOTAL) * 100);

  const handleStepClick = (to: string) => {
    qc.invalidateQueries({ queryKey: ['onboarding'] });
    navigate(to);
  };

  return (
    <div className="card mb-4 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <Sparkles size={16} className="text-amber-400 shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold">Primeros pasos</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 shrink-0">{completed}/{TOTAL}</span>
          </div>
        </div>
        {open
          ? <ChevronUp   size={16} className="text-gray-400 shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {STEPS.map(({ key, label, sub, to }) => {
            const done = steps[key];
            return (
              <button
                key={key}
                onClick={() => !done && handleStepClick(to)}
                disabled={done}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  done
                    ? 'opacity-50 cursor-default'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                  done ? 'bg-primary border-primary scale-110' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {done && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : ''}`}>{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                {!done && <ChevronDown size={14} className="text-gray-300 shrink-0 -rotate-90" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
