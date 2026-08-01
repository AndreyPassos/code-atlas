import type { Repository, Owner } from '../../domain/entities';
import { createRepositoryId } from '../../domain/value-objects';
import type { GitLabRepositoryDTO, GitLabOwnerDTO } from '../dtos/gitlab/gitlab-repository.dto';

function mapOwner(dto: GitLabOwnerDTO | null): Owner {
  if (!dto) {
    return { login: 'unknown', avatarUrl: '', type: 'User' };
  }
  return {
    login: dto.username,
    avatarUrl: dto.avatar_url,
    type: 'User',
  };
}

export class GitLabRepositoryMapper {
  static toDomain(dto: GitLabRepositoryDTO): Repository {
    return {
      id: createRepositoryId(String(dto.id)),
      name: dto.name,
      fullName: dto.path_with_namespace,
      description: dto.description,
      stars: dto.star_count,
      forks: dto.forks_count,
      watchers: null,
      language: dto.language,
      owner: mapOwner(dto.owner),
      updatedAt: new Date(dto.last_activity_at),
      isFavorite: false,
    };
  }
}
