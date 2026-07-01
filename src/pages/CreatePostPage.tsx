import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreatePost } from '../hooks/usePosts';
import { useAuthStore } from '../stores/authStore';
import { POST_MODULES, NZ_CITIES, PostModuleKey } from '../constants';
import ImageUploader from '../components/ImageUploader';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createPost = useCreatePost();
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', module: '' as PostModuleKey | '',
    city: user?.cityNz ?? '', price: '',
    // HOUSING
    housingTipo: '' as 'pieza' | 'casa' | 'carpa' | 'cabaña' | '',
    disponibleDesde: '',
    // JOBS
    jobsTipo: '' as 'farm' | 'hostelería' | 'construcción' | 'retail' | 'otro' | '',
    // MARKETPLACE
    categoria: '' as 'electrónica' | 'muebles' | 'ropa' | 'electrodomésticos' | 'vehículos' | 'deportes' | 'herramientas' | 'libros' | 'otro' | '',
    condicion: '' as 'nuevo' | 'buen estado' | 'usado' | '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const metadata: Record<string, unknown> = {};
    if (form.module === 'HOUSING') {
      if (form.housingTipo) metadata.tipo = form.housingTipo;
      if (form.disponibleDesde) metadata.disponibleDesde = form.disponibleDesde;
    }
    if (form.module === 'JOBS') {
      if (form.jobsTipo) metadata.tipo = form.jobsTipo;
    }
    if (form.module === 'MARKETPLACE') {
      if (form.categoria) metadata.categoria = form.categoria;
      if (form.condicion) metadata.condicion = form.condicion;
    }

    const payload: Record<string, unknown> = {
      module: form.module,
      title: form.title,
      description: form.description,
      city: form.city,
      images,
    };
    if (form.price) payload.price = Number(form.price);
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    await createPost.mutateAsync(payload);
    navigate('/feed');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="text-xl font-bold mb-5">Nueva publicación</h1>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Módulo</label>
          <select className="input" value={form.module} onChange={set('module')} required>
            <option value="">Selecciona un módulo</option>
            {POST_MODULES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
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
          <textarea className="input min-h-[100px] resize-none" value={form.description} onChange={set('description')} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Precio (NZD, opcional)</label>
          <input type="number" min="0" className="input" value={form.price} onChange={set('price')} />
        </div>

        <ImageUploader images={images} onChange={setImages} max={4} />

        {/* Campos específicos por módulo */}
        {form.module === 'HOUSING' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de alojamiento</label>
              <select className="input" value={form.housingTipo} onChange={set('housingTipo')}>
                <option value="">Seleccionar</option>
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
        {form.module === 'JOBS' && (
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
        {form.module === 'MARKETPLACE' && (
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

        <button type="submit" disabled={createPost.isPending} className="btn-primary w-full">
          {createPost.isPending ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  );
}
