import { create } from 'zustand';
import type { ProviderType } from '../../domain/value-objects';

interface ProviderState {
  readonly activeProvider: ProviderType;
  readonly setProvider: (provider: ProviderType) => void;
}

export const useProviderStore = create<ProviderState>((set) => ({
  activeProvider: 'github',
  setProvider: (provider) => set({ activeProvider: provider }),
}));
