import { View, ViewProps } from 'react-native';

type DividerProps = ViewProps;

export function Divider({ className, ...props }: DividerProps) {
  return <View className={`h-px bg-border ${className ?? ''}`} {...props} />;
}
