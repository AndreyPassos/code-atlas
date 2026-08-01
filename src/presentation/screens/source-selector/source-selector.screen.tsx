import { View } from 'react-native';
import { useProviderStore } from '../../../infrastructure/hooks';
import { Card, Text, Button, Avatar, Badge } from '../../components';
import type { ProviderType } from '../../../domain/value-objects';
import type { TabScreenProps } from '../../navigation/types';

type Props = TabScreenProps<'SourceSelector'>;

const providers: ReadonlyArray<{ type: ProviderType; name: string; icon: string }> = [
  { type: 'github', name: 'GitHub', icon: '🐙' },
  { type: 'gitlab', name: 'GitLab', icon: '🦊' },
];

export function SourceSelectorScreen({ navigation }: Props) {
  const { activeProvider, setProvider } = useProviderStore();

  const handleSelectProvider = (provider: ProviderType) => {
    setProvider(provider);
  };

  return (
    <View className="flex-1 bg-background p-lg gap-lg">
      <Text variant="heading">Select Provider</Text>
      <Text variant="body" color="secondary">
        Choose your code hosting platform
      </Text>

      <View className="gap-md">
        {providers.map((provider) => (
          <Card key={provider.type}>
            <Button
              variant={activeProvider === provider.type ? 'primary' : 'secondary'}
              onPress={() => handleSelectProvider(provider.type)}
              className="flex-row items-center gap-md"
            >
              <Text className="text-2xl">{provider.icon}</Text>
              <View className="flex-1">
                <Text variant="subheading">{provider.name}</Text>
              </View>
              {activeProvider === provider.type && <Badge label="Active" variant="success" />}
            </Button>
          </Card>
        ))}
      </View>

      <Button
        variant="ghost"
        onPress={() => navigation.navigate('RepositorySearch')}
        className="mt-auto"
      >
        Continue to Search →
      </Button>
    </View>
  );
}
