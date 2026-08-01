import type { Repository, Owner } from '../../domain/entities';
import type { RepositoryId } from '../../domain/value-objects';
import { createRepositoryId } from '../../domain/value-objects';
import type { GitHubRepositoryDTO, GitHubOwnerDTO } from '../dtos/github/github-repository.dto';

function mapOwner(dto: GitHubOwnerDTO): Owner {
  return {
    login: dto.login,
    avatarUrl: dto.avatar_url,
    type: dto.type,
  };
}

export class GitHubRepositoryMapper {
  static toDomain(dto: GitHubRepositoryDTO): Repository {
    return {
      id: createRepositoryId(String(dto.id)),
      name: dto.name,
      fullName: dto.full_name,
      description: dto.description,
      stars: dto.stargazers_count,
      forks: dto.forks_count,
      language: dto.language,
      owner: mapOwner(dto.owner),
      updatedAt: new Date(dto.updated_at),
      isFavorite: false,
    };
  }
}
