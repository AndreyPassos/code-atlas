import type { AxiosInstance } from 'axios';
import type { RepositoryPort } from '../../../domain/ports';
import type { PaginatedResult, SearchParams } from '../../../domain/value-objects';
import type { Repository } from '../../../domain/entities';
import type {
  GitLabRepositoryDTO,
  GitLabReadmeFileDTO,
} from '../../dtos/gitlab/gitlab-repository.dto';
import { GitLabRepositoryMapper } from '../../mappers/gitlab-repository.mapper';

export class GitLabRepositoryAdapter implements RepositoryPort {
  constructor(private readonly apiClient: AxiosInstance) {}

  async search(params: SearchParams): Promise<PaginatedResult<Repository>> {
    // GitLab's /projects list endpoint returns a plain JSON array — pagination
    // metadata comes back in response headers (X-Total, ...), not the body.
    const response = await this.apiClient.get<readonly GitLabRepositoryDTO[]>('/projects', {
      params: {
        search: params.query,
        order_by: 'star_count',
        sort: 'desc',
        page: params.page,
        per_page: params.perPage,
      },
    });

    if (!Array.isArray(response.data)) {
      throw new Error(
        'Resposta inesperada da API do GitLab (formato inválido). Verifique sua conexão e tente novamente.'
      );
    }

    const totalCountHeader = response.headers['x-total'];
    const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : response.data.length;

    return {
      items: response.data.map(GitLabRepositoryMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount,
      },
    };
  }

  async getById(owner: string, name: string): Promise<Repository> {
    const encodedPath = encodeURIComponent(`${owner}/${name}`);
    const response = await this.apiClient.get<GitLabRepositoryDTO>(`/projects/${encodedPath}`);
    return GitLabRepositoryMapper.toDomain(response.data);
  }

  async getReadme(owner: string, name: string): Promise<string> {
    const encodedPath = encodeURIComponent(`${owner}/${name}`);
    const response = await this.apiClient.get<GitLabReadmeFileDTO>(
      `/projects/${encodedPath}/repository/files/README.md`,
      { params: { ref: 'main' } }
    );
    return atob(response.data.content);
  }
}
