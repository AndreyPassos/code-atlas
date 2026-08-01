import { View } from 'react-native';
import { useProviderStore } from '../../../infrastructure/hooks';
import { Text, Button, ProviderOption } from '../../components';
import { PROVIDER_DISPLAY } from '../../constants/provider-display';
import { notify } from '../../lib/notify';
import type { ProviderType } from '../../../domain/value-objects';
import type { TabScreenProps } from '../../navigation/types';

type Props = TabScreenProps<'SourceSelector'>;

const providers: readonly ProviderType[] = ['github', 'gitlab'];

export function SourceSelectorScreen({ navigation }: Props) {
  const { activeProvider, setProvider } = useProviderStore();

  const handleSelect = (provider: ProviderType) => {
    if (provider === activeProvider) return;
    setProvider(provider);
    notify.success(`Fonte alterada para ${PROVIDER_DISPLAY[provider].name}`);
  };

  return (
    <View className="flex-1 gap-lg bg-background p-lg">
      <Text variant="heading">Selecionar fonte</Text>
      <Text variant="body" color="secondary">
        Escolha a plataforma de hospedagem de código
      </Text>

      <View className="gap-md" accessibilityRole="radiogroup">
        {providers.map((provider) => (
          <ProviderOption
            key={provider}
            icon={PROVIDER_DISPLAY[provider].icon}
            name={PROVIDER_DISPLAY[provider].name}
            selected={activeProvider === provider}
            onPress={() => handleSelect(provider)}
            testID={`provider-option-${provider}`}
          />
        ))}
      </View>

      <Button
        variant="ghost"
        onPress={() => navigation.navigate('RepositorySearch')}
        className="mt-auto">
        Continuar para a busca →
      </Button>
    </View>
  );
}
