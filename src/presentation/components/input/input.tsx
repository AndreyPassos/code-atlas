import { TextInput, TextInputProps, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Text } from '../text';
import { colors } from '../../../shared/design-tokens';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  /** Leading icon/emoji rendered inside the field (e.g. "🔍" for search). */
  icon?: string;
}

export function Input({
  label,
  error,
  icon,
  className,
  accessibilityLabel,
  placeholder,
  ...props
}: InputProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <View className={`gap-xs ${className ?? ''}`}>
      {label && <Text variant="label">{label}</Text>}
      <View
        className={`h-md flex-row items-center gap-sm rounded-lg border bg-surface px-md ${
          error ? 'border-error' : 'border-border'
        }`}>
        {icon && <Text className="text-md">{icon}</Text>}
        <TextInput
          className="flex-1 text-md text-text"
          placeholder={placeholder}
          placeholderTextColor={scheme.textTertiary}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          {...props}
        />
      </View>
      {error && (
        <Text variant="caption" color="error">
          {error}
        </Text>
      )}
    </View>
  );
}
