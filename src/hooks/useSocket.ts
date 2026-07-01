import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';
import tokenStorage from '../lib/tokenStorage';
import type { Message } from '../types';

export function useSocketConnection() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const token = tokenStorage.get('accessToken');
    if (!token) return;

    const socket = connectSocket(token);

    // Cuando llega un mensaje nuevo, actualiza el cache del chat correspondiente
    // e invalida las conversaciones para refrescar los contadores de no leídos
    const handleNewMessage = (message: Message) => {
      const partnerId =
        message.senderId === user.id ? message.receiverId : message.senderId;

      // Añadir al cache del chat solo si no existe ya (evita duplicados con la respuesta REST)
      qc.setQueryData(
        ['chat', partnerId],
        (old: { pages: { items: Message[] }[]; pageParams: unknown[] } | undefined) => {
          if (!old?.pages?.[0]) return old;
          const alreadyExists = old.pages.some((p) =>
            p.items.some((m) => m.id === message.id),
          );
          if (alreadyExists) return old;
          return {
            ...old,
            pages: [
              { ...old.pages[0], items: [message, ...old.pages[0].items] },
              ...old.pages.slice(1),
            ],
          };
        },
      );

      // Refrescar lista de conversaciones
      qc.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [user?.id, qc]);
}
