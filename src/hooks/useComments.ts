import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Comment, ApiResponse } from '../types';

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ items: Comment[] }>>(`/posts/${postId}/comments`);
      return data.data?.items ?? [];
    },
    enabled: !!postId,
  });
}

export function useCreateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { content });
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  });
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => api.delete(`/posts/${postId}/comments/${commentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  });
}

export function useLikePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (liked: boolean) =>
      liked ? api.delete(`/posts/${postId}/like`) : api.post(`/posts/${postId}/like`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', postId] });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
