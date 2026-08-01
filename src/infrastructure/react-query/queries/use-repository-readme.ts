import { useQuery } from '@tanstack/react-query';
import type { RepositoryPort } from '../../../domain/ports';
import type { ProviderType } from '../../../domain/value-objects';
import { queryKeys } from '../query-keys';

interface UseRepositoryReadmeParams {
  provider: ProviderType;
  owner: string;
  name: string;
}

export function useRepositoryReadme(
  repositoryPort: RepositoryPort,
  { provider, owner, name }: UseRepositoryReadmeParams
) {
  return useQuery({
    queryKey: queryKeys.repositories.readme(provider, owner, name),
    queryFn: () => repositoryPort.getReadme(owner, name),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
