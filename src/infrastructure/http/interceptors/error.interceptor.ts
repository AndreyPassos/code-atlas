import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface ApiError {
  readonly message: string;
  readonly status: number;
  readonly code: string;
}

export function createErrorInterceptor() {
  return {
    onRejected: (error: AxiosError) => {
      const status = error.response?.status ?? 500;
      const message = error.message || 'An unexpected error occurred';
      const code = error.code ?? 'UNKNOWN_ERROR';

      const apiError: ApiError = { message, status, code };
      return Promise.reject(apiError);
    },
  };
}
