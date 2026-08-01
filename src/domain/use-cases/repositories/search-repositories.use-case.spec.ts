import { SearchRepositoriesUseCase } from './search-repositories.use-case';
import type { RepositoryPort } from '../../ports';
import type { PaginatedResult, RepositoryId } from '../../value-objects';
import type { Repository } from '../../entities';

describe('SearchRepositoriesUseCase', () => {
  let useCase: SearchRepositoriesUseCase;
  let mockRepositoryPort: jest.Mocked<RepositoryPort>;

  beforeEach(() => {
    mockRepositoryPort = {
      search: jest.fn(),
      getById: jest.fn(),
      getReadme: jest.fn(),
    };
    useCase = new SearchRepositoriesUseCase(mockRepositoryPort);
  });

  it('should return paginated results', async () => {
    const mockResult: PaginatedResult<Repository> = {
      items: [
        {
          id: '1' as RepositoryId,
          name: 'react',
          fullName: 'facebook/react',
          description: 'A JavaScript library',
          stars: 100000,
          forks: 20000,
          watchers: 1500,
          language: 'JavaScript',
          owner: { login: 'facebook', avatarUrl: '', type: 'Organization' },
          updatedAt: new Date(),
          isFavorite: false,
        },
      ],
      pagination: { page: 1, perPage: 20, totalCount: 1 },
    };

    mockRepositoryPort.search.mockResolvedValue(mockResult);

    const result = await useCase.execute({ query: 'react', page: 1, perPage: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('react');
    expect(mockRepositoryPort.search).toHaveBeenCalledWith({
      query: 'react',
      page: 1,
      perPage: 20,
    });
  });

  it('should return empty results for no matches', async () => {
    const mockResult: PaginatedResult<Repository> = {
      items: [],
      pagination: { page: 1, perPage: 20, totalCount: 0 },
    };

    mockRepositoryPort.search.mockResolvedValue(mockResult);

    const result = await useCase.execute({ query: 'nonexistent', page: 1, perPage: 20 });

    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalCount).toBe(0);
  });
});
