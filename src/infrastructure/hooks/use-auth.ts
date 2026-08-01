import { create } from 'zustand';
import type { User } from '../../domain/entities';

interface AuthState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly setUser: (user: User | null) => void;
  readonly setAuthenticated: (value: boolean) => void;
  readonly logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
