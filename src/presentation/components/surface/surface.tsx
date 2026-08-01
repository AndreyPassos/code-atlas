import { View, ViewProps } from 'react-native';

interface SurfaceProps extends ViewProps {
  children: React.ReactNode;
}

export function Surface({ children, className, ...props }: SurfaceProps) {
  return (
    <View className={`bg-background ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
