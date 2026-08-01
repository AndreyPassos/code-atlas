import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import type { TabParamList } from './types';
import { SourceSelectorScreen } from '../screens/source-selector/source-selector.screen';
import { RepositorySearchScreen } from '../screens/repository-search/repository-search.screen';
import { DesignSystemScreen } from '../screens/design-system/design-system.screen';
import { lightTheme, darkTheme } from '../../shared/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof TabParamList, { active: IoniconName; inactive: IoniconName }> = {
  SourceSelector: { active: 'git-branch', inactive: 'git-branch-outline' },
  RepositorySearch: { active: 'search', inactive: 'search-outline' },
  DesignSystem: { active: 'color-palette', inactive: 'color-palette-outline' },
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
            color={color}
            size={size}
          />
        ),
      })}>
      <Tab.Screen
        name="SourceSelector"
        component={SourceSelectorScreen}
        options={{ title: 'Fontes', tabBarAccessibilityLabel: 'Aba de fontes' }}
      />
      <Tab.Screen
        name="RepositorySearch"
        component={RepositorySearchScreen}
        options={{ title: 'Busca', tabBarAccessibilityLabel: 'Aba de busca de repositórios' }}
      />
      <Tab.Screen
        name="DesignSystem"
        component={DesignSystemScreen}
        options={{
          title: 'Design System',
          tabBarAccessibilityLabel: 'Aba de showcase do design system',
        }}
      />
    </Tab.Navigator>
  );
}
