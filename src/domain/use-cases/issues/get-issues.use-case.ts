import type { IssuePort } from '../../ports';
import type { PaginatedResult, GetIssuesParams } from '../../value-objects';
import type { Issue } from '../../entities';

export class GetIssuesUseCase {
  constructor(private readonly issuePort: IssuePort) {}

  async execute(params: GetIssuesParams): Promise<PaginatedResult<Issue>> {
    return this.issuePort.getIssues(params);
  }
}