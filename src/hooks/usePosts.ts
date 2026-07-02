import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Post, PaginatedResponse, PostFilters, ApiResponse } from '../types';

async function fetchPosts(filters: PostFilters, page: number): Promise<PaginatedResponse<Post>> {
  const params: Record<string, string | number> = { page, limit: 12 };
  if (filters.module) params.module = filters.module;
  if (filters.city) params.city = filters.city;
  if (filters.minPrice != null) params.minPrice = filters.minPrice;
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
  if (filters.tipoAlojamiento) params.tipoAlojamiento = filters.tipoAlojamiento;
  if (filters.disponibleDesde) params.disponibleDesde = filters.disponibleDesde;
  if (filters.tipoTrabajo) params.tipoTrabajo = filters.tipoTrabajo;
  if (filters.categoria) params.categoria = filters.categoria;
  if (filters.condicion) params.condicion = filters.condicion;
  const { data } = await api.get<{ data: PaginatedResponse<Post> }>('/posts', { params });
  return data.data;
}

export function usePosts(filters: PostFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['posts', filters],
    queryFn: ({ pageParam }) => fetchPosts(filters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Post>>(`/posts/${id}`);
      return data.data!;
    },
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData | Record<string, unknown>) => {
      const { data } = await api.post<ApiResponse<Post>>('/posts', payload);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.patch<ApiResponse<Post>>(`/posts/${id}`, payload);
      return data.data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post', id] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useSavePost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (saved: boolean) =>
      saved ? api.delete(`/posts/${id}/save`) : api.post(`/posts/${id}/save`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', id] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['saved-posts'] });
    },
  });
}

export function useSavedPosts(page = 1) {
  return useQuery({
    queryKey: ['saved-posts', page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Post>>>('/users/me/saved-posts', { params: { page, limit: 12 } });
      return data.data!;
    },
  });
}
