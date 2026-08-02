import { View, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { useRepositoryDetails, useRepositoryReadme } from '../../../infrastructure/react-query';
import {
  Text,
  Card,
  Badge,
  Avatar,
  Spinner,
  ErrorState,
  Button,
  MarkdownText,
} from '../../components';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'RepositoryDetails'>;

export function RepositoryDetailsScreen({ route, navigation }: Props) {
  const { owner, name } = route.params;
  const activeProvider = useProviderStore((state) => state.activeProvider);

  const providers = useMemo(() => ProviderFactory.create(activeProvider), [activeProvider]);
  const {
    data: repository,
    isLoading,
    isError,
    error,
    refetch,
  } = useRepositoryDetails(providers.repository, { provider: activeProvider, owner, name });
  const { data: readme } = useRepositoryReadme(providers.repository, {
    provider: activeProvider,
    owner,
    name,
  });

  if (isLoading) {
    return <Spinner size="lg" className="flex-1 justify-center" />;
  }

  if (isError || !repository) {
    return (
      <ErrorState
        message={(error as Error)?.message ?? 'Repositório não encontrado'}
        onRetry={refetch}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-lg p-lg pb-xxxl">
        <View>
          <Text variant="heading">{repository.name}</Text>
          <Text variant="body" color="secondary">
            {repository.fullName}
          </Text>
        </View>

        {repository.description && <Text variant="body">{repository.description}</Text>}

        <View className="flex-row flex-wrap gap-md">
          <Badge label={`⭐ ${repository.stars}`} />
          <Badge label={`🍴 ${repository.forks}`} />
          {repository.watchers !== null && <Badge label={`👀 ${repository.watchers}`} />}
          {repository.language && <Badge label={repository.language} />}
        </View>

        <Card>
          <Text variant="label">Proprietário</Text>
          <View className="mt-xs flex-row items-center gap-sm">
            <Avatar uri={repository.owner.avatarUrl} name={repository.owner.login} size="sm" />
            <Text variant="body">{repository.owner.login}</Text>
          </View>
        </Card>

        <Button variant="secondary" onPress={() => navigation.navigate('Issues', { owner, name })}>
          Ver issues →
        </Button>

        {readme && (
          <Card>
            <Text variant="label" className="mb-sm">
              README
            </Text>
            <MarkdownText content={readme} />
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
