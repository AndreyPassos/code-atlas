import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';

export interface SpinnerProps extends Omit<ActivityIndicatorProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 16, md: 24, lg: 32 };

export function Spinner({ size = 'md', testID = 'spinner', ...props }: SpinnerProps) {
  return <ActivityIndicator size={sizeMap[size]} testID={testID} {...props} />;
}
