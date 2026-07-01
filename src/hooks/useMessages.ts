import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Conversation, Message, ApiResponse } from '../types';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Conversation[]>>('/messages/conversations');
      return data.data ?? [];
    },
  });
}

interface ChatPage { items: Message[]; hasMore: boolean; nextCursor?: string; user: { id: string; name: string; avatarUrl?: string }; }

export function useChat(userId: string) {
  return useInfiniteQuery({
    queryKey: ['chat', userId],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      const { data } = await api.get<ApiResponse<ChatPage>>(`/messages/${userId}`, { params });
      return data.data!;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!userId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { receiverId: string; content: string; postId?: string }) =>
      api.post<ApiResponse<Message>>('/messages', payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['chat', vars.receiverId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
