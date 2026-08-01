import type { RepositoryPort } from '../../ports';

export class GetRepositoryReadmeUseCase {
  constructor(private readonly repositoryPort: RepositoryPort) {}

  async execute(owner: string, name: string): Promise<string> {
    return this.repositoryPort.getReadme(owner, name);
  }
}