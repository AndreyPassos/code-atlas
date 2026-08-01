import { View, FlatList, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { useIssues } from '../../../infrastructure/react-query';
import { Text, Card, Badge, Button, Spinner, EmptyState, ErrorState } from '../../components';
import { notify } from '../../lib/notify';
import type { Issue } from '../../../domain/entities';
import type { IssueState } from '../../../domain/value-objects';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'Issues'>;

const FILTER_LABELS: Record<IssueState | 'all', string> = {
  all: 'Todas',
  open: 'Abertas',
  closed: 'Fechadas',
};

const STATE_LABELS: Record<IssueState, string> = {
  open: 'aberta',
  closed: 'fechada',
};

export function IssuesScreen({ route }: Props) {
  const { owner, name } = route.params;
  const [filter, setFilter] = useState<IssueState | 'all'>('all');
  const activeProvider = useProviderStore((state) => state.activeProvider);

  const providers = useMemo(() => ProviderFactory.create(activeProvider), [activeProvider]);
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
  } = useIssues(providers.issue, { provider: activeProvider, owner, name, state: filter });

  const issues = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

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
            label={STATE_LABELS[item.state]}
            variant={item.state === 'open' ? 'success' : 'error'}
          />
        </View>
        <View className="mt-sm flex-row gap-md">
          <Badge label={`💬 ${item.commentsCount}`} />
          <Text variant="caption" color="tertiary">
            por {item.author.login}
          </Text>
        </View>
      </Card>
    ),
    []
  );

  useEffect(() => {
    if (isError && issues.length > 0) {
      notify.error('Falha ao atualizar as issues', { description: (error as Error).message });
    }
  }, [isError, error, issues.length]);

  if (isError && issues.length === 0) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row gap-sm p-lg">
        {(['all', 'open', 'closed'] as const).map((state) => (
          <Button
            key={state}
            variant={filter === state ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setFilter(state)}>
            {FILTER_LABELS[state]}
          </Button>
        ))}
      </View>

      {isLoading ? (
        <Spinner size="lg" className="mt-xxl" />
      ) : issues.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Nenhuma issue encontrada"
          description="Este repositório não possui issues"
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
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}
    </View>
  );
}
