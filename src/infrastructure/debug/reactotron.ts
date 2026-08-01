import Reactotron from 'reactotron-react-native';

/**
 * Dev-only network/state inspector. Connects to the Reactotron desktop app
 * (https://github.com/infinitered/reactotron) when running in development —
 * shows every HTTP request/response live, which is what plain ErrorState
 * text can't: the exact response body/status the app actually received.
 * No-ops in production builds.
 */
if (__DEV__) {
  Reactotron.configure({ name: 'Code Atlas' }).useReactNative({ networking: {} }).connect();

  Reactotron.clear?.();
}

export default Reactotron;
