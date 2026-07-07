import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Briefcase, ShoppingBag, Car, Users, ChevronRight, Search, Home } from 'lucide-react';
import { useCreatePost } from '../hooks/usePosts';
import { useAuthStore } from '../stores/authStore';
import { POST_MODULES, NZ_CITIES, PostModuleKey } from '../constants';
import ImageUploader from '../components/ImageUploader';

const MODULE_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  HOUSING:     Building2,
  JOBS:        Briefcase,
  MARKETPLACE: ShoppingBag,
  TRIPS:       Car,
  COMMUNITY:   Users,
};

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createPost = useCreatePost();

  const [module, setModule] = useState<PostModuleKey | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  type HousingIntention = 'busqueda' | 'oferta' | '';
  const [form, setForm] = useState({
    title: '', description: '', city: user?.cityNz ?? '', price: '',
    housingIntention: '' as HousingIntention,
    housingBills: '',
    housingBano: '',
    housingEstacionamiento: '',
    housingHabitacion: '',
    disponibleDesde: '',
    jobsTipo: '',
    categoria: '', condicion: '',
  });

  const set = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSelectModule = (key: PostModuleKey) => {
    if (key === 'TRIPS') { navigate('/trips/new'); return; }
    setModule(key);
    setError('');
  };

  const handleBack = () => {
    if (module === 'HOUSING' && form.housingIntention) {
      setForm((f) => ({ ...f, housingIntention: '' }));
      setError('');
    } else {
      setModule(null);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;

    if (module === 'HOUSING' && !form.housingIntention) {
      setError('Selecciona si buscas o ofreces arriendo.');
      return;
    }

    const metadata: Record<string, unknown> = {};
    if (module === 'HOUSING') {
      metadata.tipo = form.housingIntention;
      if (form.housingIntention === 'oferta') {
        if (form.housingBills) metadata.bills = form.housingBills;
        if (form.housingBano) metadata.bano = form.housingBano;
        if (form.housingEstacionamiento) metadata.estacionamiento = form.housingEstacionamiento === 'si';
        if (form.housingHabitacion) metadata.habitacion = form.housingHabitacion;
        if (form.disponibleDesde) metadata.disponibleDesde = form.disponibleDesde;
      }
    }
    if (module === 'JOBS' && form.jobsTipo) metadata.tipo = form.jobsTipo;
    if (module === 'MARKETPLACE') {
      if (form.categoria) metadata.categoria = form.categoria;
      if (form.condicion) metadata.condicion = form.condicion;
    }

    const payload: Record<string, unknown> = {
      module,
      title: form.title,
      description: form.description,
      city: form.city,
      images,
    };
    if (form.price) payload.price = Number(form.price);
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    try {
      await createPost.mutateAsync(payload);
      navigate('/feed');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      setError(data?.error ?? data?.message ?? 'Error al publicar. Intenta de nuevo.');
    }
  };

  const mod = module ? POST_MODULES.find((m) => m.key === module) : null;
  const showImages = module !== 'JOBS' && !(module === 'HOUSING' && form.housingIntention === 'busqueda');
  const showPrice  = module === 'HOUSING' || module === 'MARKETPLACE' || module === 'JOBS';

  const housingTitlePlaceholder =
    form.housingIntention === 'busqueda' ? 'Ej: Busco habitación en Auckland' :
    form.housingIntention === 'oferta'   ? 'Ej: Habitación disponible en Auckland Central' :
    'Ej: Habitación disponible en Auckland';
  const housingDescPlaceholder =
    form.housingIntention === 'busqueda' ? 'Describe lo que buscas, presupuesto, preferencias...' :
    'Describe el alojamiento, servicios incluidos, normas de convivencia...';

  const titlePlaceholder: Record<string, string> = {
    HOUSING:     housingTitlePlaceholder,
    JOBS:        'Ej: Se busca trabajador para farm',
    MARKETPLACE: 'Ej: iPhone 12 en buen estado',
    COMMUNITY:   'Ej: Reunión de latinos en Wellington',
  };
  const descPlaceholder: Record<string, string> = {
    HOUSING:     housingDescPlaceholder,
    JOBS:        'Describe el trabajo, requisitos, horarios...',
    MARKETPLACE: 'Describe el producto, estado, detalles...',
    COMMUNITY:   'Describe el evento o publicación...',
  };

  /* ── Paso 1: selector de módulo ── */
  if (!module) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
          <ArrowLeft size={18} /> Volver
        </button>
        <h1 className="text-xl font-bold mb-1">Nueva publicación</h1>
        <p className="text-sm text-gray-500 mb-6">¿Qué tipo de publicación quieres crear?</p>

        <div className="grid grid-cols-2 gap-3">
          {POST_MODULES.map(({ key, label, color }) => {
            const Icon = MODULE_ICONS[key];
            return (
              <button
                key={key}
                onClick={() => handleSelectModule(key as PostModuleKey)}
                className="card p-5 flex flex-col items-start gap-3 text-left hover:shadow-md transition-all active:scale-95"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: color + '25' }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="w-full">
                  <p className="font-semibold text-gray-900">{label}</p>
                  {key === 'TRIPS' && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-0.5">
                      Formulario de viaje <ChevronRight size={11} />
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Paso 1.5: HOUSING — elegir intención antes del formulario ── */
  if (module === 'HOUSING' && !form.housingIntention) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => { setModule(null); setError(''); }} className="btn-ghost p-2 -ml-2">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Alojamiento</h1>
            <span className="text-sm font-medium" style={{ color: mod?.color }}>Nueva publicación</span>
          </div>
        </div>

        <p className="text-lg font-semibold mb-1">¿Qué necesitas publicar?</p>
        <p className="text-sm text-gray-500 mb-6">El formulario se adaptará según tu selección.</p>

        <div className="space-y-3">
          {([
            {
              key: 'busqueda' as const,
              label: 'Busco arriendo',
              sub: 'Estoy buscando habitación o casa donde vivir',
              Icon: Search,
              color: 'text-blue-500',
              bg: 'bg-blue-50',
            },
            {
              key: 'oferta' as const,
              label: 'Ofrezco arriendo',
              sub: 'Tengo una habitación o propiedad disponible',
              Icon: Home,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
          ]).map(({ key, label, sub, Icon, color, bg }) => (
            <button
              key={key}
              onClick={() => setForm((f) => ({ ...f, housingIntention: key }))}
              className="card w-full p-5 flex items-center gap-4 text-left hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Paso 2: formulario según módulo ── */
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={handleBack} className="btn-ghost p-2 -ml-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Nueva publicación</h1>
          <span className="text-sm font-medium" style={{ color: mod?.color }}>{mod?.label}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <select className="input" value={form.city} onChange={set('city')} required>
            <option value="">Selecciona ciudad</option>
            {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            type="text" className="input" value={form.title} onChange={set('title')}
            required placeholder={titlePlaceholder[module]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            className="input min-h-[100px] resize-none" value={form.description}
            onChange={set('description')} required placeholder={descPlaceholder[module]}
          />
        </div>

        {/* Campos específicos HOUSING oferta */}
        {module === 'HOUSING' && form.housingIntention === 'oferta' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Bills</label>
                <select className="input" value={form.housingBills} onChange={set('housingBills')}>
                  <option value="">Seleccionar</option>
                  <option value="incluidas">Incluidas en el precio</option>
                  <option value="no incluidas">No incluidas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Baño</label>
                <select className="input" value={form.housingBano} onChange={set('housingBano')}>
                  <option value="">Seleccionar</option>
                  <option value="independiente">Independiente</option>
                  <option value="compartido">Compartido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Habitación</label>
                <select className="input" value={form.housingHabitacion} onChange={set('housingHabitacion')}>
                  <option value="">Seleccionar</option>
                  <option value="single">Single (solo tú)</option>
                  <option value="compartida">Compartida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estacionamiento</label>
                <select className="input" value={form.housingEstacionamiento} onChange={set('housingEstacionamiento')}>
                  <option value="">Seleccionar</option>
                  <option value="si">Disponible</option>
                  <option value="no">No disponible</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Disponible desde (opcional)</label>
              <input type="date" className="input" value={form.disponibleDesde} onChange={set('disponibleDesde')} />
            </div>
          </>
        )}

        {module === 'JOBS' && (
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de trabajo</label>
            <select className="input" value={form.jobsTipo} onChange={set('jobsTipo')}>
              <option value="">Seleccionar</option>
              <option value="farm">Farm</option>
              <option value="hostelería">Hostelería</option>
              <option value="construcción">Construcción</option>
              <option value="retail">Retail</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        )}

        {module === 'MARKETPLACE' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select className="input" value={form.categoria} onChange={set('categoria')}>
                <option value="">Seleccionar</option>
                <option value="electrónica">Electrónica</option>
                <option value="muebles">Muebles</option>
                <option value="ropa">Ropa</option>
                <option value="electrodomésticos">Electrodomésticos</option>
                <option value="vehículos">Vehículos</option>
                <option value="deportes">Deportes</option>
                <option value="herramientas">Herramientas</option>
                <option value="libros">Libros</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condición</label>
              <select className="input" value={form.condicion} onChange={set('condicion')}>
                <option value="">Seleccionar</option>
                <option value="nuevo">Nuevo</option>
                <option value="buen estado">Buen estado</option>
                <option value="usado">Usado</option>
              </select>
            </div>
          </div>
        )}

        {showPrice && (
          <div>
            <label className="block text-sm font-medium mb-1">
              {module === 'JOBS' ? 'Salario / tarifa (opcional)' :
               module === 'HOUSING' && form.housingIntention === 'busqueda' ? 'Presupuesto máximo / semana (opcional)' :
               module === 'HOUSING' ? 'Precio / semana (opcional)' :
               'Precio (opcional)'}
            </label>
            <input
              type="number" min="0" className="input" value={form.price}
              onChange={set('price')} placeholder="Opcional"
            />
          </div>
        )}

        {showImages && <ImageUploader images={images} onChange={setImages} max={4} />}

        <button type="submit" disabled={createPost.isPending} className="btn-primary w-full">
          {createPost.isPending ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  );
}
