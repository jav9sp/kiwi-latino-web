import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import UserLink from '../components/UserLink';
import { useChat, useSendMessage } from '../hooks/useMessages';
import { useAuthStore } from '../stores/authStore';
import ErrorState from '../components/ErrorState';
import { formatTime } from '../utils/date';

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isError, refetch } = useChat(userId!);
  const send = useSendMessage();
  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const pages = data?.pages ?? [];
  const messages = pages.flatMap((p) => p.items).reverse();
  const partner = pages[0]?.user;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await send.mutateAsync({ receiverId: userId!, content: content.trim() });
    setContent('');
  };

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 -ml-2">
          <ArrowLeft size={18} />
        </button>
        <UserLink user={partner} size={36} className="text-sm font-semibold" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[72%] px-3 py-2 rounded-2xl text-sm ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-gray-200 rounded-bl-sm'}`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white shrink-0 pb-safe">
        <input
          type="text"
          className="input flex-1"
          placeholder="Escribe un mensaje..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={send.isPending || !content.trim()} className="btn-primary shrink-0 p-2.5">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
