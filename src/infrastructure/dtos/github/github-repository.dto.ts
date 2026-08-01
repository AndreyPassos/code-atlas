export interface GitHubOwnerDTO {
  readonly login: string;
  readonly avatar_url: string;
  readonly type: 'User' | 'Organization';
}

export interface GitHubRepositoryDTO {
  readonly id: number;
  readonly name: string;
  readonly full_name: string;
  readonly description: string | null;
  readonly stargazers_count: number;
  readonly forks_count: number;
  readonly language: string | null;
  readonly owner: GitHubOwnerDTO;
  readonly updated_at: string;
}

export interface GitHubSearchResponseDTO {
  readonly total_count: number;
  readonly incomplete_results: boolean;
  readonly items: ReadonlyArray<GitHubRepositoryDTO>;
}
