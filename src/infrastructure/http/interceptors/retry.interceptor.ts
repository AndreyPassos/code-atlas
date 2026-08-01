import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & { __retryCount?: number };

export function createRetryInterceptor(client: AxiosInstance, config: RetryConfig = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = config;

  return {
    onRejected: async (error: AxiosError) => {
      const request = error.config as RetryableRequestConfig | undefined;
      if (!request) {
        return Promise.reject(error);
      }

      const retryCount = request.__retryCount ?? 0;
      const status = error.response?.status;
      const isRetryable = !status || status >= 500;

      if (retryCount >= maxRetries || !isRetryable) {
        return Promise.reject(error);
      }

      const nextRetryCount = retryCount + 1;
      request.__retryCount = nextRetryCount;
      await new Promise((resolve) => setTimeout(resolve, retryDelay * nextRetryCount));
      return client(request);
    },
  };
}
