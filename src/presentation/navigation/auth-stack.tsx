import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';
import { LoginScreen } from '../screens/login/login.screen';

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
