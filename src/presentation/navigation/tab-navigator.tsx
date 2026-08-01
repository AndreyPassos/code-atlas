import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from './types';
import { SourceSelectorScreen } from '../screens/source-selector/source-selector.screen';
import { RepositorySearchScreen } from '../screens/repository-search/repository-search.screen';
import { DesignSystemScreen } from '../screens/design-system/design-system.screen';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="SourceSelector"
        component={SourceSelectorScreen}
        options={{ title: 'Sources' }}
      />
      <Tab.Screen
        name="RepositorySearch"
        component={RepositorySearchScreen}
        options={{ title: 'Search' }}
      />
      <Tab.Screen
        name="DesignSystem"
        component={DesignSystemScreen}
        options={{ title: 'Design System' }}
      />
    </Tab.Navigator>
  );
}
