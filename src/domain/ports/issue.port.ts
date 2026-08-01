import type { Issue, Comment } from '../entities';
import type { PaginatedResult, GetIssuesParams, GetCommentsParams } from '../value-objects';

export interface IssuePort {
  getIssues(params: GetIssuesParams): Promise<PaginatedResult<Issue>>;
  getComments(params: GetCommentsParams): Promise<PaginatedResult<Comment>>;
}
