import { View, ScrollView } from 'react-native';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { ExpoSecureStoreAdapter } from '../../../infrastructure/storage/expo-secure-store.adapter';
import { useRepositoryDetails, useRepositoryReadme } from '../../../infrastructure/react-query';
import { Text, Card, Badge, Avatar, Spinner, ErrorState, Button } from '../../components';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'RepositoryDetails'>;

const storage = ExpoSecureStoreAdapter.getInstance();

export function RepositoryDetailsScreen({ route, navigation }: Props) {
  const { owner, name } = route.params;
  const activeProvider = useProviderStore((state) => state.activeProvider);

  const providers = ProviderFactory.create(activeProvider, storage);
  const { data: repository, isLoading, isError, error, refetch } =
    useRepositoryDetails(providers.repository, { owner, name });
  const { data: readme } = useRepositoryReadme(providers.repository, { owner, name });

  if (isLoading) {
    return <Spinner size="lg" className="flex-1 justify-center" />;
  }

  if (isError || !repository) {
    return <ErrorState message={(error as Error)?.message ?? 'Repository not found'} onRetry={refetch} />;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-lg gap-lg">
        <View>
          <Text variant="heading">{repository.name}</Text>
          <Text variant="body" color="secondary">
            {repository.fullName}
          </Text>
        </View>

        {repository.description && (
          <Text variant="body">{repository.description}</Text>
        )}

        <View className="flex-row gap-md">
          <Badge label={`⭐ ${repository.stars}`} />
          <Badge label={`🍴 ${repository.forks}`} />
          {repository.language && <Badge label={repository.language} />}
        </View>

        <Card>
          <Text variant="label">Owner</Text>
          <View className="flex-row items-center gap-sm mt-xs">
            <Avatar uri={repository.owner.avatarUrl} name={repository.owner.login} size="sm" />
            <Text variant="body">{repository.owner.login}</Text>
          </View>
        </Card>

        <Button
          variant="secondary"
          onPress={() => navigation.navigate('Issues', { owner, name })}
        >
          View Issues →
        </Button>

        {readme && (
          <Card>
            <Text variant="label" className="mb-sm">README</Text>
            <Text variant="body">{readme}</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
