export type RepositoryId = string & { readonly __brand: 'RepositoryId' };
export type IssueId = string & { readonly __brand: 'IssueId' };
export type IssueState = 'open' | 'closed';
