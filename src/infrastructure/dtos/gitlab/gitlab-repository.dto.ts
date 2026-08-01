export interface GitLabOwnerDTO {
  readonly username: string;
  readonly avatar_url: string;
  readonly state: string;
}

export interface GitLabRepositoryDTO {
  readonly id: number;
  readonly name: string;
  readonly path_with_namespace: string;
  readonly description: string | null;
  readonly star_count: number;
  readonly forks_count: number;
  readonly language: string | null;
  readonly owner: GitLabOwnerDTO | null;
  readonly last_activity_at: string;
}

export interface GitLabSearchResponseDTO {
  readonly data: ReadonlyArray<GitLabRepositoryDTO>;
  readonly total: number;
  readonly page: number;
  readonly per_page: number;
}
