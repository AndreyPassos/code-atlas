import { createHttpClient } from '../../http/axios-client';
import type { StoragePort } from '../../../domain/ports';

const GITHUB_BASE_URL = 'https://api.github.com';

export class GitHubApiService {
  private static instance: GitHubApiService;
  private readonly client;

  private constructor(storagePort: StoragePort) {
    this.client = createHttpClient({
      baseURL: GITHUB_BASE_URL,
      getToken: () => storagePort.getItem('auth_token'),
    });
  }

  static getInstance(storagePort: StoragePort): GitHubApiService {
    if (!GitHubApiService.instance) {
      GitHubApiService.instance = new GitHubApiService(storagePort);
    }
    return GitHubApiService.instance;
  }

  getClient() {
    return this.client;
  }
}
