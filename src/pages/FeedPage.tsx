import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { usePostStore } from '../stores/postStore';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { POST_MODULES, NZ_CITIES } from '../constants';

export default function FeedPage() {
  const { filters, setFilters, resetFilters } = usePostStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = usePosts(filters);
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Inicio</h1>
        <button onClick={() => navigate('/posts/new')} className="btn-primary">
          <Plus size={16} /> Publicar
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-5 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={resetFilters}
            className={`btn shrink-0 text-xs ${!filters.module ? 'btn-primary' : 'btn-outline'}`}
          >
            Todos
          </button>
          {POST_MODULES.map((m) => (
            <button
              key={m.key}
              onClick={() => setFilters({ ...filters, module: filters.module === m.key ? undefined : m.key })}
              className={`btn shrink-0 text-xs ${filters.module === m.key ? 'text-white' : 'btn-outline'}`}
              style={filters.module === m.key ? { backgroundColor: m.color, borderColor: m.color } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value={filters.city ?? ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
            className="input text-sm py-1.5 flex-1"
          >
            <option value="">Todas las ciudades</option>
            {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={Search} title="Sin publicaciones" subtitle="No hay publicaciones con estos filtros." actionLabel="Limpiar filtros" onAction={resetFilters} />
      ) : (
        <div className="space-y-4">
          {posts.map((p, i) => {
            if (i === posts.length - 1) return <div ref={lastRef} key={p.id}><PostCard post={p} /></div>;
            return <PostCard key={p.id} post={p} />;
          })}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="animate-spin w-6 h-6 rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
