import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  MemberTabBar,
  type MemberTabKey,
} from 'shared/components/member-tab-bar';
import Colors from 'shared/constants/colors';

const NATIVE_TAB_CONTENT_HEIGHT = 60;
const WEB_TAB_CONTENT_HEIGHT = 50;
const WEB_SAFE_AREA_BOTTOM = 34;
const MEMBER_TAB_ALIGNMENT_WIDTH = 520;
const MEMBER_TAB_COUNT_FACTOR = 8;

export type TabPageMetrics = {
  contentBottomInset: number;
  floatingActionBottomInset: number;
  tabBarHeight: number;
};

type TabPageLayoutProps = {
  activeKey: MemberTabKey;
  children: (metrics: TabPageMetrics) => ReactNode;
  contentBottomSpacing?: number;
  minimumContentBottomInset?: number;
};

export function resolveTabPageMetrics({
  contentBottomSpacing,
  isWeb,
  minimumContentBottomInset,
  safeAreaBottom,
  screenWidth,
}: {
  contentBottomSpacing: number;
  isWeb: boolean;
  minimumContentBottomInset: number;
  safeAreaBottom: number;
  screenWidth: number;
}) {
  const tabSafeAreaBottom = isWeb ? WEB_SAFE_AREA_BOTTOM : safeAreaBottom;
  const tabContentHeight = isWeb
    ? WEB_TAB_CONTENT_HEIGHT
    : NATIVE_TAB_CONTENT_HEIGHT;
  const tabBarHeight = tabContentHeight + tabSafeAreaBottom;

  return {
    contentBottomInset: Math.max(
      minimumContentBottomInset,
      tabBarHeight + contentBottomSpacing,
    ),
    floatingActionBottomInset: isWeb ? 24 : tabBarHeight + 16,
    horizontalPadding: Math.max(
      0,
      (MEMBER_TAB_ALIGNMENT_WIDTH - screenWidth) / MEMBER_TAB_COUNT_FACTOR,
    ),
    tabBarHeight,
    tabSafeAreaBottom,
  };
}

export function TabPageLayout({
  activeKey,
  children,
  contentBottomSpacing = 16,
  minimumContentBottomInset = 0,
}: TabPageLayoutProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const metrics = resolveTabPageMetrics({
    contentBottomSpacing,
    isWeb: Platform.OS === 'web',
    minimumContentBottomInset,
    safeAreaBottom: insets.bottom,
    screenWidth: width,
  });

  return (
    <View style={styles.container}>
      {children(metrics)}
      <MemberTabBar
        activeKey={activeKey}
        height={metrics.tabBarHeight}
        horizontalPadding={metrics.horizontalPadding}
        safeAreaBottom={metrics.tabSafeAreaBottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
});
