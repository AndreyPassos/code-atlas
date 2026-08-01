import './global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/infrastructure/debug/reactotron';
import { CompositionRoot } from './src/presentation/providers/composition-root';
import { AppToast } from './src/presentation/components/toast';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CompositionRoot />
        <AppToast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
