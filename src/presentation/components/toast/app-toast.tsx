import ToastRoot from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastConfig } from './toast-config';

const EXTRA_OFFSET = 12;

/**
 * react-native-toast-message doesn't depend on react-native-safe-area-context,
 * so its topOffset/bottomOffset are plain pixel values — on a notched iPhone
 * or an Android device with edge-to-edge/gesture nav, a fixed offset either
 * sits under the notch or too far from the content it's near. Using the same
 * insets the rest of the app already relies on (via SafeAreaProvider) fixes
 * both platforms with one value instead of hardcoding per-platform numbers.
 */
export function AppToast() {
  const insets = useSafeAreaInsets();

  return (
    <ToastRoot
      config={toastConfig}
      topOffset={insets.top + EXTRA_OFFSET}
      bottomOffset={insets.bottom + EXTRA_OFFSET}
    />
  );
}
