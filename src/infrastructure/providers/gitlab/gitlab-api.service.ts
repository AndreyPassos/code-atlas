import { createHttpClient } from '../../http/axios-client';
import type { StoragePort } from '../../../domain/ports';

const GITLAB_BASE_URL = 'https://gitlab.com/api/v4';

export class GitLabApiService {
  private static instance: GitLabApiService;
  private readonly client;

  private constructor(storagePort: StoragePort) {
    this.client = createHttpClient({
      baseURL: GITLAB_BASE_URL,
      getToken: () => storagePort.getItem('auth_token'),
    });
  }

  static getInstance(storagePort: StoragePort): GitLabApiService {
    if (!GitLabApiService.instance) {
      GitLabApiService.instance = new GitLabApiService(storagePort);
    }
    return GitLabApiService.instance;
  }

  getClient() {
    return this.client;
  }
}
