import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
}

export function createRetryInterceptor(config: RetryConfig = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = config;

  return {
    onRejected: async (error: AxiosError) => {
      const request = error.config as InternalAxiosRequestConfig & { __retryCount?: number };

      if (!request?.__retryCount) {
        request.__retryCount = 0;
      }

      const retryCount = request.__retryCount;
      if (retryCount >= maxRetries) {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      if (status && status >= 500) {
        request.__retryCount = retryCount + 1;
        await new Promise((resolve) => setTimeout(resolve, retryDelay * request.__retryCount));
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  };
}
