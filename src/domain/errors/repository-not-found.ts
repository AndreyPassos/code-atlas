import { DomainError } from './domain-error';

export class RepositoryNotFoundError extends DomainError {
  constructor(owner: string, name: string) {
    super(`Repository ${owner}/${name} not found`, 'REPOSITORY_NOT_FOUND');
    this.name = 'RepositoryNotFoundError';
  }
}
