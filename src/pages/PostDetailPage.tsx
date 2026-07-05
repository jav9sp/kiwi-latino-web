import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, MapPin, Trash2, Send, Pencil, Bookmark } from 'lucide-react';
import ImageSlider from '../components/ImageSlider';
import UserLink from '../components/UserLink';
import ConfirmModal from '../components/ConfirmModal';
import { usePost, useDeletePost, useSavePost } from '../hooks/usePosts';
import { useComments, useCreateComment, useDeleteComment, useLikePost } from '../hooks/useComments';
import { useAuthStore } from '../stores/authStore';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatDistanceToNow } from '../utils/date';
import { POST_MODULES } from '../constants';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: post, isError, refetch } = usePost(id!);
  const { data: comments = [] } = useComments(id!);
  const createComment = useCreateComment(id!);
  const deleteComment = useDeleteComment(id!);
  const deletePost = useDeletePost();
  const likePost = useLikePost(id!);
  const savePost = useSavePost(id!);
  const [content, setContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeletePost = async () => {
    await deletePost.mutateAsync(id!);
    setShowDeleteModal(false);
    navigate(-1);
  };

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;
  if (!post) return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" /></div>;

  const mod = POST_MODULES.find((m) => m.key === post.module);
  const isOwner = post.user?.id === user?.id;
  const liked = post.likedByMe ?? false;
  const saved = post.savedByMe ?? false;

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createComment.mutateAsync(content.trim());
    setContent('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="card overflow-hidden mb-4">
        {post.images && post.images.length > 0 && <ImageSlider images={post.images} />}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {mod && <span className="badge text-white text-xs" style={{ backgroundColor: mod.color }}>{mod.label}</span>}
            <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} /> {post.city}</span>
            {post.price != null && <span className="badge bg-gray-100 text-gray-700">${post.price} {post.currency ?? 'NZD'}</span>}
          </div>

          <h1 className="text-xl font-bold mb-2">{post.title}</h1>
          <p className="text-gray-600 mb-4 whitespace-pre-line">{post.description}</p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <UserLink user={post.user} size={28} className="text-sm text-gray-500">
              <span>·</span>
              <span>{formatDistanceToNow(post.createdAt)}</span>
            </UserLink>
            <div className="flex items-center gap-2">
              <button
                onClick={() => savePost.mutate(saved)}
                disabled={savePost.isPending}
                className={`transition-colors ${saved ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                title={saved ? 'Quitar de guardados' : 'Guardar publicación'}
              >
                <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => likePost.mutate(liked)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                {post.likeCount ?? 0}
              </button>
              {!isOwner && post.user?.id && (
                <button
                  onClick={() => navigate(`/chat/${post.user!.id}`)}
                  className="btn-outline text-xs py-1 px-2"
                >
                  <MessageCircle size={14} /> Contactar
                </button>
              )}
              {isOwner && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/posts/${post.id}/edit`)}
                    className="btn-ghost p-1.5 text-gray-400 hover:text-primary"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-ghost p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="card p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><MessageCircle size={16} /> Comentarios ({comments.length})</h2>

        {comments.length === 0 && (
          <EmptyState icon={MessageCircle} title="Sin comentarios" subtitle="Sé el primero en comentar." />
        )}

        <div className="space-y-3 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {c.user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{c.user?.name}</span>
                  <span className="text-xs text-gray-400">{formatDistanceToNow(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{c.content}</p>
              </div>
              {(c.userId === user?.id || isOwner) && (
                <button onClick={() => deleteComment.mutate(c.id)} className="btn-ghost p-1 text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={submitComment} className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder="Escribe un comentario..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" disabled={createComment.isPending || !content.trim()} className="btn-primary shrink-0">
            <Send size={16} />
          </button>
        </form>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Eliminar publicación"
          message="¿Estás seguro? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          danger
          loading={deletePost.isPending}
          onConfirm={handleDeletePost}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
