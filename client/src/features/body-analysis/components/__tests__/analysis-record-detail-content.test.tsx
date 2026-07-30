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

  it('원본의 자세 분석 상세 section을 다시 표시한다', () => {
    render(
      <AnalysisRecordDetailContent
        record={{
          analysisType: 'posture',
          analyzedAt: '2026-07-28T01:23:45.000Z',
          createdAt: '2026-07-28T01:23:45.000Z',
          id: 'record_posture',
          rawResult: {
            accuracy: {
              grade: 'A',
              summary: '동작 정확도가 좋아요.',
            },
            corrections: [
              {
                area: '무릎',
                fix: '발끝 방향으로 무릎을 정렬하세요.',
                issue: '무릎이 안쪽으로 모여요.',
                priority: '높음',
              },
            ],
            exerciseName: '백 스쿼트',
            formCheck: {
              headPosition: { note: '중립을 유지해요.', score: 4 },
              kneePosition: { note: '조금 안쪽으로 모여요.', score: 3 },
            },
            goodPoints: ['척추 중립을 잘 유지했어요.'],
            injuryRisk: {
              details: '무릎 정렬을 보완하면 좋아요.',
              level: '보통',
              score: 5,
              vulnerableAreas: ['무릎'],
            },
            recommendations: ['고관절 가동성 운동을 추가하세요.'],
            summary: '전체 동작은 안정적이에요.',
          },
        }}
      />,
    );

    expect(screen.getByText('백 스쿼트')).toBeTruthy();
    expect(screen.getByText('폼 체크')).toBeTruthy();
    expect(screen.getByText('부상 위험도')).toBeTruthy();
    expect(screen.getByText('교정 사항')).toBeTruthy();
    expect(screen.getByText('잘하고 있는 점')).toBeTruthy();
    expect(screen.getByText('추천사항')).toBeTruthy();
    expect(
      screen.queryByText('이 분석 타입의 상세 렌더링은 아직 준비 중이에요.'),
    ).toBeNull();
  });

  it('원본의 통합 분석 상세 section을 다시 표시한다', () => {
    render(
      <AnalysisRecordDetailContent
        record={{
          analysisType: 'state-vector',
          analyzedAt: '2026-07-28T01:23:45.000Z',
          createdAt: '2026-07-28T01:23:45.000Z',
          id: 'record_state_vector',
          rawResult: {
            compositeGrade: 'B',
            compositeScore: 74,
            correctionProgram: ['코어 안정화 운동'],
            dimensionScores: {
              bodyShape: 72,
              condition: { score: 68 },
              nutrition: 80,
            },
            injuryRiskAssessment: '허리 과사용에 주의하세요.',
            nutritionPlan: ['단백질 섭취를 유지하세요.'],
            predictions: {
              threeMonths: '자세 안정성이 좋아질 수 있어요.',
            },
            summary: '현재 루틴을 꾸준히 유지하세요.',
            weeklyPlan: [
              { day: '월요일', description: '상체 운동' },
              '화요일은 가벼운 유산소',
            ],
          },
        }}
      />,
    );

    expect(screen.getByText('종합 피트니스 점수')).toBeTruthy();
    expect(screen.getByText('항목별 점수')).toBeTruthy();
    expect(screen.getByText('주간 운동 계획')).toBeTruthy();
    expect(screen.getByText('교정 프로그램')).toBeTruthy();
    expect(screen.getByText('영양 계획')).toBeTruthy();
    expect(screen.getByText('부상 위험 평가')).toBeTruthy();
    expect(screen.getByText('체형 변화 예측')).toBeTruthy();
    expect(
      screen.queryByText('이 분석 타입의 상세 렌더링은 아직 준비 중이에요.'),
    ).toBeNull();
  });
});
