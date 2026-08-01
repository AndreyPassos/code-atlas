import type { RepositoryPort } from '../../ports';
import type { Repository } from '../../entities';

export class GetRepositoryDetailsUseCase {
  constructor(private readonly repositoryPort: RepositoryPort) {}

  async execute(owner: string, name: string): Promise<Repository> {
    return this.repositoryPort.getById(owner, name);
  }
}