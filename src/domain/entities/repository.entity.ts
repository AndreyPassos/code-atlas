import type { RepositoryId } from '../value-objects';
import type { Owner } from './owner.entity';

export interface Repository {
  readonly id: RepositoryId;
  readonly name: string;
  readonly fullName: string;
  readonly description: string | null;
  readonly stars: number;
  readonly forks: number;
  readonly watchers: number | null;
  readonly language: string | null;
  readonly owner: Owner;
  readonly updatedAt: Date;
  readonly isFavorite: boolean;
}
