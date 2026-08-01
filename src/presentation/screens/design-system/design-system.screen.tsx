import { ScrollView, View, Pressable } from 'react-native';
import { useRef } from 'react';
import {
  Button,
  Input,
  Text,
  Card,
  Avatar,
  Badge,
  Spinner,
  Skeleton,
  EmptyState,
  ErrorState,
  Divider,
  Surface,
  ProviderSwitchSheet,
  type ProviderSwitchSheetHandle,
} from '../../components';
import { notify } from '../../lib/notify';
import { useThemeStore } from '../../../infrastructure/hooks';

type ToastTriggerVariant = 'success' | 'error' | 'info';

const TOAST_TRIGGER_CLASSES: Record<ToastTriggerVariant, string> = {
  success: 'bg-success/15 border-success',
  error: 'bg-error/15 border-error',
  info: 'bg-primary/15 border-primary',
};

const TOAST_TRIGGER_TEXT_CLASSES: Record<ToastTriggerVariant, string> = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-primary',
};

interface ToastTriggerButtonProps {
  variant: ToastTriggerVariant;
  label: string;
  onPress: () => void;
}

// Matches each toast type's own accent color (see toast-config.tsx) instead
// of a generic gray button — the trigger should hint at what it does.
function ToastTriggerButton({ variant, label, onPress }: ToastTriggerButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`h-md items-center justify-center rounded-lg border px-lg ${TOAST_TRIGGER_CLASSES[variant]}`}>
      <Text variant="label" className={`font-semibold ${TOAST_TRIGGER_TEXT_CLASSES[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export function DesignSystemScreen() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const sheetRef = useRef<ProviderSwitchSheetHandle>(null);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-xl p-lg">
        {/* Tema */}
        <View className="gap-sm">
          <Text variant="heading">Tema</Text>
          <Divider />
          <Text variant="caption" color="secondary">
            A escolha fica salva no dispositivo (AsyncStorage) e persiste entre sessões.
          </Text>
          <View className="flex-row gap-sm">
            <Button
              variant={theme === 'light' ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setTheme('light')}
              accessibilityLabel="Usar tema claro">
              ☀️ Claro
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setTheme('dark')}
              accessibilityLabel="Usar tema escuro">
              🌙 Escuro
            </Button>
            <Button
              variant={theme === 'system' ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setTheme('system')}
              accessibilityLabel="Usar tema do sistema">
              Sistema
            </Button>
          </View>
        </View>

        {/* Tipografia */}
        <View className="gap-sm">
          <Text variant="heading">Tipografia</Text>
          <Divider />
          <Text variant="heading">Heading</Text>
          <Text variant="subheading">Subheading</Text>
          <Text variant="body">Texto do corpo</Text>
          <Text variant="caption">Legenda</Text>
          <Text variant="label">Rótulo</Text>
        </View>

        {/* Cores */}
        <View className="gap-sm">
          <Text variant="heading">Cores</Text>
          <Divider />
          <Text color="primary">Texto primário</Text>
          <Text color="secondary">Texto secundário</Text>
          <Text color="tertiary">Texto terciário</Text>
          <Text color="error">Texto de erro</Text>
          <Text color="success">Texto de sucesso</Text>
        </View>

        {/* Botões */}
        <View className="gap-sm">
          <Text variant="heading">Botões</Text>
          <Divider />
          <Button onPress={() => {}}>Primário</Button>
          <Button variant="secondary" onPress={() => {}}>
            Secundário
          </Button>
          <Button variant="ghost" onPress={() => {}}>
            Ghost
          </Button>
          <Button disabled onPress={() => {}}>
            Desabilitado
          </Button>
        </View>

        {/* Input */}
        <View className="gap-sm">
          <Text variant="heading">Input</Text>
          <Divider />
          <Input icon="🔍" placeholder="Buscar..." onChangeText={() => {}} />
          <Input label="Com rótulo" placeholder="Digite um valor" onChangeText={() => {}} />
          <Input error="Isto é um erro" placeholder="Estado de erro" onChangeText={() => {}} />
        </View>

        {/* Card */}
        <View className="gap-sm">
          <Text variant="heading">Card</Text>
          <Divider />
          <Card>
            <Text variant="body">Conteúdo do card aqui</Text>
          </Card>
        </View>

        {/* Avatar */}
        <View className="gap-sm">
          <Text variant="heading">Avatar</Text>
          <Divider />
          <View className="flex-row gap-md">
            <Avatar name="João Silva" size="sm" />
            <Avatar name="João Silva" size="md" />
            <Avatar name="João Silva" size="lg" />
            <Avatar name="João Silva" size="xl" />
          </View>
        </View>

        {/* Badge */}
        <View className="gap-sm">
          <Text variant="heading">Badge</Text>
          <Divider />
          <View className="flex-row flex-wrap gap-sm">
            <Badge label="Padrão" />
            <Badge label="Sucesso" variant="success" />
            <Badge label="Erro" variant="error" />
            <Badge label="Aviso" variant="warning" />
          </View>
        </View>

        {/* Carregamento */}
        <View className="gap-sm">
          <Text variant="heading">Estados de carregamento</Text>
          <Divider />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </View>

        {/* Skeleton */}
        <View className="gap-sm">
          <Text variant="heading">Skeleton</Text>
          <Divider />
          <Skeleton height={20} />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="60%" />
        </View>

        {/* Estado vazio */}
        <View className="gap-sm">
          <Text variant="heading">Estado vazio</Text>
          <Divider />
          <EmptyState icon="📭" title="Sem dados" description="Não há nada para mostrar aqui" />
        </View>

        {/* Estado de erro */}
        <View className="gap-sm">
          <Text variant="heading">Estado de erro</Text>
          <Divider />
          <ErrorState message="Algo deu errado ao carregar os dados" onRetry={() => {}} />
        </View>

        {/* Toast */}
        <View className="gap-sm">
          <Text variant="heading">Toast</Text>
          <Divider />
          <Text variant="body" color="secondary">
            Usado para avisos e erros que não bloqueiam a tela (ex.: falha ao atualizar uma lista
            que já tem dados em cache).
          </Text>
          <View className="flex-row flex-wrap gap-sm">
            <ToastTriggerButton
              variant="success"
              label="Sucesso"
              onPress={() => notify.success('Operação concluída', { description: 'Tudo certo.' })}
            />
            <ToastTriggerButton
              variant="error"
              label="Erro"
              onPress={() =>
                notify.error('Falha na requisição', { description: 'Verifique sua conexão.' })
              }
            />
            <ToastTriggerButton
              variant="info"
              label="Aviso"
              onPress={() => notify.info('Fonte alterada', { description: 'Agora usando GitLab.' })}
            />
          </View>
        </View>

        {/* Bottom Sheet */}
        <View className="gap-sm">
          <Text variant="heading">Bottom Sheet</Text>
          <Divider />
          <Text variant="body" color="secondary">
            Mesmo componente usado na tela de Busca para trocar a fonte ativa sem sair da tela.
          </Text>
          <Button variant="secondary" onPress={() => sheetRef.current?.present()}>
            Abrir bottom sheet
          </Button>
          <ProviderSwitchSheet ref={sheetRef} />
        </View>

        {/* Surface */}
        <View className="gap-sm">
          <Text variant="heading">Surface</Text>
          <Divider />
          <Surface className="p-lg">
            <Text variant="body">Conteúdo da surface</Text>
          </Surface>
        </View>
      </View>
    </ScrollView>
  );
}
