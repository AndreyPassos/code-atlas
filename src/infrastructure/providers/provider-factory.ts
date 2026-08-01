import type { ProviderType } from '../../domain/value-objects';
import type { RepositoryPort, IssuePort } from '../../domain/ports';
import { GitHubApiService } from './github/github-api.service';
import { GitHubRepositoryAdapter } from './github/github-repository.adapter';
import { GitHubIssueAdapter } from './github/github-issue.adapter';
import { GitLabApiService } from './gitlab/gitlab-api.service';
import { GitLabRepositoryAdapter } from './gitlab/gitlab-repository.adapter';
import { GitLabIssueAdapter } from './gitlab/gitlab-issue.adapter';

export interface ProviderInstances {
  readonly repository: RepositoryPort;
  readonly issue: IssuePort;
}

export class ProviderFactory {
  static create(providerType: ProviderType): ProviderInstances {
    switch (providerType) {
      case 'github': {
        const apiService = GitHubApiService.getInstance();
        return {
          repository: new GitHubRepositoryAdapter(apiService.getClient()),
          issue: new GitHubIssueAdapter(apiService.getClient()),
        };
      }
      case 'gitlab': {
        const apiService = GitLabApiService.getInstance();
        return {
          repository: new GitLabRepositoryAdapter(apiService.getClient()),
          issue: new GitLabIssueAdapter(apiService.getClient()),
        };
      }
    }
  }
}
