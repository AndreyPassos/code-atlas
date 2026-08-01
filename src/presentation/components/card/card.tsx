import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View className={`bg-surface rounded-lg p-lg ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
