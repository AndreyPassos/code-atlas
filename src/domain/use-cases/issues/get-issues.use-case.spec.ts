import { GetIssuesUseCase } from './get-issues.use-case';
import type { IssuePort } from '../../ports';
import type { PaginatedResult, GetIssuesParams } from '../../value-objects';
import type { Issue, IssueId } from '../../entities';

describe('GetIssuesUseCase', () => {
  let useCase: GetIssuesUseCase;
  let mockIssuePort: jest.Mocked<IssuePort>;

  beforeEach(() => {
    mockIssuePort = {
      getIssues: jest.fn(),
      getComments: jest.fn(),
    };
    useCase = new GetIssuesUseCase(mockIssuePort);
  });

  it('should return issues', async () => {
    const mockResult: PaginatedResult<Issue> = {
      items: [
        {
          id: '1' as IssueId,
          number: 1,
          title: 'Bug report',
          body: 'Something is broken',
          state: 'open',
          author: { login: 'user', avatarUrl: '', type: 'User' },
          labels: [],
          commentsCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pagination: { page: 1, perPage: 20, totalCount: 1 },
    };

    mockIssuePort.getIssues.mockResolvedValue(mockResult);

    const result = await useCase.execute({
      owner: 'facebook',
      name: 'react',
      state: 'all',
      page: 1,
      perPage: 20,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Bug report');
  });

  it('should return empty results when no issues exist', async () => {
    const mockResult: PaginatedResult<Issue> = {
      items: [],
      pagination: { page: 1, perPage: 20, totalCount: 0 },
    };

    mockIssuePort.getIssues.mockResolvedValue(mockResult);

    const result = await useCase.execute({
      owner: 'facebook',
      name: 'react',
      state: 'all',
      page: 1,
      perPage: 20,
    });

    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalCount).toBe(0);
  });
});
