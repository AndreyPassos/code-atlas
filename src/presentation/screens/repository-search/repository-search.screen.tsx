import { View, FlatList, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { ExpoSecureStoreAdapter } from '../../../infrastructure/storage/expo-secure-store.adapter';
import { useSearchRepositories } from '../../../infrastructure/react-query';
import { Text, Input, Card, Avatar, Badge, Spinner, EmptyState, ErrorState } from '../../components';
import type { Repository } from '../../../domain/entities';
import type { TabScreenProps } from '../../navigation/types';

type Props = TabScreenProps<'RepositorySearch'>;

const storage = ExpoSecureStoreAdapter.getInstance();

export function RepositorySearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const activeProvider = useProviderStore((state) => state.activeProvider);

  const providers = ProviderFactory.create(activeProvider, storage);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useSearchRepositories(providers.repository, { query });

  const repositories = data?.pages.flatMap((page) => page.items) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Repository }) => (
      <Card className="mb-md">
        <Text variant="subheading">{item.name}</Text>
        <Text variant="body" color="secondary" numberOfLines={2}>
          {item.description ?? 'No description'}
        </Text>
        <View className="flex-row gap-md mt-sm">
          <Badge label={`⭐ ${item.stars}`} />
          <Badge label={`🍴 ${item.forks}`} />
          {item.language && <Badge label={item.language} variant="default" />}
        </View>
      </Card>
    ),
    []
  );

  if (isError) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-background">
      <View className="p-lg">
        <Input
          placeholder="Search repositories..."
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {isLoading ? (
        <Spinner size="lg" className="mt-xxl" />
      ) : repositories.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No repositories found"
          description="Try searching for something else"
        />
      ) : (
        <FlatList
          data={repositories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-lg"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <Spinner className="py-md" /> : null}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
}
