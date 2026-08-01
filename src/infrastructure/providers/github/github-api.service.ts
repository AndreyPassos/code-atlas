import { createHttpClient } from '../../http/axios-client';

const GITHUB_BASE_URL = 'https://api.github.com';

export class GitHubApiService {
  private static instance: GitHubApiService;
  private readonly client;

  private constructor() {
    this.client = createHttpClient({
      baseURL: GITHUB_BASE_URL,
      getToken: async () => process.env.EXPO_PUBLIC_GITHUB_TOKEN ?? null,
    });
  }

  static getInstance(): GitHubApiService {
    if (!GitHubApiService.instance) {
      GitHubApiService.instance = new GitHubApiService();
    }
    return GitHubApiService.instance;
  }

  getClient() {
    return this.client;
  }
}
