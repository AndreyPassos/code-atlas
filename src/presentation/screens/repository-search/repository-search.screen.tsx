import { View, FlatList, Pressable, RefreshControl, Keyboard } from 'react-native';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { useSearchRepositories } from '../../../infrastructure/react-query';
import {
  Text,
  Input,
  Card,
  Badge,
  Spinner,
  EmptyState,
  ErrorState,
  ProviderSwitchSheet,
  type ProviderSwitchSheetHandle,
} from '../../components';
import { PROVIDER_DISPLAY } from '../../constants/provider-display';
import { notify } from '../../lib/notify';
import type { Repository } from '../../../domain/entities';
import type { TabScreenProps } from '../../navigation/types';

type Props = TabScreenProps<'RepositorySearch'>;

const SEARCH_DEBOUNCE_MS = 300;

export function RepositorySearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const activeProvider = useProviderStore((state) => state.activeProvider);
  const switchSheetRef = useRef<ProviderSwitchSheetHandle>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

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
  } = useSearchRepositories(providers.repository, {
    provider: activeProvider,
    query: debouncedQuery,
  });

  const repositories = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Repository }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${item.fullName}`}
        onPress={() =>
          navigation.navigate('RepositoryDetails', { owner: item.owner.login, name: item.name })
        }>
        <Card className="mb-md">
          <Text variant="subheading">{item.name}</Text>
          <Text variant="body" color="secondary" numberOfLines={2}>
            {item.description ?? 'Sem descrição'}
          </Text>
          <View className="mt-sm flex-row gap-md">
            <Badge label={`⭐ ${item.stars}`} />
            <Badge label={`🍴 ${item.forks}`} />
            {item.language && <Badge label={item.language} variant="default" />}
          </View>
        </Card>
      </Pressable>
    ),
    [navigation]
  );

  // Only block the whole screen when there's nothing cached to show. A
  // refetch/pull-to-refresh failure with results already on screen shouldn't
  // wipe them out — surface it as a toast and let the stale list stand.
  useEffect(() => {
    if (isError && repositories.length > 0) {
      notify.error('Falha ao atualizar a busca', { description: (error as Error).message });
    }
  }, [isError, error, repositories.length]);

  if (isError && repositories.length === 0) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <Pressable className="flex-1 bg-background" onPress={Keyboard.dismiss} accessible={false}>
      <View className="gap-md p-lg">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fonte ativa: ${PROVIDER_DISPLAY[activeProvider].name}. Toque para trocar.`}
          onPress={() => switchSheetRef.current?.present()}
          className="flex-row items-center justify-between rounded-lg border border-border bg-surface px-md py-sm">
          <View className="flex-row items-center gap-sm">
            <Text>{PROVIDER_DISPLAY[activeProvider].icon}</Text>
            <Text variant="label" color="secondary">
              Fonte: {PROVIDER_DISPLAY[activeProvider].name}
            </Text>
          </View>
          <Text variant="caption" color="primary">
            Trocar
          </Text>
        </Pressable>

        <Input
          icon="🔍"
          placeholder="Buscar repositórios..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <Spinner size="lg" className="mt-xxl" />
      ) : repositories.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Nenhum repositório encontrado"
          description="Tente buscar por outro termo"
        />
      ) : (
        <FlatList
          data={repositories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-lg"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={isFetchingNextPage ? <Spinner className="py-md" /> : null}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}

      <ProviderSwitchSheet ref={switchSheetRef} />
    </Pressable>
  );
}
