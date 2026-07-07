import { Heart, MessageCircle, MapPin, Bookmark, Search, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { POST_MODULES } from '../constants';
import { formatDistanceToNow, formatDate } from '../utils/date';
import UserLink from './UserLink';
import { useSavePost } from '../hooks/usePosts';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const navigate = useNavigate();
  const mod = POST_MODULES.find((m) => m.key === post.module);
  const savePost = useSavePost(post.id);
  const saved = post.savedByMe ?? false;

  return (
    <article
      onClick={() => navigate(`/posts/${post.id}`)}
      className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {post.images?.[0] && (
        <img src={post.images[0]} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {mod && (
            <span className="badge text-white text-xs" style={{ backgroundColor: mod.color }}>
              {mod.label}
            </span>
          )}
          {post.module === 'HOUSING' && post.metadata?.tipo === 'busqueda' && (
            <span className="badge bg-blue-50 text-blue-600 text-xs flex items-center gap-1">
              <Search size={10} /> Busca
            </span>
          )}
          {post.module === 'HOUSING' && post.metadata?.tipo === 'oferta' && (
            <span className="badge bg-emerald-50 text-emerald-700 text-xs flex items-center gap-1">
              <Home size={10} /> Ofrece
            </span>
          )}
          {post.price != null && (
            <span className="badge bg-gray-100 text-gray-700">${post.price} {post.currency ?? 'NZD'}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-400 shrink-0 text-xs">
          <MapPin size={12} />
          {post.city}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.description}</p>

      {post.module === 'HOUSING' && post.metadata?.tipo === 'oferta' && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.metadata.bills === 'incluidas' && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">
              Bills incluidas
            </span>
          )}
          {post.metadata.disponibleDesde && (
            <span className="text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5">
              Desde {formatDate(post.metadata.disponibleDesde as string)}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Heart size={13} /> {post.likeCount ?? 0}</span>
          <span className="flex items-center gap-1"><MessageCircle size={13} /> {post.commentCount ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); savePost.mutate(saved); }}
            disabled={savePost.isPending}
            className={`transition-colors ${saved ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            title={saved ? 'Quitar de guardados' : 'Guardar publicación'}
          >
            <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <UserLink user={post.user} size={20} stopPropagation className="text-gray-400 hover:text-gray-700">
            <span>·</span>
            <span>{formatDistanceToNow(post.createdAt)}</span>
          </UserLink>
        </div>
      </div>
    </article>
  );
}
