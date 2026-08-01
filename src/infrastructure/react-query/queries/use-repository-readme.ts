import { useQuery } from '@tanstack/react-query';
import type { RepositoryPort } from '../../../domain/ports';
import { queryKeys } from '../query-keys';

interface UseRepositoryReadmeParams {
  owner: string;
  name: string;
}

export function useRepositoryReadme(
  repositoryPort: RepositoryPort,
  { owner, name }: UseRepositoryReadmeParams
) {
  return useQuery({
    queryKey: queryKeys.repositories.readme(owner, name),
    queryFn: () => repositoryPort.getReadme(owner, name),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
