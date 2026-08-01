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

  // Retry must run before the error interceptor: it needs the raw AxiosError
  // (status, config) to decide whether to retry. The error interceptor's job
  // is to turn whatever survives retries into a friendly ApiError — it must
  // be the last stage, otherwise retry would receive an already-transformed
  // error with no `.config`/`.response` to act on.
  const retryInterceptor = createRetryInterceptor(client, { maxRetries: 3, retryDelay: 1000 });
  client.interceptors.response.use(undefined, retryInterceptor.onRejected);

  const errorInterceptor = createErrorInterceptor();
  client.interceptors.response.use(undefined, errorInterceptor.onRejected);

  return client;
}
