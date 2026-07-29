import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AccountScreen } from '../account-screen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('shared/api/user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

jest.mock('features/home/components/home-tab-bar', () => ({
  HomeTabBar: () => {
    const React = require('react');
    const { Text } = require('react-native');

    return React.createElement(Text, null, '하단 탭바');
  },
}));

jest.mock('shared/components/async-state', () => ({
  SuspenseSection: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('lucide-react-native', () => ({
  ShieldCheck: () => null,
  UserRound: () => null,
}));

const { useTrackerUserKey } = jest.requireMock('shared/api/user-key') as {
  useTrackerUserKey: jest.Mock;
};

describe('AccountScreen', () => {
  it('로그아웃 버튼 없이 내 정보 카드와 사용자 키를 보여준다', () => {
    useTrackerUserKey.mockReturnValue('user-key-1234');

    render(<AccountScreen />);

    expect(screen.getByText('개인 페이지')).toBeTruthy();
    expect(screen.getByText('익명 사용자')).toBeTruthy();
    expect(screen.getByText('사용자 키')).toBeTruthy();
    expect(screen.getByText('user-key-1234')).toBeTruthy();
    expect(screen.queryByText('로그아웃')).toBeNull();
  });
});
