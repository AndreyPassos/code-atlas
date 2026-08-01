import { DomainError } from './domain-error';

export class AuthenticationRequiredError extends DomainError {
  constructor() {
    super('Authentication is required', 'AUTHENTICATION_REQUIRED');
    this.name = 'AuthenticationRequiredError';
  }
}
