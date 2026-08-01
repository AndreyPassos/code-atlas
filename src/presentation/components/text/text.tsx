import { Text as RNText, TextProps as RNTextProps } from 'react-native';

type TextVariant = 'heading' | 'subheading' | 'body' | 'caption' | 'label';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';

interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  heading: 'text-xxxl font-bold',
  subheading: 'text-xl font-semibold',
  body: 'text-md font-regular',
  caption: 'text-xs font-regular',
  label: 'text-sm font-medium',
};

const colorClasses: Record<TextColor, string> = {
  primary: 'text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  error: 'text-error',
  success: 'text-success',
};

export function Text({ variant = 'body', color, className, children, ...props }: TextProps) {
  const colorClass = color ? colorClasses[color] : '';
  return (
    <RNText className={`${variantClasses[variant]} ${colorClass} ${className ?? ''}`} {...props}>
      {children}
    </RNText>
  );
}
