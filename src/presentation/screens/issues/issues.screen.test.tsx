import { render, fireEvent, screen } from '@testing-library/react-native';
import { IssuesScreen } from './issues.screen';
import { useIssues } from '../../../infrastructure/react-query';
import { useProviderStore } from '../../../infrastructure/hooks';
import type { Issue } from '../../../domain/entities';
import type { MainStackScreenProps } from '../../navigation/types';

jest.mock('../../../infrastructure/react-query', () => ({
  useIssues: jest.fn(),
}));

jest.mock('../../../infrastructure/hooks', () => ({
  useProviderStore: jest.fn(),
}));

const mockUseIssues = useIssues as jest.Mock;
const mockUseProviderStore = useProviderStore as unknown as jest.Mock;

const issue: Issue = {
  id: 'issue-1' as Issue['id'],
  number: 42,
  title: 'Bug on login',
  body: 'Steps to reproduce...',
  state: 'open',
  author: { login: 'octocat', avatarUrl: 'https://example.com/avatar.png', type: 'User' },
  labels: [],
  commentsCount: 3,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function mockIssuesResult(overrides: Partial<ReturnType<typeof useIssues>> = {}) {
  mockUseIssues.mockReturnValue({
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

const route = {
  params: { owner: 'octocat', name: 'hello-world' },
} as unknown as MainStackScreenProps<'Issues'>['route'];
const navigation = {} as unknown as MainStackScreenProps<'Issues'>['navigation'];

describe('IssuesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProviderStore.mockImplementation((selector) => selector({ activeProvider: 'github' }));
  });

  it('shows a spinner while loading', async () => {
    mockIssuesResult({ isLoading: true });
    await render(<IssuesScreen route={route} navigation={navigation} />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('shows an empty state when there are no issues', async () => {
    mockIssuesResult({ data: { pages: [], pageParams: [] } });
    await render(<IssuesScreen route={route} navigation={navigation} />);
    expect(screen.getByText('Nenhuma issue encontrada')).toBeTruthy();
  });

  it('shows a full-screen error state when a query with no cached data fails', async () => {
    mockIssuesResult({ isError: true, error: new Error('Network down') });
    await render(<IssuesScreen route={route} navigation={navigation} />);
    expect(screen.getByText('Network down')).toBeTruthy();
  });

  it('renders issues from the current page', async () => {
    mockIssuesResult({
      data: {
        pages: [{ items: [issue], pagination: { page: 1, perPage: 20, totalCount: 1 } }],
        pageParams: [1],
      },
    });
    await render(<IssuesScreen route={route} navigation={navigation} />);

    expect(screen.getByText('#42 Bug on login')).toBeTruthy();
    expect(screen.getByText('por octocat')).toBeTruthy();
  });

  it('re-queries with the selected filter when a filter button is pressed', async () => {
    mockIssuesResult({
      data: {
        pages: [{ items: [issue], pagination: { page: 1, perPage: 20, totalCount: 1 } }],
        pageParams: [1],
      },
    });
    await render(<IssuesScreen route={route} navigation={navigation} />);

    await fireEvent.press(screen.getByText('Abertas'));

    const lastCallParams = mockUseIssues.mock.calls[mockUseIssues.mock.calls.length - 1][1];
    expect(lastCallParams.state).toBe('open');
  });
});
