import { create } from 'zustand';
import { PostFilters } from '../types';

interface PostStoreState {
  filters: PostFilters;
  setFilters: (f: PostFilters) => void;
  resetFilters: () => void;
}

export const usePostStore = create<PostStoreState>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: {} }),
}));
