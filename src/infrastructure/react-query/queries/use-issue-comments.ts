import { useInfiniteQuery } from '@tanstack/react-query';
import type { IssuePort } from '../../../domain/ports';
import { queryKeys } from '../query-keys';

const PER_PAGE = 20;

interface UseIssueCommentsParams {
  owner: string;
  name: string;
  issueNumber: number;
}

export function useIssueComments(
  issuePort: IssuePort,
  { owner, name, issueNumber }: UseIssueCommentsParams
) {
  return useInfiniteQuery({
    queryKey: queryKeys.issues.comments(owner, name, issueNumber),
    queryFn: ({ pageParam = 1 }) =>
      issuePort.getComments({
        owner,
        name,
        issueNumber,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, perPage, totalCount } = lastPage.pagination;
      const totalPages = Math.ceil(totalCount / perPage);
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
}
