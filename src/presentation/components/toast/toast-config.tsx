import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import type { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { Text } from '../text';
import { colors } from '../../../shared/design-tokens';

type ToastVariant = 'success' | 'error' | 'info';

const ICONS: Record<ToastVariant, string> = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
};

interface ToastBodyProps extends ToastConfigParams<unknown> {
  variant: ToastVariant;
}

function ToastBody({ text1, text2, variant }: ToastBodyProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? colors.dark : colors.light;
  const accentColor =
    variant === 'success' ? scheme.success : variant === 'error' ? scheme.error : scheme.primary;

  return (
    <View
      className="mx-lg flex-row items-start gap-sm rounded-lg bg-surface p-md"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: accentColor,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      }}>
      <Text className="text-lg">{ICONS[variant]}</Text>
      <View className="flex-1">
        {text1 && <Text variant="label">{text1}</Text>}
        {text2 && (
          <Text variant="caption" color="secondary" className="mt-xxs">
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Design-system-consistent replacement for the library's default green/red
 * bar toasts — same tokens (surface/success/error/primary) as every other
 * component instead of a one-off style.
 */
export const toastConfig: ToastConfig = {
  success: (params) => <ToastBody {...params} variant="success" />,
  error: (params) => <ToastBody {...params} variant="error" />,
  info: (params) => <ToastBody {...params} variant="info" />,
};
