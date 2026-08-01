import { createHttpClient } from '../../http/axios-client';

const GITLAB_BASE_URL = 'https://gitlab.com/api/v4';

export class GitLabApiService {
  private static instance: GitLabApiService;
  private readonly client;

  private constructor() {
    this.client = createHttpClient({
      baseURL: GITLAB_BASE_URL,
      getToken: async () => process.env.EXPO_PUBLIC_GITLAB_TOKEN ?? null,
    });
  }

  static getInstance(): GitLabApiService {
    if (!GitLabApiService.instance) {
      GitLabApiService.instance = new GitLabApiService();
    }
    return GitLabApiService.instance;
  }

  getClient() {
    return this.client;
  }
}
