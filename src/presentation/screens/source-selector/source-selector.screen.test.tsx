import { render, fireEvent, screen } from '@testing-library/react-native';
import { SourceSelectorScreen } from './source-selector.screen';
import { useProviderStore } from '../../../infrastructure/hooks';
import { notify } from '../../lib/notify';
import type { TabScreenProps } from '../../navigation/types';

jest.mock('../../../infrastructure/hooks', () => ({
  useProviderStore: jest.fn(),
}));

jest.mock('../../lib/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const mockUseProviderStore = useProviderStore as unknown as jest.Mock;
const mockNotifySuccess = notify.success as jest.Mock;

const navigation = {
  navigate: jest.fn(),
} as unknown as TabScreenProps<'SourceSelector'>['navigation'];
const route = {} as unknown as TabScreenProps<'SourceSelector'>['route'];

describe('SourceSelectorScreen', () => {
  let setProvider: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    setProvider = jest.fn();
    mockUseProviderStore.mockImplementation((selector) => {
      const state = { activeProvider: 'github', setProvider };
      return selector ? selector(state) : state;
    });
  });

  it('renders both provider options with the active one selected', async () => {
    await render(<SourceSelectorScreen navigation={navigation} route={route} />);

    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.getByText('GitLab')).toBeTruthy();
    expect(screen.getByLabelText('GitHub, selecionado')).toBeTruthy();
  });

  it('switches provider and notifies when a different option is selected', async () => {
    await render(<SourceSelectorScreen navigation={navigation} route={route} />);

    await fireEvent.press(screen.getByTestId('provider-option-gitlab'));

    expect(setProvider).toHaveBeenCalledWith('gitlab');
    expect(mockNotifySuccess).toHaveBeenCalledWith('Fonte alterada para GitLab');
  });

  it('does nothing when the already-active provider is selected', async () => {
    await render(<SourceSelectorScreen navigation={navigation} route={route} />);

    await fireEvent.press(screen.getByTestId('provider-option-github'));

    expect(setProvider).not.toHaveBeenCalled();
    expect(mockNotifySuccess).not.toHaveBeenCalled();
  });

  it('navigates to RepositorySearch when "Continuar" is pressed', async () => {
    await render(<SourceSelectorScreen navigation={navigation} route={route} />);

    await fireEvent.press(screen.getByText('Continuar para a busca →'));

    expect(navigation.navigate).toHaveBeenCalledWith('RepositorySearch');
  });
});
