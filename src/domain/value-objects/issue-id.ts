export type IssueId = string & { readonly __brand: 'IssueId' };

export function createIssueId(value: string): IssueId {
  return value as IssueId;
}
