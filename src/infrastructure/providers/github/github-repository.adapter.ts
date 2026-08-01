import type { AxiosInstance } from 'axios';
import type { RepositoryPort } from '../../../domain/ports';
import type { PaginatedResult, SearchParams } from '../../../domain/value-objects';
import type { Repository } from '../../../domain/entities';
import type {
  GitHubSearchResponseDTO,
  GitHubRepositoryDTO,
} from '../../dtos/github/github-repository.dto';
import { GitHubRepositoryMapper } from '../../mappers/github-repository.mapper';

export class GitHubRepositoryAdapter implements RepositoryPort {
  constructor(private readonly apiClient: AxiosInstance) {}

  async search(params: SearchParams): Promise<PaginatedResult<Repository>> {
    const response = await this.apiClient.get<GitHubSearchResponseDTO>('/search/repositories', {
      params: {
        q: params.query,
        sort: 'stars',
        order: 'desc',
        page: params.page,
        per_page: params.perPage,
      },
    });

    if (!Array.isArray(response.data.items)) {
      throw new Error(
        'Resposta inesperada da API do GitHub (formato inválido). Verifique sua conexão e tente novamente.'
      );
    }

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
    const response = await this.apiClient.get<GitHubRepositoryDTO>(`/repos/${owner}/${name}`);
    return GitHubRepositoryMapper.toDomain(response.data);
  }

  async getReadme(owner: string, name: string): Promise<string> {
    const response = await this.apiClient.get<string>(`/repos/${owner}/${name}/readme`, {
      headers: { Accept: 'application/vnd.github.v3.raw' },
    });
    return response.data;
  }
}
