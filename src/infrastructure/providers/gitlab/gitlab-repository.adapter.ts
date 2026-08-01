import type { AxiosInstance } from 'axios';
import type { RepositoryPort } from '../../../domain/ports';
import type { PaginatedResult, SearchParams } from '../../../domain/value-objects';
import type { Repository } from '../../../domain/entities';
import type { GitLabSearchResponseDTO } from '../../dtos/gitlab/gitlab-repository.dto';
import { GitLabRepositoryMapper } from '../../mappers/gitlab-repository.mapper';

export class GitLabRepositoryAdapter implements RepositoryPort {
  constructor(private readonly apiClient: AxiosInstance) {}

  async search(params: SearchParams): Promise<PaginatedResult<Repository>> {
    const response = await this.apiClient.get<GitLabSearchResponseDTO>('/projects', {
      params: {
        search: params.query,
        page: params.page,
        per_page: params.perPage,
        order_by: 'last_activity_at',
        sort: 'desc',
      },
    });

    return {
      items: response.data.data.map(GitLabRepositoryMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: response.data.total,
      },
    };
  }

  async getById(owner: string, name: string): Promise<Repository> {
    const encodedPath = encodeURIComponent(`${owner}/${name}`);
    const response = await this.apiClient.get(`/projects/${encodedPath}`);
    return GitLabRepositoryMapper.toDomain(response.data);
  }

  async getReadme(owner: string, name: string): Promise<string> {
    const encodedPath = encodeURIComponent(`${owner}/${name}`);
    const response = await this.apiClient.get(`/projects/${encodedPath}/repository/files/README.md`, {
      params: { ref: 'main' },
    });
    return atob(response.data.content);
  }
}
