import { useInfiniteQuery } from '@tanstack/react-query';
import type { RepositoryPort } from '../../../domain/ports';
import type { ProviderType } from '../../../domain/value-objects';
import { queryKeys } from '../query-keys';

const PER_PAGE = 20;

interface UseSearchRepositoriesParams {
  provider: ProviderType;
  query: string;
  enabled?: boolean;
}

export function useSearchRepositories(
  repositoryPort: RepositoryPort,
  { provider, query, enabled = true }: UseSearchRepositoriesParams
) {
  return useInfiniteQuery({
    queryKey: queryKeys.repositories.search(provider, query),
    queryFn: ({ pageParam = 1 }) =>
      repositoryPort.search({
        query,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, perPage, totalCount } = lastPage.pagination;
      const totalPages = Math.ceil(totalCount / perPage);
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
