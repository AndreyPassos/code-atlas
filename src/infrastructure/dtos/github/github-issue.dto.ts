interface GitHubOwnerDTO {
  readonly login: string;
  readonly avatar_url: string;
  readonly type: 'User' | 'Organization';
}

export interface GitHubLabelDTO {
  readonly name: string;
  readonly color: string;
}

export interface GitHubIssueDTO {
  readonly id: number;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: 'open' | 'closed';
  readonly user: GitHubOwnerDTO;
  readonly labels: ReadonlyArray<GitHubLabelDTO>;
  readonly comments: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface GitHubCommentDTO {
  readonly id: number;
  readonly body: string;
  readonly user: {
    readonly login: string;
    readonly avatar_url: string;
  };
  readonly created_at: string;
}
