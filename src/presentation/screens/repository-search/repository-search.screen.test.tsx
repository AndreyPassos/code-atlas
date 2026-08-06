import { render, fireEvent, screen } from '@testing-library/react-native';
import { RepositorySearchScreen } from './repository-search.screen';
import { useSearchRepositories } from '../../../infrastructure/react-query';
import { useProviderStore } from '../../../infrastructure/hooks';
import type { Repository } from '../../../domain/entities';
import type { TabScreenProps } from '../../navigation/types';

jest.mock('../../../infrastructure/react-query', () => ({
  useSearchRepositories: jest.fn(),
}));

jest.mock('../../../infrastructure/hooks', () => ({
  useProviderStore: jest.fn(),
}));

const mockUseSearchRepositories = useSearchRepositories as jest.Mock;
const mockUseProviderStore = useProviderStore as unknown as jest.Mock;

const repository: Repository = {
  id: 'repo-1' as Repository['id'],
  name: 'code-atlas',
  fullName: 'AndreyPassos/code-atlas',
  description: 'A repository browser',
  stars: 42,
  forks: 3,
  watchers: 10,
  language: 'TypeScript',
  owner: { login: 'AndreyPassos', avatarUrl: 'https://example.com/avatar.png', type: 'User' },
  updatedAt: new Date('2026-01-01'),
  isFavorite: false,
};

function mockSearchResult(overrides: Partial<ReturnType<typeof useSearchRepositories>> = {}) {
  mockUseSearchRepositories.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isRefetching: false,
    ...overrides,
  });
}

const navigation = {
  navigate: jest.fn(),
} as unknown as TabScreenProps<'RepositorySearch'>['navigation'];

describe('RepositorySearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const state = { activeProvider: 'github', setProvider: jest.fn() };
    mockUseProviderStore.mockImplementation((selector) => (selector ? selector(state) : state));
  });

  it('shows a spinner while loading', async () => {
    mockSearchResult({ isLoading: true });
    await render(<RepositorySearchScreen navigation={navigation} route={{} as never} />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('shows an empty state when there are no results', async () => {
    mockSearchResult({ data: { pages: [], pageParams: [] } });
    await render(<RepositorySearchScreen navigation={navigation} route={{} as never} />);
    expect(screen.getByText('Nenhum repositório encontrado')).toBeTruthy();
  });

  it('shows a full-screen error state when a query with no cached data fails', async () => {
    mockSearchResult({ isError: true, error: new Error('Network down') });
    await render(<RepositorySearchScreen navigation={navigation} route={{} as never} />);
    expect(screen.getByText('Network down')).toBeTruthy();
  });

  it('renders results and navigates to details on press', async () => {
    mockSearchResult({
      data: {
        pages: [{ items: [repository], pagination: { page: 1, perPage: 20, totalCount: 1 } }],
        pageParams: [1],
      },
    });
    await render(<RepositorySearchScreen navigation={navigation} route={{} as never} />);

    expect(screen.getByText('code-atlas')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Abrir AndreyPassos/code-atlas'));

    expect(navigation.navigate).toHaveBeenCalledWith('RepositoryDetails', {
      owner: 'AndreyPassos',
      name: 'code-atlas',
    });
  });

  it('navigates using the URL slug from fullName, not the display name, when they differ (e.g. GitLab)', async () => {
    const gitlabRepo: Repository = {
      ...repository,
      id: 'repo-2' as Repository['id'],
      name: 'Pipes and Paper',
      fullName: 'afandian/pipes-and-paper',
      owner: { login: 'afandian', avatarUrl: '', type: 'User' },
    };
    mockSearchResult({
      data: {
        pages: [{ items: [gitlabRepo], pagination: { page: 1, perPage: 20, totalCount: 1 } }],
        pageParams: [1],
      },
    });
    await render(<RepositorySearchScreen navigation={navigation} route={{} as never} />);

    await fireEvent.press(screen.getByLabelText('Abrir afandian/pipes-and-paper'));

    expect(navigation.navigate).toHaveBeenCalledWith('RepositoryDetails', {
      owner: 'afandian',
      name: 'pipes-and-paper',
    });
  });
});
