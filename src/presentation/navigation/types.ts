import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  RepositoryDetails: { owner: string; name: string };
  Issues: { owner: string; name: string };
};

export type TabParamList = {
  SourceSelector: undefined;
  RepositorySearch: undefined;
  DesignSystem: undefined;
};

export type MainStackScreenProps<T extends keyof MainStackParamList> = StackScreenProps<
  MainStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  MainStackScreenProps<keyof MainStackParamList>
>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends MainStackParamList {}
  }
}
