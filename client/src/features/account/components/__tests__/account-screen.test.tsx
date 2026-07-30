import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Alert } from 'react-native';
import { AccountScreen } from '../account-screen';

const mockCloseView = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  closeView: () => mockCloseView(),
}));

jest.mock('shared/api/user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

jest.mock('shared/components/tab-page-layout', () => ({
  TabPageLayout: ({
    children,
  }: {
    children: (metrics: {
      contentBottomInset: number;
      floatingActionBottomInset: number;
      tabBarHeight: number;
    }) => ReactNode;
  }) =>
    children({
      contentBottomInset: 80,
      floatingActionBottomInset: 76,
      tabBarHeight: 60,
    }),
}));

jest.mock('shared/components/async-state', () => ({
  SuspenseSection: ({ children }: { children: ReactNode }) => children,
}));

const { useTrackerUserKey } = jest.requireMock('shared/api/user-key') as {
  useTrackerUserKey: jest.Mock;
};

describe('AccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('원본처럼 프로필 카드와 로그아웃 버튼만 보여준다', () => {
    useTrackerUserKey.mockReturnValue('user-key-1234');

    render(<AccountScreen />);

    expect(screen.getByText('익명 사용자')).toBeTruthy();
    expect(screen.getByText('user-key-1234')).toBeTruthy();
    expect(screen.getByText('로그아웃')).toBeTruthy();
    expect(screen.queryByText('개인 페이지')).toBeNull();
    expect(screen.queryByText('사용자 키')).toBeNull();
  });

  it('확인 후 Apps in Toss 화면을 닫고 진행 상태를 표시한다', async () => {
    useTrackerUserKey.mockReturnValue('user-key-1234');
    let finishClose: (() => void) | undefined;
    mockCloseView.mockReturnValue(
      new Promise<void>((resolve) => {
        finishClose = resolve;
      }),
    );
    jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        void buttons?.[1]?.onPress?.();
      });

    render(<AccountScreen />);
    fireEvent.press(screen.getByText('로그아웃'));

    await waitFor(() => {
      expect(screen.getByText('로그아웃 중…')).toBeTruthy();
    });
    expect(mockCloseView).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishClose?.();
    });
    await waitFor(() => {
      expect(screen.getByText('로그아웃')).toBeTruthy();
    });
  });
});
