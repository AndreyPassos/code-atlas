import type { ProviderType } from '../../domain/value-objects';

export const queryKeys = {
  repositories: {
    all: (provider: ProviderType) => ['repositories', provider] as const,
    search: (provider: ProviderType, query: string) =>
      ['repositories', provider, 'search', query] as const,
    details: (provider: ProviderType, owner: string, name: string) =>
      ['repositories', provider, 'details', owner, name] as const,
    readme: (provider: ProviderType, owner: string, name: string) =>
      ['repositories', provider, 'readme', owner, name] as const,
  },
  issues: {
    all: (provider: ProviderType, owner: string, name: string) =>
      ['issues', provider, owner, name] as const,
    list: (provider: ProviderType, owner: string, name: string, state: string) =>
      ['issues', provider, owner, name, state] as const,
    comments: (provider: ProviderType, owner: string, name: string, issueNumber: number) =>
      ['issues', provider, owner, name, issueNumber, 'comments'] as const,
  },
} as const;
