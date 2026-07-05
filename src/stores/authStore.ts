import { create } from 'zustand';
import api from '../lib/api';
import tokenStorage from '../lib/tokenStorage';
import { User, LoginPayload, RegisterPayload, AuthTokens } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (p: LoginPayload) => Promise<void>;
  register: (p: RegisterPayload) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (p: Partial<User>) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (payload) => {
    const { data } = await api.post<{ data: { user: User; tokens: AuthTokens } }>('/auth/login', payload);
    tokenStorage.set('accessToken', data.data.tokens.accessToken);
    tokenStorage.set('refreshToken', data.data.tokens.refreshToken);
    set({ user: data.data.user });
  },

  register: async (payload) => {
    await api.post('/auth/register', payload);
    // backend now requires email verification before login — no tokens returned
  },

  logout: () => {
    tokenStorage.remove('accessToken');
    tokenStorage.remove('refreshToken');
    set({ user: null });
  },

  loadUser: async () => {
    try {
      const accessToken = tokenStorage.get('accessToken');
      const refreshToken = tokenStorage.get('refreshToken');
      if (!accessToken && !refreshToken) { set({ isLoading: false }); return; }
      const { data } = await api.get<{ data: User }>('/users/me');
      set({ user: data.data });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (payload) => {
    const { data } = await api.patch<{ data: User }>('/users/me', payload);
    set((s) => ({ user: { ...s.user!, ...data.data } }));
  },

  resendVerification: async (email) => {
    await api.post('/auth/resend-verification', { email });
  },
}));
