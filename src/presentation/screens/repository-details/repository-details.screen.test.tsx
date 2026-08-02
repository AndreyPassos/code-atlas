import { render, fireEvent, screen } from '@testing-library/react-native';
import { RepositoryDetailsScreen } from './repository-details.screen';
import { useRepositoryDetails, useRepositoryReadme } from '../../../infrastructure/react-query';
import { useProviderStore } from '../../../infrastructure/hooks';
import type { Repository } from '../../../domain/entities';
import type { MainStackScreenProps } from '../../navigation/types';

jest.mock('../../../infrastructure/react-query', () => ({
  useRepositoryDetails: jest.fn(),
  useRepositoryReadme: jest.fn(),
}));

jest.mock('../../../infrastructure/hooks', () => ({
  useProviderStore: jest.fn(),
}));

const mockUseRepositoryDetails = useRepositoryDetails as jest.Mock;
const mockUseRepositoryReadme = useRepositoryReadme as jest.Mock;
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

function mockDetailsResult(overrides: Partial<ReturnType<typeof useRepositoryDetails>> = {}) {
  mockUseRepositoryDetails.mockReturnValue({
    data: repository,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  });
}

function mockReadmeResult(overrides: Partial<ReturnType<typeof useRepositoryReadme>> = {}) {
  mockUseRepositoryReadme.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  });
}

const route = {
  params: { owner: 'AndreyPassos', name: 'code-atlas' },
} as unknown as MainStackScreenProps<'RepositoryDetails'>['route'];
const navigation = {
  navigate: jest.fn(),
} as unknown as MainStackScreenProps<'RepositoryDetails'>['navigation'];

describe('RepositoryDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProviderStore.mockImplementation((selector) => selector({ activeProvider: 'github' }));
    mockReadmeResult();
  });

  it('shows a spinner while loading', async () => {
    mockDetailsResult({ isLoading: true, data: undefined });
    await render(<RepositoryDetailsScreen route={route} navigation={navigation} />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('shows a full-screen error state when the repository fails to load', async () => {
    mockDetailsResult({ isError: true, data: undefined, error: new Error('Network down') });
    await render(<RepositoryDetailsScreen route={route} navigation={navigation} />);
    expect(screen.getByText('Network down')).toBeTruthy();
  });

  it('renders repository details', async () => {
    mockDetailsResult();
    await render(<RepositoryDetailsScreen route={route} navigation={navigation} />);

    expect(screen.getByText('code-atlas')).toBeTruthy();
    expect(screen.getByText('AndreyPassos/code-atlas')).toBeTruthy();
    expect(screen.getByText('A repository browser')).toBeTruthy();
    expect(screen.getByText('⭐ 42')).toBeTruthy();
  });

  it('navigates to Issues when the "Ver issues" button is pressed', async () => {
    mockDetailsResult();
    await render(<RepositoryDetailsScreen route={route} navigation={navigation} />);

    await fireEvent.press(screen.getByText('Ver issues →'));

    expect(navigation.navigate).toHaveBeenCalledWith('Issues', {
      owner: 'AndreyPassos',
      name: 'code-atlas',
    });
  });

  it('renders the README card when a readme is available', async () => {
    mockDetailsResult();
    mockReadmeResult({ data: '# Hello' });
    await render(<RepositoryDetailsScreen route={route} navigation={navigation} />);

    expect(screen.getByText('README')).toBeTruthy();
  });

  it('omits the README card when there is no readme', async () => {
    mockDetailsResult();
    mockReadmeResult({ data: undefined });
    await render(<RepositoryDetailsScreen route={route} navigation={navigation} />);

    expect(screen.queryByText('README')).toBeNull();
  });
});
