import { NavigationContainer } from '@react-navigation/native';
import { QueryProvider } from './query-client.provider';
import { useAppTheme } from './theme.provider';
import { RootNavigator } from '../navigation/root-navigator';

export function CompositionRoot() {
  const theme = useAppTheme();

  return (
    <QueryProvider>
      <NavigationContainer theme={theme}>
        <RootNavigator />
      </NavigationContainer>
    </QueryProvider>
  );
}
