import { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import CityFilter from '../components/CityFilter';
import { PostModuleKey } from '../constants';

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const filters = { module: 'MARKETPLACE' as PostModuleKey, city: city || undefined };
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = usePosts(filters);
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
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Marketplace</h1>
          <p className="text-sm text-gray-500">Artículos de segunda mano, electrónica, muebles y más</p>
        </div>
        <button onClick={() => navigate('/posts/new')} className="btn-primary">
          <Plus size={16} /> Publicar
        </button>
      </div>

      <CityFilter value={city} onChange={setCity} />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sin publicaciones"
          subtitle="Aún no hay artículos en el marketplace."
        />
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
