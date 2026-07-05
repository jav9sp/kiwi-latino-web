import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Briefcase, ShoppingBag, Car, Users,
  ArrowRight, MapPin, MessageCircle, CheckCircle,
  Shield, Smartphone, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const MODULES = [
  {
    icon: Home,
    label: 'Alojamiento',
    color: '#4CAF50',
    desc: 'Piezas y cuartos compartidos. Encuentra dónde quedarte sin depender de grupos de Facebook.',
  },
  {
    icon: Briefcase,
    label: 'Trabajo',
    color: '#2196F3',
    desc: 'Ofertas reales de personas reales. Farm, hostelería, construcción y más.',
  },
  {
    icon: ShoppingBag,
    label: 'Compra y Venta',
    color: '#FF9800',
    desc: 'Vende lo que ya no necesitas. Compra lo que alguien más ya no usa. Sin comisiones.',
  },
  {
    icon: Car,
    label: 'Viajes Compartidos',
    color: '#9C27B0',
    desc: 'Alguien va en la misma dirección. Comparte el viaje y los costos.',
  },
  {
    icon: Users,
    label: 'Comunidad',
    color: '#F44336',
    desc: 'Pregunta, comparte, conecta. Hay personas que ya recorrieron el mismo camino.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Crea tu perfil',
    desc: 'Regístrate en minutos. Cuéntanos de dónde vienes y dónde estás.',
    icon: CheckCircle,
  },
  {
    n: '02',
    title: 'Encuentra lo que necesitas',
    desc: 'Alojamiento, trabajo, viajes o comunidad. Todo en el mismo lugar.',
    icon: MapPin,
  },
  {
    n: '03',
    title: 'Conecta con personas reales',
    desc: 'Chatea directamente. Sin intermediarios, sin salir de la plataforma.',
    icon: MessageCircle,
  },
];

const FEATURES = [
  { icon: MessageCircle, title: 'Chat directo', desc: 'Mensajería instantánea con notificaciones. Sin necesidad de apps externas.' },
  { icon: Shield, title: 'Solo personas reales', desc: 'Solo usuarios verificados. Reporta lo que no está bien.' },
  { icon: MapPin, title: 'Toda Nueva Zelanda', desc: 'Auckland, Wellington, Christchurch y más. Filtra por ciudad.' },
  { icon: Smartphone, title: 'App móvil (pronto)', desc: 'iOS y Android. La comunidad siempre a mano.' },
];

const NZ_REGIONS = [
  'Auckland', 'Wellington', 'Christchurch', 'Queenstown',
  'Hamilton', 'Dunedin', 'Tauranga', "Hawke's Bay",
  'Rotorua', 'Nelson',
];

