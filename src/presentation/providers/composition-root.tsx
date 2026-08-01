import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryProvider } from './query-client.provider';
import { useAppTheme } from './theme.provider';
import { ThemeSync } from './theme-sync.provider';
import { MainStack } from '../navigation/main-stack';

export function CompositionRoot() {
  const theme = useAppTheme();

  return (
    <QueryProvider>
      <ThemeSync />
      <NavigationContainer theme={theme}>
        <BottomSheetModalProvider>
          <MainStack />
        </BottomSheetModalProvider>
      </NavigationContainer>
    </QueryProvider>
  );
}
