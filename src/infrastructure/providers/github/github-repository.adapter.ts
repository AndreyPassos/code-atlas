import type { AxiosInstance } from 'axios';
import type { RepositoryPort } from '../../../domain/ports';
import type { PaginatedResult, SearchParams } from '../../../domain/value-objects';
import type { Repository } from '../../../domain/entities';
import type { GitHubSearchResponseDTO } from '../../dtos/github/github-repository.dto';
import { GitHubRepositoryMapper } from '../../mappers/github-repository.mapper';

export class GitHubRepositoryAdapter implements RepositoryPort {
  constructor(private readonly apiClient: AxiosInstance) {}

  async search(params: SearchParams): Promise<PaginatedResult<Repository>> {
    const response = await this.apiClient.get<GitHubSearchResponseDTO>('/search/repositories', {
      params: {
        q: params.query,
        page: params.page,
        per_page: params.perPage,
      },
    });

    return {
      items: response.data.items.map(GitHubRepositoryMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: response.data.total_count,
      },
    };
  }

  async getById(owner: string, name: string): Promise<Repository> {
    const response = await this.apiClient.get(`/repos/${owner}/${name}`);
    return GitHubRepositoryMapper.toDomain(response.data);
  }

  async getReadme(owner: string, name: string): Promise<string> {
    const response = await this.apiClient.get(`/repos/${owner}/${name}/readme`, {
      headers: { Accept: 'application/vnd.github.v3.raw' },
    });
    return response.data;
  }
}
