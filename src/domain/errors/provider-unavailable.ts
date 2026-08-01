import { DomainError } from './domain-error';

export class ProviderUnavailableError extends DomainError {
  constructor(provider: string) {
    super(`Provider ${provider} is unavailable`, 'PROVIDER_UNAVAILABLE');
    this.name = 'ProviderUnavailableError';
  }
}
