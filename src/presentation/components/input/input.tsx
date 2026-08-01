import { TextInput, TextInputProps, View } from 'react-native';
import { Text } from '../text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className={`gap-xs ${className ?? ''}`}>
      {label && <Text variant="label">{label}</Text>}
      <TextInput
        className={`h-md px-md bg-surface rounded-lg text-md border ${
          error ? 'border-error' : 'border-border'
        }`}
        placeholderTextColor="#999999"
        {...props}
      />
      {error && <Text variant="caption" color="error">{error}</Text>}
    </View>
  );
}
