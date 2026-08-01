import type { Issue, Label, Owner, Comment } from '../../domain/entities';
import type { IssueId } from '../../domain/value-objects';
import { createIssueId } from '../../domain/value-objects';
import type { GitHubIssueDTO, GitHubLabelDTO, GitHubCommentDTO } from '../dtos/github/github-issue.dto';

function mapLabel(dto: GitHubLabelDTO): Label {
  return { name: dto.name, color: dto.color };
}

function mapAuthor(user: { login: string; avatar_url: string; type?: string }): Owner {
  return {
    login: user.login,
    avatarUrl: user.avatar_url,
    type: (user.type as 'User' | 'Organization') ?? 'User',
  };
}

export class GitHubIssueMapper {
  static toDomain(dto: GitHubIssueDTO): Issue {
    return {
      id: createIssueId(String(dto.id)),
      number: dto.number,
      title: dto.title,
      body: dto.body,
      state: dto.state,
      author: mapAuthor(dto.user),
      labels: dto.labels.map(mapLabel),
      commentsCount: dto.comments,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  }

  static commentToDomain(dto: GitHubCommentDTO): Comment {
    return {
      id: String(dto.id),
      body: dto.body,
      author: {
        login: dto.user.login,
        avatarUrl: dto.user.avatar_url,
      },
      createdAt: new Date(dto.created_at),
    };
  }
}
