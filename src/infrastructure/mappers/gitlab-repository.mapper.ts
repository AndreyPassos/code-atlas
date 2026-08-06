import type { Repository, Owner } from '../../domain/entities';
import { createRepositoryId } from '../../domain/value-objects';
import type { GitLabRepositoryDTO, GitLabOwnerDTO } from '../dtos/gitlab/gitlab-repository.dto';

// GitLab's `/projects` endpoint only populates `owner` for projects under a
// personal namespace — group-owned projects (the majority on gitlab.com,
// including nested subgroups) return `owner: null`. The namespace path
// (everything before the project name) always reflects the real path
// segment(s) needed to address the project via the API, so it's the only
// reliable source for `login`.
function mapOwner(dto: GitLabOwnerDTO | null, pathWithNamespace: string): Owner {
  const separatorIndex = pathWithNamespace.lastIndexOf('/');
  const login = separatorIndex === -1 ? 'unknown' : pathWithNamespace.slice(0, separatorIndex);
  return {
    login,
    avatarUrl: dto?.avatar_url ?? '',
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
      owner: mapOwner(dto.owner, dto.path_with_namespace),
      updatedAt: new Date(dto.last_activity_at),
      isFavorite: false,
    };
  }
}
