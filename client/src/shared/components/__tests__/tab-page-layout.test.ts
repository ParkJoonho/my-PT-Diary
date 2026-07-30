import { describe, expect, it } from '@jest/globals';
import { resolveTabPageMetrics } from '../tab-page-layout';

describe('TabPageLayout metrics', () => {
  it('native 탭 높이와 본문/FAB inset에 safe area를 한 번만 반영한다', () => {
    expect(
      resolveTabPageMetrics({
        contentBottomSpacing: 16,
        isWeb: false,
        minimumContentBottomInset: 0,
        safeAreaBottom: 34,
        screenWidth: 390,
      }),
    ).toEqual({
      contentBottomInset: 110,
      floatingActionBottomInset: 110,
      horizontalPadding: 16.25,
      tabBarHeight: 94,
      tabSafeAreaBottom: 34,
    });
  });

  it('web은 원본의 34px 하단 영역과 84px 탭 전체 높이를 유지한다', () => {
    expect(
      resolveTabPageMetrics({
        contentBottomSpacing: 16,
        isWeb: true,
        minimumContentBottomInset: 0,
        safeAreaBottom: 0,
        screenWidth: 520,
      }),
    ).toEqual({
      contentBottomInset: 100,
      floatingActionBottomInset: 24,
      horizontalPadding: 0,
      tabBarHeight: 84,
      tabSafeAreaBottom: 34,
    });
  });

  it('홈의 원본 최소 하단 여백은 작은 safe area에서도 보존한다', () => {
    expect(
      resolveTabPageMetrics({
        contentBottomSpacing: 16,
        isWeb: false,
        minimumContentBottomInset: 120,
        safeAreaBottom: 0,
        screenWidth: 360,
      }).contentBottomInset,
    ).toBe(120);
  });
});
