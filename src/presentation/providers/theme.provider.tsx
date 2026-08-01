import { useColorScheme } from 'nativewind';
import { DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import { lightTheme, darkTheme } from '../../shared/theme';

interface NavigationColorSource {
  readonly primary: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly border: string;
  readonly error: string;
}

function toNavigationTheme(theme: NavigationColorSource, dark: boolean): NavigationTheme {
  return {
    dark,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.error,
    },
    fonts: DefaultTheme.fonts,
  };
}

export function useAppTheme(): NavigationTheme {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  return toNavigationTheme(dark ? darkTheme : lightTheme, dark);
}
