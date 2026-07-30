import { useNavigation } from '@granite-js/react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AITabIcon,
  HistoryTabIcon,
  HomeTabIcon,
  MyTabIcon,
  PTTabIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { ptTypography } from 'shared/constants/typography';

export type MemberTabKey =
  | 'home'
  | 'exercise'
  | 'pt-log'
  | 'ai-hub'
  | 'condition';

type MemberTabBarProps = {
  activeKey: MemberTabKey;
  height: number;
  horizontalPadding: number;
  safeAreaBottom: number;
};

const MEMBER_TABS = [
  { Icon: HomeTabIcon, key: 'home', label: '홈', route: '/' },
  {
    Icon: HistoryTabIcon,
    key: 'exercise',
    label: '기록',
    route: '/exercise',
  },
  { Icon: PTTabIcon, key: 'pt-log', label: 'PT', route: '/pt-log' },
  { Icon: AITabIcon, key: 'ai-hub', label: 'AI', route: '/ai-hub' },
  {
    Icon: MyTabIcon,
    key: 'condition',
    label: '내 정보',
    route: '/condition',
  },
] as const;

export function MemberTabBar({
  activeKey,
  height,
  horizontalPadding,
  safeAreaBottom,
}: MemberTabBarProps) {
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.tabBar,
        {
          height,
          paddingBottom: safeAreaBottom,
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      {MEMBER_TABS.map((tab) => {
        const active = tab.key === activeKey;
        const color = active ? Colors.text : Colors.tabIconDefault;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={tab.key}
            onPress={() => navigation.navigate({ name: tab.route, params: {} })}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <tab.Icon color={color} size={24} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...ptTypography.tabLabel,
  },
  pressed: {
    opacity: 0.78,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabBar: {
    backgroundColor: Colors.card,
    borderTopColor: Colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 150,
  },
});
