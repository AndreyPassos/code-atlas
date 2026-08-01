import { View } from 'react-native';
import { Text } from '../text';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface border border-border',
  success: 'bg-success/20',
  error: 'bg-error/20',
  warning: 'bg-warning/20',
};

const textColorClasses: Record<BadgeVariant, string> = {
  default: 'text-text-secondary',
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View className={`rounded-full px-sm py-xxs ${variantClasses[variant]}`}>
      <Text variant="caption" className={textColorClasses[variant]}>
        {label}
      </Text>
    </View>
  );
}
