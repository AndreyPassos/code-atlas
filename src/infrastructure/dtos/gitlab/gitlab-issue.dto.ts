export interface GitLabLabelDTO {
  readonly name: string;
  readonly color: string;
}

export interface GitLabIssueDTO {
  readonly id: number;
  readonly iid: number;
  readonly title: string;
  readonly description: string;
  readonly state: 'opened' | 'closed';
  readonly author: {
    readonly username: string;
    readonly avatar_url: string;
  };
  readonly labels: readonly string[];
  readonly user_notes_count: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface GitLabCommentDTO {
  readonly id: number;
  readonly body: string;
  readonly author: {
    readonly username: string;
    readonly avatar_url: string;
  };
  readonly created_at: string;
}
