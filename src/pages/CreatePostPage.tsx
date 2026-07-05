import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Briefcase, ShoppingBag, Car, Users, ChevronRight } from 'lucide-react';
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
  const [form, setForm] = useState({
    title: '', description: '', city: user?.cityNz ?? '', price: '',
    housingTipo: '', disponibleDesde: '',
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

  const handleBack = () => { setModule(null); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;

    const metadata: Record<string, unknown> = {};
    if (module === 'HOUSING') {
      if (form.housingTipo) metadata.tipo = form.housingTipo;
      if (form.disponibleDesde) metadata.disponibleDesde = form.disponibleDesde;
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
  const showImages = module !== 'JOBS';
  const showPrice  = module === 'HOUSING' || module === 'MARKETPLACE' || module === 'JOBS';

  const titlePlaceholder: Record<string, string> = {
    HOUSING:     'Ej: Pieza disponible en Auckland',
    JOBS:        'Ej: Se busca trabajador para farm',
    MARKETPLACE: 'Ej: iPhone 12 en buen estado',
    COMMUNITY:   'Ej: Reunión de latinos en Wellington',
  };
  const descPlaceholder: Record<string, string> = {
    HOUSING:     'Describe el alojamiento, ubicación, servicios incluidos...',
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

        {/* Campos específicos */}
        {module === 'HOUSING' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select className="input" value={form.housingTipo} onChange={set('housingTipo')}>
                <option value="">Cualquiera</option>
                <option value="pieza">Pieza</option>
                <option value="casa">Casa</option>
                <option value="carpa">Carpa</option>
                <option value="cabaña">Cabaña</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Disponible desde</label>
              <input type="date" className="input" value={form.disponibleDesde} onChange={set('disponibleDesde')} />
            </div>
          </div>
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
              {module === 'JOBS' ? 'Salario / tarifa (opcional)' : 'Precio (opcional)'}
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
