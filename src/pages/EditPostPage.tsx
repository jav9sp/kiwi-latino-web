import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Home } from 'lucide-react';
import { usePost, useUpdatePost } from '../hooks/usePosts';
import { useAuthStore } from '../stores/authStore';
import { POST_MODULES, NZ_CITIES } from '../constants';
import ImageUploader from '../components/ImageUploader';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: post, isLoading } = usePost(id!);
  const updatePost = useUpdatePost(id!);

  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', city: '', price: '',
    housingIntention: '' as 'busqueda' | 'oferta' | '',
    housingBills: '',
    housingBano: '',
    housingEstacionamiento: '',
    housingHabitacion: '',
    disponibleDesde: '',
    jobsTipo: '',
    categoria: '', condicion: '',
  });

  useEffect(() => {
    if (post && !initialized) {
      const meta = post.metadata ?? {};
      setForm({
        title:                post.title,
        description:          post.description,
        city:                 post.city,
        price:                post.price?.toString() ?? '',
        housingIntention:     (meta.tipo as 'busqueda' | 'oferta') ?? '',
        housingBills:         (meta.bills as string) ?? '',
        housingBano:          (meta.bano as string) ?? '',
        housingEstacionamiento: meta.estacionamiento === true ? 'si' : meta.estacionamiento === false ? 'no' : '',
        housingHabitacion:    (meta.habitacion as string) ?? '',
        disponibleDesde:      (meta.disponibleDesde as string) ?? '',
        jobsTipo:             (meta.tipo as string) ?? '',
        categoria:            (meta.categoria as string) ?? '',
        condicion:            (meta.condicion as string) ?? '',
      });
      setImages(post.images ?? []);
      setInitialized(true);
    }
  }, [post, initialized]);

  const set = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (isLoading || !post) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (post.user?.id !== user?.id) {
    navigate(-1);
    return null;
  }

  const mod = POST_MODULES.find((m) => m.key === post.module);
  const isHousingBusqueda = post.module === 'HOUSING' && form.housingIntention === 'busqueda';
  const showImages = post.module !== 'JOBS' && !isHousingBusqueda;
  const showPrice  = post.module === 'HOUSING' || post.module === 'MARKETPLACE' || post.module === 'JOBS';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const metadata: Record<string, unknown> = { ...post.metadata };

    if (post.module === 'HOUSING') {
      metadata.tipo = form.housingIntention;
      if (form.housingIntention === 'oferta') {
        if (form.housingBills) metadata.bills = form.housingBills;
        if (form.housingBano) metadata.bano = form.housingBano;
        if (form.housingEstacionamiento) metadata.estacionamiento = form.housingEstacionamiento === 'si';
        if (form.housingHabitacion) metadata.habitacion = form.housingHabitacion;
        if (form.disponibleDesde) metadata.disponibleDesde = form.disponibleDesde;
        else delete metadata.disponibleDesde;
      }
    }
    if (post.module === 'JOBS' && form.jobsTipo) metadata.tipo = form.jobsTipo;
    if (post.module === 'MARKETPLACE') {
      if (form.categoria) metadata.categoria = form.categoria;
      if (form.condicion) metadata.condicion = form.condicion;
    }

    const payload: Record<string, unknown> = {
      title:       form.title,
      description: form.description,
      city:        form.city,
      images,
    };
    if (form.price) payload.price = Number(form.price);
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    try {
      await updatePost.mutateAsync(payload);
      navigate(`/posts/${id}`, { replace: true });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      setError(data?.error ?? data?.message ?? 'Error al guardar los cambios.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 -ml-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Editar publicación</h1>
          {mod && <span className="text-sm font-medium" style={{ color: mod.color }}>{mod.label}</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        {/* Badge de intención (solo housing, no editable) */}
        {post.module === 'HOUSING' && form.housingIntention && (
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
            {form.housingIntention === 'busqueda'
              ? <Search size={16} className="text-blue-500 shrink-0" />
              : <Home size={16} className="text-emerald-600 shrink-0" />
            }
            <div>
              <p className="text-xs text-gray-400">Tipo de publicación</p>
              <p className="text-sm font-medium">
                {form.housingIntention === 'busqueda' ? 'Busqueda de arriendo' : 'Oferta de arriendo'}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <select className="input" value={form.city} onChange={set('city')} required>
            <option value="">Selecciona ciudad</option>
            {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input type="text" className="input" value={form.title} onChange={set('title')} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            className="input min-h-[100px] resize-none"
            value={form.description} onChange={set('description')} required
          />
        </div>

        {/* Campos housing oferta */}
        {post.module === 'HOUSING' && form.housingIntention === 'oferta' && (
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

        {post.module === 'JOBS' && (
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

        {post.module === 'MARKETPLACE' && (
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
              {post.module === 'JOBS' ? 'Salario / tarifa (opcional)' :
               isHousingBusqueda ? 'Presupuesto máximo / semana (opcional)' :
               post.module === 'HOUSING' ? 'Precio / semana (opcional)' :
               'Precio (opcional)'}
            </label>
            <input
              type="number" min="0" className="input" value={form.price}
              onChange={set('price')} placeholder="Opcional"
            />
          </div>
        )}

        {showImages && <ImageUploader images={images} onChange={setImages} max={4} />}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={updatePost.isPending} className="btn-primary flex-1">
            {updatePost.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
