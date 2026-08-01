import { LoginUseCase } from './login.use-case';
import type { AuthPort } from '../../ports';
import type { User } from '../../entities';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockAuthPort: jest.Mocked<AuthPort>;

  beforeEach(() => {
    mockAuthPort = {
      login: jest.fn(),
      logout: jest.fn(),
      getToken: jest.fn(),
      isAuthenticated: jest.fn(),
      getCurrentUser: jest.fn(),
    };
    useCase = new LoginUseCase(mockAuthPort);
  });

  it('should return the logged-in user', async () => {
    const mockUser: User = {
      login: 'octocat',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    };

    mockAuthPort.login.mockResolvedValue(mockUser);

    const result = await useCase.execute();

    expect(result).toEqual(mockUser);
    expect(result.login).toBe('octocat');
    expect(mockAuthPort.login).toHaveBeenCalledTimes(1);
  });
});
