import { useInfiniteQuery } from '@tanstack/react-query';
import type { IssuePort } from '../../../domain/ports';
import type { IssueState } from '../../../domain/value-objects';
import { queryKeys } from '../query-keys';

const PER_PAGE = 20;

interface UseIssuesParams {
  owner: string;
  name: string;
  state: IssueState | 'all';
}

export function useIssues(issuePort: IssuePort, { owner, name, state }: UseIssuesParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.issues.list(owner, name, state),
    queryFn: ({ pageParam = 1 }) =>
      issuePort.getIssues({
        owner,
        name,
        state,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, perPage, totalCount } = lastPage.pagination;
      const totalPages = Math.ceil(totalCount / perPage);
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
