import type { AuthPort, StoragePort } from '../../../domain/ports';
import type { User } from '../../../domain/entities';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

export class GitLabAuthAdapter implements AuthPort {
  constructor(private readonly storagePort: StoragePort) {}

  async login(): Promise<User> {
    throw new Error('OAuth flow not implemented yet');
  }

  async logout(): Promise<void> {
    await this.storagePort.removeItem(AUTH_TOKEN_KEY);
    await this.storagePort.removeItem(USER_KEY);
  }

  async getToken(): Promise<string | null> {
    return this.storagePort.getItem(AUTH_TOKEN_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = await this.storagePort.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }
}
