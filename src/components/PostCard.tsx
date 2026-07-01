import { Heart, MessageCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { POST_MODULES } from '../constants';
import { formatDistanceToNow } from '../utils/date';
import UserLink from './UserLink';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const navigate = useNavigate();
  const mod = POST_MODULES.find((m) => m.key === post.module);

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
          {post.price != null && (
            <span className="badge bg-gray-100 text-gray-700">${post.price} NZD</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-400 shrink-0 text-xs">
          <MapPin size={12} />
          {post.city}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Heart size={13} /> {post.likeCount ?? 0}</span>
          <span className="flex items-center gap-1"><MessageCircle size={13} /> {post.commentCount ?? 0}</span>
        </div>
        <UserLink user={post.user} size={20} stopPropagation className="text-gray-400 hover:text-gray-700">
          <span>·</span>
          <span>{formatDistanceToNow(post.createdAt)}</span>
        </UserLink>
      </div>
    </article>
  );
}
