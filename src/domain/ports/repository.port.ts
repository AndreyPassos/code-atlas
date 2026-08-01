import type { Repository } from '../entities';
import type { PaginatedResult, SearchParams } from '../value-objects';

export interface RepositoryPort {
  search(params: SearchParams): Promise<PaginatedResult<Repository>>;
  getById(owner: string, name: string): Promise<Repository>;
  getReadme(owner: string, name: string): Promise<string>;
}
