import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { AiHubScreen } from '../ai-hub-screen';

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    bottom: 0,
    top: 0,
  }),
}));

jest.mock('features/home/components/home-tab-bar', () => ({
  HomeTabBar: () => null,
}));

jest.mock('lucide-react-native', () => {
  const { Text } = require('react-native');

  return new Proxy(
    {},
    {
      get: (_target, key) => {
        return function MockIcon() {
          return <Text>{String(key)}</Text>;
        };
      },
    },
  );
});

describe('AI Hub 화면', () => {
  it('원본 기준 6개 카드만 렌더링한다', () => {
    render(<AiHubScreen />);

    expect(screen.getByText('AI 체형 분석')).toBeTruthy();
    expect(screen.getByText('AI 트레이너 아테나')).toBeTruthy();
    expect(screen.getByText('AI 식단 분석')).toBeTruthy();
    expect(screen.getByText('AI 자세 분석')).toBeTruthy();
    expect(screen.getByText('AI 신발 추천')).toBeTruthy();
    expect(screen.getByText('AI 통합 피트니스 분석')).toBeTruthy();
    expect(screen.queryByText('나의 몸매 & 스타일')).toBeNull();
    expect(screen.getByText('Accessibility')).toBeTruthy();
  });

  it('미구현 카드에 뱃지를 표시한다', () => {
    render(<AiHubScreen />);

    expect(screen.getAllByText('미구현')).toHaveLength(4);
  });
});
