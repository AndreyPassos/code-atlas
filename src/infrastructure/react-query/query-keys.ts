export const queryKeys = {
  repositories: {
    all: ['repositories'] as const,
    search: (query: string) => ['repositories', 'search', query] as const,
    details: (owner: string, name: string) => ['repositories', 'details', owner, name] as const,
    readme: (owner: string, name: string) => ['repositories', 'readme', owner, name] as const,
  },
  issues: {
    all: (owner: string, name: string) => ['issues', owner, name] as const,
    list: (owner: string, name: string, state: string) =>
      ['issues', owner, name, state] as const,
    comments: (owner: string, name: string, issueNumber: number) =>
      ['issues', owner, name, issueNumber, 'comments'] as const,
  },
  auth: {
    status: ['auth', 'status'] as const,
    user: ['auth', 'user'] as const,
  },
} as const;
