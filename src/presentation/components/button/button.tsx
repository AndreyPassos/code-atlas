import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from '../text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-hover',
  secondary: 'bg-surface active:bg-surface-hover border border-border',
  ghost: 'bg-transparent active:bg-surface',
};

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-text',
  ghost: 'text-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-sm px-md',
  md: 'h-md px-lg',
  lg: 'h-lg px-xl',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm font-medium',
  md: 'text-md font-semibold',
  lg: 'text-lg font-semibold',
};

const disabledClasses = 'opacity-50';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  testID = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      testID={testID}
      className={`items-center justify-center rounded-lg ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? disabledClasses : ''} ${className ?? ''}`}
      disabled={disabled}
      accessibilityRole="button"
      {...props}>
      {typeof children === 'string' ? (
        <Text className={`${textSizeClasses[size]} ${variantTextClasses[variant]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
