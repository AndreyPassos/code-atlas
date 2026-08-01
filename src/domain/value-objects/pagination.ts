import { IssueState } from './issue-state';

export interface Pagination {
  readonly page: number;
  readonly perPage: number;
  readonly totalCount: number;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly pagination: Pagination;
}

export interface SearchParams {
  readonly query: string;
  readonly page: number;
  readonly perPage: number;
}

export interface GetIssuesParams {
  readonly owner: string;
  readonly name: string;
  readonly state: IssueState | 'all';
  readonly page: number;
  readonly perPage: number;
}

export interface GetCommentsParams {
  readonly owner: string;
  readonly name: string;
  readonly issueNumber: number;
  readonly page: number;
  readonly perPage: number;
}
