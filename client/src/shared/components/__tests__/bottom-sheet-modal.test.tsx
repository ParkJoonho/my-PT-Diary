import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Animated, Modal, Text } from 'react-native';
import { BottomSheetModal } from '../bottom-sheet-modal';

describe('BottomSheetModal', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('네이티브 modal slide 없이 배경과 sheet 전환을 직접 실행한다', () => {
    const onDismiss = jest.fn();
    const onRequestClose = jest.fn();
    const timing = jest
      .spyOn(Animated, 'timing')
      .mockImplementation((_value, _config) => {
        return {
          reset: jest.fn(),
          start: (callback) => {
            callback?.({ finished: true });
          },
          stop: jest.fn(),
        };
      });

    const rendered = render(
      <BottomSheetModal
        backdropAccessibilityLabel="테스트 배경 닫기"
        onDismiss={onDismiss}
        onRequestClose={onRequestClose}
        visible
      >
        <Text>테스트 바텀시트</Text>
      </BottomSheetModal>,
    );

    expect(rendered.UNSAFE_getByType(Modal).props.animationType).toBe('none');
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 1 }),
    );

    fireEvent.press(screen.getByLabelText('테스트 배경 닫기'));
    expect(onRequestClose).toHaveBeenCalledTimes(1);

    rendered.rerender(
      <BottomSheetModal
        backdropAccessibilityLabel="테스트 배경 닫기"
        onDismiss={onDismiss}
        onRequestClose={onRequestClose}
        visible={false}
      >
        <Text>테스트 바텀시트</Text>
      </BottomSheetModal>,
    );

    expect(timing).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0 }),
    );
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('테스트 바텀시트')).toBeNull();
  });
});
