import Toast from 'react-native-toast-message';

interface NotifyOptions {
  description?: string;
}

/**
 * Thin wrapper over react-native-toast-message so call sites never touch the
 * raw API/params directly — one place to control defaults (duration, position).
 * Errors get a longer visibility window since they carry more to read/act on.
 */
export const notify = {
  success: (message: string, options?: NotifyOptions) =>
    Toast.show({ type: 'success', text1: message, text2: options?.description }),
  error: (message: string, options?: NotifyOptions) =>
    Toast.show({
      type: 'error',
      text1: message,
      text2: options?.description,
      visibilityTime: 5000,
    }),
  info: (message: string, options?: NotifyOptions) =>
    Toast.show({ type: 'info', text1: message, text2: options?.description }),
};