export default function LandingPage() {
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user) navigate('/feed', { replace: true });
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <img
              src="/logo.png"
              alt="Belfera"
              className={`h-8 w-auto transition-all ${scrolled ? '' : 'brightness-0 invert'}`}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#modulos" className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? 'text-gray-600' : 'text-white/80'}`}>
              Qué hay aquí
            </a>
            <a href="#como-funciona" className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? 'text-gray-600' : 'text-white/80'}`}>
              Cómo funciona
            </a>
            <Link
              to="/login"
              className={`text-sm font-semibold transition-colors ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-green-200'}`}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className={`text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${
                scrolled
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-white text-primary hover:bg-green-50'
              }`}
            >
              Unirme gratis
            </Link>
          </nav>

          <button
            className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 pb-4">
            <div className="flex flex-col gap-3 pt-2">
              <a href="#modulos" className="text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Qué hay aquí</a>
              <a href="#como-funciona" className="text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Cómo funciona</a>
              <Link to="/login" className="text-sm font-semibold text-gray-700 py-2">Iniciar sesión</Link>
              <Link to="/register" className="btn-primary text-center py-2.5 rounded-xl">Unirme gratis</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#1a6b3c] via-[#1a6b3c] to-[#0d4525] min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-white/[0.04]" />
          <div className="absolute top-1/2 -left-48 w-96 h-96 rounded-full bg-white/[0.04]" />
          <div className="absolute -bottom-24 right-1/3 w-72 h-72 rounded-full bg-white/[0.06]" />
          <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-white/[0.03]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-32 grid md:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] mb-6">
              Nunca<br />
              <span className="text-green-300">llegas solo.</span>
            </h1>
            <p className="text-lg text-white/75 leading-relaxed mb-4 max-w-md">
              Llegar a un país nuevo puede ser la mejor decisión de tu vida.
            </p>
            <p className="text-lg text-white/75 leading-relaxed mb-10 max-w-md">
              También puede ser la más difícil. Belfera es donde encuentras personas
              que ya estuvieron donde estás.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 bg-white text-primary font-bold px-7 py-4 rounded-xl hover:bg-green-50 transition-colors shadow-lg shadow-black/20"
              >
                Unirme a la comunidad
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 border-2 border-white/30 text-white font-semibold px-7 py-4 rounded-xl hover:bg-white/10 transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          {/* Right — floating cards */}
          <div className="hidden md:block relative h-[420px]">
            <div className="absolute top-0 left-8 w-64 bg-white rounded-2xl shadow-2xl p-4 rotate-[-3deg]">
              <div className="w-full h-28 rounded-xl bg-gradient-to-br from-green-100 to-green-200 mb-3 flex items-center justify-center">
                <Home size={36} className="text-housing" />
              </div>
              <div className="space-y-1.5">
                <span className="badge" style={{ background: '#4CAF5015', color: '#4CAF50', fontSize: '10px' }}>ALOJAMIENTO</span>
                <p className="font-semibold text-gray-900 text-sm">Pieza disponible en Auckland</p>
                <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin size={10} /> Auckland CBD · $300/sem</p>
              </div>
            </div>

            <div className="absolute top-24 right-0 w-60 bg-white rounded-2xl shadow-2xl p-4 rotate-[2deg]">
              <div className="space-y-2">
                <span className="badge" style={{ background: '#9C27B015', color: '#9C27B0', fontSize: '10px' }}>VIAJES</span>
                <p className="font-semibold text-gray-900 text-sm">Auckland → Wellington</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Sáb 14 dic · 8:00</span>
                  <span className="text-trips font-semibold">3 asientos</span>
                </div>
                <div className="flex -space-x-2 mt-1">
                  {['M','S','A'].map(l => (
                    <div key={l} className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-white">{l}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-16 w-56 bg-white rounded-2xl shadow-2xl p-4 rotate-[1deg]">
              <div className="space-y-1.5">
                <span className="badge" style={{ background: '#2196F315', color: '#2196F3', fontSize: '10px' }}>TRABAJO</span>
                <p className="font-semibold text-gray-900 text-sm">Farm worker — Hawke's Bay, NZ</p>
                <p className="text-gray-500 text-xs">$25/hr · Disponible ya</p>
                <p className="text-gray-400 text-xs">No se requiere experiencia previa</p>
              </div>
            </div>

            <div className="absolute top-10 right-12 bg-primary text-white text-xs font-medium px-3 py-2 rounded-2xl rounded-tr-sm shadow-lg">
              ¡Hola! ¿Sigue disponible?
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 30C1200 80 900 0 720 30C540 60 240 0 0 30L0 80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Problem / Solution ──────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-6">Por qué existe Belfera</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-6">
            Toda la información estaba repartida entre grupos de Facebook,
            chats de WhatsApp y páginas que nadie actualiza.
          </p>
          <p className="text-gray-500 text-lg leading-relaxed">
            Belfera reúne todo eso en un solo lugar. Para que cuando llegues,
            no tengas que empezar de cero ni solo.
          </p>
        </div>
      </section>

      {/* ── Modules ─────────────────────────────────────────── */}
      <section id="modulos" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Lo que hay aquí</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4">
              Todo lo que necesitas<br />cuando llegas
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Trabajo, alojamiento, viajes, compra y venta. Todo en un solo lugar, en español.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map(({ icon: Icon, label, color, desc }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{label}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}

            {/* CTA card */}
            <div className="bg-primary rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-green-200 text-sm font-semibold uppercase tracking-widest mb-3">Empieza hoy</p>
                <h3 className="font-black text-white text-2xl leading-snug mb-3">
                  Empieza acompañado.
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  La comunidad está aquí. Gratis, en español, para personas que empiezan de nuevo.
                </p>
              </div>
              <Link
                to="/register"
                className="mt-6 inline-flex items-center gap-2 bg-white text-primary font-bold px-5 py-3 rounded-xl hover:bg-green-50 transition-colors self-start text-sm"
              >
                Unirme
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="como-funciona" className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Así de simple</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3">
              Tres pasos, una comunidad
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />

            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative text-center">
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-primary-light border-4 border-white shadow-md mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary">{n}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────── */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900">
              Pensado para personas,<br />no para procesos
            </h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto">
              Cada detalle existe para una sola razón: que nunca tengas que empezar de cero solo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Regions ─────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Activo en toda Nueva Zelanda
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {NZ_REGIONS.map((region) => (
              <span key={region} className="inline-flex items-center gap-1.5 bg-primary-light text-primary text-sm font-semibold px-4 py-2 rounded-full">
                <MapPin size={12} />
                {region}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────── */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/[0.05]" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/[0.05]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Nunca<br />
            <span className="text-green-300">llegas solo.</span>
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Hay una comunidad esperándote. Gratis, en español, pensada para personas que empiezan de nuevo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-colors shadow-lg shadow-black/20"
            >
              Unirme a la comunidad
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2.5 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-white/50 text-sm">También disponible como app móvil</p>
            <div className="flex gap-3">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
                <Smartphone size={16} />
                iOS · Próximamente
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
                <Smartphone size={16} />
                Android · Próximamente
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✈️</span>
                <span className="font-black text-white text-lg">Belfera</span>
              </div>
              <p className="text-sm leading-relaxed">
                Belfera es el lugar donde las personas se acompañan cuando comienzan una nueva vida lejos de casa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-white font-semibold text-sm mb-4">Comunidad</p>
                <ul className="space-y-2 text-sm">
                  <li><a href="#modulos" className="hover:text-white transition-colors">Qué hay aquí</a></li>
                  <li><a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a></li>
                  <li><Link to="/register" className="hover:text-white transition-colors">Unirme gratis</Link></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-4">Módulos</p>
                <ul className="space-y-2 text-sm">
                  <li><span>Alojamiento</span></li>
                  <li><span>Trabajo</span></li>
                  <li><span>Compra y Venta</span></li>
                  <li><span>Viajes Compartidos</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} Belfera · belfera.com</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
