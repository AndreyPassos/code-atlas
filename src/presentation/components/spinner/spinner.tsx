import { ActivityIndicator, ActivityIndicatorProps, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { colors } from '../../../shared/design-tokens';

export interface SpinnerProps extends Omit<ActivityIndicatorProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * RN's ActivityIndicator only reliably supports the native 'small'/'large'
 * sizes — a numeric `size` is accepted by the type but the native iOS/Android
 * views mostly ignore it, so sm/md/lg all rendered identically. `transform:
 * scale` on the native indicator is the standard cross-platform workaround.
 */
const NATIVE_SIZE: Record<'sm' | 'md' | 'lg', 'small' | 'large'> = {
  sm: 'small',
  md: 'large',
  lg: 'large',
};

const SCALE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 1,
  md: 0.85,
  lg: 1.25,
};

export function Spinner({ size = 'md', testID = 'spinner', color, ...props }: SpinnerProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={{ transform: [{ scale: SCALE[size] }] }}>
      <ActivityIndicator
        size={NATIVE_SIZE[size]}
        color={color ?? scheme.primary}
        testID={testID}
        {...props}
      />
    </View>
  );
}
