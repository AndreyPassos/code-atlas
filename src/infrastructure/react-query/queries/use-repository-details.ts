import { useQuery } from '@tanstack/react-query';
import type { RepositoryPort } from '../../../domain/ports';
import type { ProviderType } from '../../../domain/value-objects';
import { queryKeys } from '../query-keys';

interface UseRepositoryDetailsParams {
  provider: ProviderType;
  owner: string;
  name: string;
}

export function useRepositoryDetails(
  repositoryPort: RepositoryPort,
  { provider, owner, name }: UseRepositoryDetailsParams
) {
  return useQuery({
    queryKey: queryKeys.repositories.details(provider, owner, name),
    queryFn: () => repositoryPort.getById(owner, name),
    staleTime: 5 * 60 * 1000,
  });
}
