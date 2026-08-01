import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import { AuthStack } from './auth-stack';
import { MainStack } from './main-stack';
import { useAuthStore } from '../../infrastructure/hooks';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
