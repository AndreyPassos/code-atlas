import type { RepositoryPort } from '../../ports';
import type { PaginatedResult, SearchParams } from '../../value-objects';
import type { Repository } from '../../entities';

export class SearchRepositoriesUseCase {
  constructor(private readonly repositoryPort: RepositoryPort) {}

  async execute(params: SearchParams): Promise<PaginatedResult<Repository>> {
    return this.repositoryPort.search(params);
  }
}