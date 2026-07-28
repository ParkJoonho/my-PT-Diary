import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { BodyComparisonResultView } from '../body-comparison-result';

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

describe('전·후 비교 결과 뷰', () => {
  it('핵심 섹션을 렌더링한다', () => {
    render(
      <BodyComparisonResultView
        result={{
          bodyChanges: {
            core: {
              change: '개선',
              description: '복부와 코어 라인이 조금 더 안정적으로 보여요.',
              details: ['복부 긴장도가 조금 더 정돈돼 보여요.'],
            },
            lowerBody: {
              change: '유지',
              description: '하체 라인은 큰 차이 없이 유지된 편이에요.',
              details: ['무릎 정렬은 전반적으로 비슷해 보여요.'],
            },
            upperBody: {
              change: '개선',
              description: '어깨와 상체 정렬이 더 자연스럽게 보여요.',
              details: ['견갑 주변 안정성이 조금 더 좋아 보여요.'],
            },
          },
          bodyComposition: {
            fatChange: '체지방은 소폭 감소한 것으로 추정돼요.',
            muscleChange: '근육량은 소폭 증가한 것으로 추정돼요.',
            proportionChange: '상체와 코어 비율이 전보다 더 안정적으로 보여요.',
          },
          motivationalMessage:
            '지금 흐름을 유지하면 다음 변화도 충분히 기대할 수 있어요.',
          overallChange: {
            grade: 'A',
            score: 84,
            summary: '상체와 코어 안정성이 전반적으로 좋아졌어요.',
          },
          postureChanges: {
            improvements: ['어깨 높이 균형이 조금 더 안정돼 보여요.'],
            overallPosture: '전체 자세 정렬이 전보다 더 정돈된 편이에요.',
            remaining: ['골반 주변 안정성은 더 지켜볼 필요가 있어요.'],
          },
          recommendations: {
            improve: ['하체 가동성 운동도 같이 진행해 주세요.'],
            keepDoing: ['현재 상체 안정화 루틴을 유지해 주세요.'],
            nextGoal: '다음 목표는 하체와 코어 연동 강화예요.',
          },
        }}
      />,
    );

    expect(screen.getByText('변화 점수')).toBeTruthy();
    expect(screen.getByText('부위별 변화')).toBeTruthy();
    expect(screen.getByText('자세 변화')).toBeTruthy();
    expect(screen.getByText('체성분 변화 추정')).toBeTruthy();
    expect(screen.getByText('추천사항')).toBeTruthy();
  });
});
