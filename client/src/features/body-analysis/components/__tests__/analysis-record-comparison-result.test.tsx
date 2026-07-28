import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { AnalysisRecordComparisonResult } from '../analysis-record-comparison-result';

jest.mock('lucide-react-native', () => {
  const { Text } = require('react-native');

  return new Proxy(
    {},
    {
      get: (_target, key) => {
        return function MockIcon({
          accessibilityLabel,
        }: {
          accessibilityLabel?: string;
        }) {
          return (
            <Text accessibilityLabel={accessibilityLabel}>{String(key)}</Text>
          );
        };
      },
    },
  );
});

describe('이력 비교 결과 뷰', () => {
  it('서버 비교 응답의 핵심 섹션을 모두 렌더링한다', () => {
    render(
      <AnalysisRecordComparisonResult
        result={{
          bodyTypeChange: {
            from: 'V',
            note: '체형은 유지되지만 어깨와 골반 밸런스가 더 안정적이에요.',
            to: 'V',
          },
          declines: ['하체 가동성은 아직 더 보완이 필요해요.'],
          improvements: ['어깨 정렬이 좋아졌어요.'],
          motivationalNote:
            '지금 흐름이면 다음 변화도 충분히 기대할 수 있어요.',
          overallChange: '전반적인 정렬과 밸런스가 이전보다 좋아졌어요.',
          postureChanges: [
            {
              after: 4,
              area: '어깨 균형',
              before: 2,
              change: '개선',
              note: '좌우 높이 차가 줄어들었어요.',
            },
          ],
          quantitativeChanges: [
            {
              after: '1.03',
              before: '0.99',
              changePercent: '+4.0%',
              metric: 'upperToLower',
            },
          ],
          recommendations: ['흉추 가동성과 코어 운동을 계속 유지해 주세요.'],
        }}
      />,
    );

    expect(screen.getByText('전체 변화')).toBeTruthy();
    expect(screen.getByText('체형 변화')).toBeTruthy();
    expect(screen.getByText('개선된 점')).toBeTruthy();
    expect(screen.getByText('주의 필요')).toBeTruthy();
    expect(screen.getByText('자세 점수 변화')).toBeTruthy();
    expect(screen.getByText('정량 변화')).toBeTruthy();
    expect(screen.getByText('추천사항')).toBeTruthy();
    expect(screen.getByLabelText('개선')).toBeTruthy();
    expect(
      screen.getByText('지금 흐름이면 다음 변화도 충분히 기대할 수 있어요.'),
    ).toBeTruthy();
  });
});
