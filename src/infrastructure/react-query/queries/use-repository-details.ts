import { useQuery } from '@tanstack/react-query';
import type { RepositoryPort } from '../../../domain/ports';
import { queryKeys } from '../query-keys';

interface UseRepositoryDetailsParams {
  owner: string;
  name: string;
}

export function useRepositoryDetails(
  repositoryPort: RepositoryPort,
  { owner, name }: UseRepositoryDetailsParams
) {
  return useQuery({
    queryKey: queryKeys.repositories.details(owner, name),
    queryFn: () => repositoryPort.getById(owner, name),
    staleTime: 5 * 60 * 1000,
  });
}
