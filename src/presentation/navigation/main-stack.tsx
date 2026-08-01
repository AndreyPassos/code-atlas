import { createStackNavigator } from '@react-navigation/stack';
import type { MainStackParamList } from './types';
import { TabNavigator } from './tab-navigator';
import { RepositoryDetailsScreen } from '../screens/repository-details/repository-details.screen';
import { IssuesScreen } from '../screens/issues/issues.screen';

const Stack = createStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerBackButtonDisplayMode: 'default', headerBackTitle: 'Voltar' }}>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="RepositoryDetails"
        component={RepositoryDetailsScreen}
        options={{ title: 'Repositório' }}
      />
      <Stack.Screen name="Issues" component={IssuesScreen} options={{ title: 'Issues' }} />
    </Stack.Navigator>
  );
}
