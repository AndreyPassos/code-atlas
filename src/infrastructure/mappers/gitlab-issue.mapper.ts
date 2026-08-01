import type { Issue, Label, Comment } from '../../domain/entities';
import { createIssueId } from '../../domain/value-objects';
import type { GitLabIssueDTO, GitLabCommentDTO } from '../dtos/gitlab/gitlab-issue.dto';

function mapLabels(labels: readonly string[]): readonly Label[] {
  return labels.map((name) => ({ name, color: '#007AFF' }));
}

export class GitLabIssueMapper {
  static toDomain(dto: GitLabIssueDTO): Issue {
    return {
      id: createIssueId(String(dto.id)),
      number: dto.iid,
      title: dto.title,
      body: dto.description,
      state: dto.state === 'opened' ? 'open' : 'closed',
      author: {
        login: dto.author.username,
        avatarUrl: dto.author.avatar_url,
        type: 'User',
      },
      labels: mapLabels(dto.labels),
      commentsCount: dto.user_notes_count,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  }

  static commentToDomain(dto: GitLabCommentDTO): Comment {
    return {
      id: String(dto.id),
      body: dto.body,
      author: {
        login: dto.author.username,
        avatarUrl: dto.author.avatar_url,
      },
      createdAt: new Date(dto.created_at),
    };
  }
}
