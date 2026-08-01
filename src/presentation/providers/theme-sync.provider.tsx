import { useLayoutEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { useThemeStore } from '../../infrastructure/hooks';

/**
 * NativeWind's own colorScheme has no persistence of its own -- it always
 * starts from the OS setting on a cold start. This applies the persisted
 * theme preference (rehydrated from AsyncStorage by zustand's persist
 * middleware, asynchronously) to NativeWind on mount and on every change, so
 * a manual light/dark choice survives an app restart instead of reverting to
 * system. useLayoutEffect (not useEffect) to apply it as early as possible
 * and minimize the flash between the system default and the persisted value.
 */
export function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);
  const { setColorScheme } = useColorScheme();

  useLayoutEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  return null;
}
