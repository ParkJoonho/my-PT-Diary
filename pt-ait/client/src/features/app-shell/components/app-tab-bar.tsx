import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AITabIcon,
  HistoryTabIcon,
  HomeTabIcon,
  MyTabIcon,
  PTTabIcon,
} from 'shared/components/icons/pt-diary-icons';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors from 'shared/constants/colors';
import { APP_TABS } from '../data/tabs';
import type { AppTabItem } from '../types/tab';

const ICONS: Record<AppTabItem['key'], typeof HomeTabIcon> = {
  home: HomeTabIcon,
  exercise: HistoryTabIcon,
  'pt-log': PTTabIcon,
  'ai-hub': AITabIcon,
  condition: MyTabIcon,
};

export function AppTabBar() {
  return (
    <View style={styles.tabBar}>
      {APP_TABS.map((tab) => {
        const Icon = ICONS[tab.key];
        const active = tab.key === 'home';
        const color = active ? Colors.text : Colors.tabIconDefault;

        return (
          <Pressable
            accessibilityRole="button"
            key={tab.key}
            onPress={() => undefined}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Icon color={color} size={24} />
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
              {!tab.implemented ? <UnimplementedBadge compact /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 10,
  },
  labelRow: {
    alignItems: 'center',
    gap: 2,
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
    height: 84,
    left: 0,
    paddingBottom: 10,
    position: 'absolute',
    right: 0,
  },
});
