import { useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { useSavedPosts } from '../hooks/usePosts';

export default function SavedPostsPage() {
  const [page, setPage] = useState(1);
  const { data, isError, refetch, isLoading } = useSavedPosts(page);

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center gap-2 mb-6">
        <Bookmark size={20} className="text-primary" />
        <h1 className="text-xl font-bold">Publicaciones guardadas</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Sin publicaciones guardadas"
          subtitle="Guarda publicaciones que te interesen tocando el ícono de marcador."
        />
      )}

      {!isLoading && data && data.items.length > 0 && (
        <>
          <div className="grid gap-4">
            {data.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {data.total > 12 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost p-2 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-500">
                Página {page} de {Math.ceil(data.total / 12)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasMore}
                className="btn-ghost p-2 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
