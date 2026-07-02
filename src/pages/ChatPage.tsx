import { useState, useEffect, useRef, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react';
import UserLink from '../components/UserLink';
import { useChat, useSendMessage } from '../hooks/useMessages';
import { useAuthStore } from '../stores/authStore';
import { getSocket } from '../lib/socket';
import ErrorState from '../components/ErrorState';
import { formatTime, formatDayLabel } from '../utils/date';

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isError, refetch } = useChat(userId!);
  const send = useSendMessage();
  const [content, setContent] = useState('');
  const [connected, setConnected] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    setConnected(socket.connected);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !userId) return;
    const onTyping    = ({ senderId }: { senderId: string }) => { if (senderId === userId) setPartnerTyping(true); };
    const onStopTyping = ({ senderId }: { senderId: string }) => { if (senderId === userId) setPartnerTyping(false); };
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStopTyping);
    return () => {
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);
    };
  }, [userId]);

  const pages = data?.pages ?? [];
  const messages = pages.flatMap((p) => p.items).reverse();
  const partner = pages[0]?.user;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleTyping = (value: string) => {
    setContent(value);
    const socket = getSocket();
    if (!socket || !userId) return;
    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit('typing', { receiverId: userId });
    }
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit('stop_typing', { receiverId: userId });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const socket = getSocket();
    if (socket && userId && isTyping.current) {
      isTyping.current = false;
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
      socket.emit('stop_typing', { receiverId: userId });
    }
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
        <span className="ml-auto" title={connected ? 'En línea' : 'Sin conexión'}>
          {connected
            ? <Wifi size={16} className="text-green-500" />
            : <WifiOff size={16} className="text-gray-400" />}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => {
          const isMine = msg.senderId === user?.id;
          const msgDay  = new Date(msg.createdAt).toDateString();
          const prevDay = i > 0 ? new Date(messages[i - 1].createdAt).toDateString() : null;
          const showSeparator = msgDay !== prevDay;
          return (
            <Fragment key={msg.id}>
              {showSeparator && (
                <div className="flex items-center justify-center my-3">
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1 capitalize">
                    {formatDayLabel(msg.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[72%] px-3 py-2 rounded-2xl text-sm ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-gray-200 rounded-bl-sm'}`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            </Fragment>
          );
        })}
        {partnerTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white shrink-0 pb-safe">
        <input
          type="text"
          className="input flex-1"
          placeholder="Escribe un mensaje..."
          value={content}
          onChange={(e) => handleTyping(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={send.isPending || !content.trim()} className="btn-primary shrink-0 p-2.5">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
