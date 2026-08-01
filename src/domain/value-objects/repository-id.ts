export type RepositoryId = string & { readonly __brand: 'RepositoryId' };

export function createRepositoryId(value: string): RepositoryId {
  return value as RepositoryId;
}

export function getRepositoryIdValue(id: RepositoryId): string {
  return id as string;
}
