import { View, FlatList, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { ExpoSecureStoreAdapter } from '../../../infrastructure/storage/expo-secure-store.adapter';
import { useIssues } from '../../../infrastructure/react-query';
import { Text, Card, Badge, Button, Spinner, EmptyState, ErrorState } from '../../components';
import type { Issue } from '../../../domain/entities';
import type { IssueState } from '../../../domain/value-objects';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'Issues'>;

const storage = ExpoSecureStoreAdapter.getInstance();

export function IssuesScreen({ route }: Props) {
  const { owner, name } = route.params;
  const [filter, setFilter] = useState<IssueState | 'all'>('all');
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
  } = useIssues(providers.issue, { owner, name, state: filter });

  const issues = data?.pages.flatMap((page) => page.items) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Issue }) => (
      <Card className="mb-md">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text variant="subheading" numberOfLines={1}>
              #{item.number} {item.title}
            </Text>
            <Text variant="body" color="secondary" numberOfLines={2} className="mt-xs">
              {item.body}
            </Text>
          </View>
          <Badge
            label={item.state}
            variant={item.state === 'open' ? 'success' : 'error'}
          />
        </View>
        <View className="flex-row gap-md mt-sm">
          <Badge label={`💬 ${item.commentsCount}`} />
          <Text variant="caption" color="tertiary">
            by {item.author.login}
          </Text>
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
      <View className="flex-row p-lg gap-sm">
        {(['all', 'open', 'closed'] as const).map((state) => (
          <Button
            key={state}
            variant={filter === state ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setFilter(state)}
          >
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </Button>
        ))}
      </View>

      {isLoading ? (
        <Spinner size="lg" className="mt-xxl" />
      ) : issues.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No issues found"
          description="This repository has no issues"
        />
      ) : (
        <FlatList
          data={issues}
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
