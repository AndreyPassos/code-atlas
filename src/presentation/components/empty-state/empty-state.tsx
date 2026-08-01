import { View } from 'react-native';
import { Text } from '../text';
import { Button } from '../button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  testID = 'empty-state',
}: EmptyStateProps) {
  return (
    <View testID={testID} className="flex-1 items-center justify-center p-xxl gap-lg">
      {icon && <Text className="text-4xl">{icon}</Text>}
      <Text variant="subheading" className="text-center">
        {title}
      </Text>
      {description && (
        <Text variant="body" color="secondary" className="text-center">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
