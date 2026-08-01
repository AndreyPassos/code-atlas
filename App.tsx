import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { CompositionRoot } from './src/presentation/providers/composition-root';

export default function App() {
  return (
    <SafeAreaProvider>
      <CompositionRoot />
    </SafeAreaProvider>
  );
}
