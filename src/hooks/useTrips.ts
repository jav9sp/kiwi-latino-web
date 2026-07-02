import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Trip, TripWithBookings, TripFilters, PaginatedResponse, ApiResponse } from '../types';

async function fetchTrips(filters: TripFilters, page: number): Promise<PaginatedResponse<Trip>> {
  const params: Record<string, string | number> = { page, limit: 10 };
  if (filters.origin) params.origin = filters.origin;
  if (filters.destination) params.destination = filters.destination;
  if (filters.date) params.date = filters.date;
  if (filters.status) params.status = filters.status;
  const { data } = await api.get<{ data: PaginatedResponse<Trip> }>('/trips', { params });
  return data.data;
}

export function useTrips(filters: TripFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['trips', filters],
    queryFn: ({ pageParam }) => fetchTrips(filters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TripWithBookings>>(`/trips/${id}`);
      return data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<ApiResponse<Trip>>('/trips', payload);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useBookTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/trips/${tripId}/book`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
      qc.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}

export function useCancelBooking(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/trips/${tripId}/book`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
      qc.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}

export function useAcceptBooking(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => api.post(`/trips/${tripId}/bookings/${bookingId}/accept`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });
}

export function useRejectBooking(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => api.post(`/trips/${tripId}/bookings/${bookingId}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });
}
