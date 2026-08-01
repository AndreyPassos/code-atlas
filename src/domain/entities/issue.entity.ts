import type { IssueId, IssueState } from '../value-objects';
import type { Owner } from './owner.entity';
import type { Label } from './label.entity';

export interface Issue {
  readonly id: IssueId;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: IssueState;
  readonly author: Owner;
  readonly labels: ReadonlyArray<Label>;
  readonly commentsCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
