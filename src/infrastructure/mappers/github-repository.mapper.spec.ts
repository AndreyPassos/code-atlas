import { GitHubRepositoryMapper } from './github-repository.mapper';
import type { GitHubRepositoryDTO } from '../dtos/github/github-repository.dto';

describe('GitHubRepositoryMapper', () => {
  it('should map GitHub DTO to domain entity', () => {
    const dto: GitHubRepositoryDTO = {
      id: 123,
      name: 'react',
      full_name: 'facebook/react',
      description: 'A JavaScript library for building user interfaces',
      stargazers_count: 100000,
      forks_count: 20000,
      language: 'JavaScript',
      owner: {
        login: 'facebook',
        avatar_url: 'https://example.com/avatar.png',
        type: 'Organization',
      },
      updated_at: '2026-01-01T00:00:00Z',
    };

    const result = GitHubRepositoryMapper.toDomain(dto);

    expect(result.id).toBe('123');
    expect(result.name).toBe('react');
    expect(result.fullName).toBe('facebook/react');
    expect(result.stars).toBe(100000);
    expect(result.forks).toBe(20000);
    expect(result.language).toBe('JavaScript');
    expect(result.owner.login).toBe('facebook');
    expect(result.owner.type).toBe('Organization');
    expect(result.updatedAt).toBeInstanceOf(Date);
  });
});
