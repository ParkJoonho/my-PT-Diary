import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { AnalysisRecordDetailContent } from '../analysis-record-detail-content';

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

describe('분석 이력 상세', () => {
  it('저장된 신발 분석의 보행·사이즈·전체 추천 분기를 다시 보여 준다', () => {
    render(
      <AnalysisRecordDetailContent
        record={{
          analysisType: 'body',
          analyzedAt: '2026-07-28T01:23:45.000Z',
          createdAt: '2026-07-28T01:23:45.000Z',
          id: 'record_shoe',
          rawResult: {
            gaitAnalysis: {
              bodyImpact: {
                hipImpact: { note: '골반 부담이 보여요.', score: 3 },
                kneeImpact: { note: '무릎 부담이 보여요.', score: 2 },
                spineImpact: { note: '척추 부담이 보여요.', score: 3 },
              },
              footAlignment: {
                ankleAlignment: { note: '발목이 안쪽으로 기울어요.', score: 2 },
                archType: '낮은 아치',
                toeAlignment: {
                  note: '엄지가 안쪽으로 향해요.',
                  value: '내향',
                },
              },
              gaitRecommendations: ['발목 가동성 운동을 해 주세요.'],
              gaitType: {
                description: '과내전 경향이 보여요.',
                type: '과내전 보행',
              },
              shoeRecommendations: {
                afterCorrection: {
                  correctedGaitType: '중립 보행',
                  daily: [
                    {
                      brand: '교정후일상',
                      model: 'After Daily',
                      type: '워킹화',
                    },
                  ],
                  timeline: '6주',
                  workout: [
                    {
                      brand: '교정후운동',
                      model: 'After Workout',
                      type: '러닝화',
                    },
                  ],
                },
                current: {
                  daily: [
                    {
                      brand: '현재일상',
                      model: 'Current Daily',
                      type: '워킹화',
                    },
                  ],
                  workout: [
                    {
                      brand: '현재운동',
                      model: 'Current Workout',
                      type: '트레이닝화',
                    },
                  ],
                },
                matchingLogic: '아치와 보행 안정성을 함께 고려했어요.',
              },
              shoeSizeEstimate: {
                estimatedSize: 270,
                footLength: '26.8cm',
                footWidthCm: '10.2cm',
                sizeRange: '265-270',
                sizeSystem: 'KR mm 기준',
                width: '보통',
              },
              wearPattern: {
                description: '안쪽 마모가 커요.',
                leftRight: '양발',
                type: '내측마모',
              },
            },
          },
        }}
      />,
    );

    expect(screen.getByText('발 정렬 상태')).toBeTruthy();
    expect(screen.getByText('걸음걸이가 신체에 미치는 영향')).toBeTruthy();
    expect(screen.getByText('270')).toBeTruthy();
    expect(
      screen.getByText('아치와 보행 안정성을 함께 고려했어요.'),
    ).toBeTruthy();
    expect(screen.getByText('Current Daily')).toBeTruthy();
    expect(screen.queryByText('BODY MBTI')).toBeNull();

    fireEvent.press(screen.getByText('운동화'));
    expect(screen.getByText('Current Workout')).toBeTruthy();

    fireEvent.press(screen.getByText('교정 후'));
    expect(screen.getByText('After Workout')).toBeTruthy();

    fireEvent.press(screen.getByText('일상 신발'));
    expect(screen.getByText('After Daily')).toBeTruthy();
  });
});
