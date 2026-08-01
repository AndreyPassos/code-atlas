import * as SecureStore from 'expo-secure-store';
import type { StoragePort } from '../../domain/ports';

export class ExpoSecureStoreAdapter implements StoragePort {
  private static instance: ExpoSecureStoreAdapter;

  private constructor() {}

  static getInstance(): ExpoSecureStoreAdapter {
    if (!ExpoSecureStoreAdapter.instance) {
      ExpoSecureStoreAdapter.instance = new ExpoSecureStoreAdapter();
    }
    return ExpoSecureStoreAdapter.instance;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail on storage errors
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail on storage errors
    }
  }
}
