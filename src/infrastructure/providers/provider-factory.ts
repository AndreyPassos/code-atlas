import type { ProviderType } from '../../domain/value-objects';
import type { RepositoryPort, IssuePort, AuthPort, StoragePort } from '../../domain/ports';
import { GitHubApiService } from './github/github-api.service';
import { GitHubRepositoryAdapter } from './github/github-repository.adapter';
import { GitHubIssueAdapter } from './github/github-issue.adapter';
import { GitHubAuthAdapter } from './github/github-auth.adapter';
import { GitLabApiService } from './gitlab/gitlab-api.service';
import { GitLabRepositoryAdapter } from './gitlab/gitlab-repository.adapter';
import { GitLabIssueAdapter } from './gitlab/gitlab-issue.adapter';
import { GitLabAuthAdapter } from './gitlab/gitlab-auth.adapter';

export interface ProviderInstances {
  readonly repository: RepositoryPort;
  readonly issue: IssuePort;
  readonly auth: AuthPort;
}

export class ProviderFactory {
  static create(providerType: ProviderType, storagePort: StoragePort): ProviderInstances {
    switch (providerType) {
      case 'github': {
        const apiService = GitHubApiService.getInstance(storagePort);
        return {
          repository: new GitHubRepositoryAdapter(apiService.getClient()),
          issue: new GitHubIssueAdapter(apiService.getClient()),
          auth: new GitHubAuthAdapter(storagePort),
        };
      }
      case 'gitlab': {
        const apiService = GitLabApiService.getInstance(storagePort);
        return {
          repository: new GitLabRepositoryAdapter(apiService.getClient()),
          issue: new GitLabIssueAdapter(apiService.getClient()),
          auth: new GitLabAuthAdapter(storagePort),
        };
      }
    }
  }
}
