import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export function useAppTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? DarkTheme : DefaultTheme;
}
