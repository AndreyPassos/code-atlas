import { GitLabRepositoryMapper } from './gitlab-repository.mapper';
import type { GitLabRepositoryDTO } from '../dtos/gitlab/gitlab-repository.dto';

describe('GitLabRepositoryMapper', () => {
  it('should map GitLab DTO to domain entity', () => {
    const dto: GitLabRepositoryDTO = {
      id: 456,
      name: 'gitlab-ce',
      path_with_namespace: 'gitlab-org/gitlab-ce',
      description: 'GitLab Community Edition',
      star_count: 5000,
      forks_count: 1500,
      language: 'Ruby',
      owner: {
        username: 'gitlab-org',
        avatar_url: 'https://example.com/avatar.png',
        state: 'active',
      },
      last_activity_at: '2026-01-15T12:30:00Z',
    };

    const result = GitLabRepositoryMapper.toDomain(dto);

    expect(result.id).toBe('456');
    expect(result.name).toBe('gitlab-ce');
    expect(result.fullName).toBe('gitlab-org/gitlab-ce');
    expect(result.stars).toBe(5000);
    expect(result.forks).toBe(1500);
    expect(result.language).toBe('Ruby');
    expect(result.owner.login).toBe('gitlab-org');
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle null owner', () => {
    const dto: GitLabRepositoryDTO = {
      id: 789,
      name: 'orphan-repo',
      path_with_namespace: 'orphan-repo',
      description: 'A repo with no owner',
      star_count: 10,
      forks_count: 2,
      language: null,
      owner: null,
      last_activity_at: '2026-02-01T00:00:00Z',
    };

    const result = GitLabRepositoryMapper.toDomain(dto);

    expect(result.owner.login).toBe('unknown');
    expect(result.owner.type).toBe('User');
  });
});
