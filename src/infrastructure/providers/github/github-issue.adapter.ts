import type { AxiosInstance } from 'axios';
import type { IssuePort } from '../../../domain/ports';
import type {
  PaginatedResult,
  GetIssuesParams,
  GetCommentsParams,
} from '../../../domain/value-objects';
import type { Issue, Comment } from '../../../domain/entities';
import type { GitHubIssueDTO, GitHubCommentDTO } from '../../dtos/github/github-issue.dto';
import { GitHubIssueMapper } from '../../mappers/github-issue.mapper';

export class GitHubIssueAdapter implements IssuePort {
  constructor(private readonly apiClient: AxiosInstance) {}

  async getIssues(params: GetIssuesParams): Promise<PaginatedResult<Issue>> {
    const response = await this.apiClient.get<readonly GitHubIssueDTO[]>(
      `/repos/${params.owner}/${params.name}/issues`,
      {
        params: {
          state: params.state === 'all' ? 'all' : params.state,
          page: params.page,
          per_page: params.perPage,
        },
      }
    );

    const totalCountHeader = response.headers['x-total-count'];
    const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : response.data.length;

    return {
      items: response.data.map(GitHubIssueMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount,
      },
    };
  }

  async getComments(params: GetCommentsParams): Promise<PaginatedResult<Comment>> {
    const response = await this.apiClient.get<readonly GitHubCommentDTO[]>(
      `/repos/${params.owner}/${params.name}/issues/${params.issueNumber}/comments`,
      {
        params: {
          page: params.page,
          per_page: params.perPage,
        },
      }
    );

    return {
      items: response.data.map(GitHubIssueMapper.commentToDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: response.data.length,
      },
    };
  }
}
