import { View } from 'react-native';
import { Text } from '../text';
import { Button } from '../button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  testID?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  testID = 'error-state',
}: ErrorStateProps) {
  return (
    <View testID={testID} className="flex-1 items-center justify-center p-xxl gap-lg">
      <Text className="text-4xl">⚠️</Text>
      <Text variant="subheading" className="text-center">
        {title}
      </Text>
      <Text variant="body" color="secondary" className="text-center">
        {message}
      </Text>
      {onRetry && (
        <Button variant="secondary" onPress={onRetry}>
          Try again
        </Button>
      )}
    </View>
  );
}
