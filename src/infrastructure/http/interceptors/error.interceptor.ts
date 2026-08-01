import type { AxiosError } from 'axios';

export interface ApiError {
  readonly message: string;
  readonly status: number;
  readonly code: string;
}

function toFriendlyMessage(error: AxiosError): string {
  if (!error.response) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
  }

  const status = error.response.status;

  if (status === 403 || status === 429) {
    return 'Limite de requisições da API excedido. Aguarde alguns minutos e tente novamente.';
  }

  if (status === 404) {
    return 'Não encontrado.';
  }

  return error.message || 'Ocorreu um erro inesperado.';
}

export function createErrorInterceptor() {
  return {
    onRejected: (error: AxiosError) => {
      const apiError: ApiError = {
        message: toFriendlyMessage(error),
        status: error.response?.status ?? 0,
        code: error.code ?? 'UNKNOWN_ERROR',
      };
      return Promise.reject(apiError);
    },
  };
}
