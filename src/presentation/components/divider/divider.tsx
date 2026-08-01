import { View, ViewProps } from 'react-native';

interface DividerProps extends ViewProps {}

export function Divider({ className, ...props }: DividerProps) {
  return <View className={`h-px bg-border ${className ?? ''}`} {...props} />;
}
