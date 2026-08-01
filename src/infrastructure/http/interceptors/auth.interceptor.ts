import type { InternalAxiosRequestConfig } from 'axios';

export function createAuthInterceptor(getToken: () => Promise<string | null>) {
  return {
    onRequest: async (config: InternalAxiosRequestConfig) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  };
}
