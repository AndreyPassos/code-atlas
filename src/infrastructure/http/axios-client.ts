import axios from 'axios';
import { createAuthInterceptor } from './interceptors/auth.interceptor';
import { createErrorInterceptor } from './interceptors/error.interceptor';
import { createRetryInterceptor } from './interceptors/retry.interceptor';

interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  getToken?: () => Promise<string | null>;
}

export function createHttpClient(config: HttpClientConfig) {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 10000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (config.getToken) {
    const authInterceptor = createAuthInterceptor(config.getToken);
    client.interceptors.request.use(authInterceptor.onRequest);
  }

  const errorInterceptor = createErrorInterceptor();
  client.interceptors.response.use(undefined, errorInterceptor.onRejected);

  const retryInterceptor = createRetryInterceptor({ maxRetries: 3, retryDelay: 1000 });
  client.interceptors.response.use(undefined, retryInterceptor.onRejected);

  return client;
}
