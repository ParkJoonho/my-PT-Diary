import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RowActionCard } from '../row-action-card';

describe('공통 row action card', () => {
  it('원본 공통 구조의 제목과 설명을 표시하고 press를 전달한다', () => {
    const onPress = jest.fn();

    render(
      <RowActionCard
        imageSource={{ uri: 'trainer-icon.png' }}
        onPress={onPress}
        subtitle="나에게 딱 맞는 트레이너를 추천해드려요."
        title="트레이너 연결"
      />,
    );

    fireEvent.press(screen.getByText('트레이너 연결'));

    expect(
      screen.getByText('나에게 딱 맞는 트레이너를 추천해드려요.'),
    ).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
