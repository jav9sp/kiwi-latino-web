import { useNavigate } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';
import { useConversations } from '../hooks/useMessages';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatDistanceToNow } from '../utils/date';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { data: conversations = [], isError, refetch } = useConversations();

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-xl font-bold mb-5">Mensajes</h1>

      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Sin conversaciones" subtitle="Cuando contactes a alguien, tus conversaciones aparecerán aquí." />
      ) : (
        <div className="card divide-y divide-gray-100 overflow-hidden">
          {conversations.map((conv, i) => {
            const partner = conv.user;
            return (
              <div key={partner.id ?? i} className="flex items-center hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => navigate(`/chat/${partner.id}`)}
                  className="flex items-center gap-3 p-4 flex-1 min-w-0 text-left"
                >
                  {partner.avatarUrl ? (
                    <img src={partner.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                      {partner.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-sm truncate">{partner.name}</span>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400 shrink-0">{formatDistanceToNow(conv.lastMessage.createdAt)}</span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">{conv.lastMessage.content}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/profile/${partner.id}`)}
                  className="btn-ghost p-3 mr-2 text-gray-400 hover:text-primary shrink-0"
                  title="Ver perfil"
                >
                  <User size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
