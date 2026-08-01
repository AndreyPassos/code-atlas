import type { AxiosInstance } from 'axios';
import type { IssuePort } from '../../../domain/ports';
import type { PaginatedResult, GetIssuesParams, GetCommentsParams } from '../../../domain/value-objects';
import type { Issue, Comment } from '../../../domain/entities';
import type { GitLabIssueDTO, GitLabCommentDTO } from '../../dtos/gitlab/gitlab-issue.dto';
import { GitLabIssueMapper } from '../../mappers/gitlab-issue.mapper';

export class GitLabIssueAdapter implements IssuePort {
  constructor(private readonly apiClient: AxiosInstance) {}

  async getIssues(params: GetIssuesParams): Promise<PaginatedResult<Issue>> {
    const encodedPath = encodeURIComponent(`${params.owner}/${params.name}`);
    const state = params.state === 'all' ? 'all' : params.state === 'open' ? 'opened' : 'closed';

    const response = await this.apiClient.get<ReadonlyArray<GitLabIssueDTO>>(
      `/projects/${encodedPath}/issues`,
      {
        params: {
          state,
          page: params.page,
          per_page: params.perPage,
        },
      }
    );

    const totalCountHeader = response.headers['x-total'];
    const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : response.data.length;

    return {
      items: response.data.map(GitLabIssueMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount,
      },
    };
  }

  async getComments(params: GetCommentsParams): Promise<PaginatedResult<Comment>> {
    const encodedPath = encodeURIComponent(`${params.owner}/${params.name}`);

    const response = await this.apiClient.get<ReadonlyArray<GitLabCommentDTO>>(
      `/projects/${encodedPath}/issues/${params.issueNumber}/notes`,
      {
        params: {
          page: params.page,
          per_page: params.perPage,
        },
      }
    );

    return {
      items: response.data.map(GitLabIssueMapper.commentToDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: response.data.length,
      },
    };
  }
}
