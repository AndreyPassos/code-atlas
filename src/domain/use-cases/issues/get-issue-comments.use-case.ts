import type { IssuePort } from '../../ports';
import type { PaginatedResult, GetCommentsParams } from '../../value-objects';
import type { Comment } from '../../entities';

export class GetIssueCommentsUseCase {
  constructor(private readonly issuePort: IssuePort) {}

  async execute(params: GetCommentsParams): Promise<PaginatedResult<Comment>> {
    return this.issuePort.getComments(params);
  }
}