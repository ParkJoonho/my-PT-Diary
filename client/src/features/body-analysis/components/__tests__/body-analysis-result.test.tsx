import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { BodyAnalysisResultView } from '../body-analysis-result';

describe('체형 분석 결과 뷰', () => {
  it('원본 기준 핵심 섹션을 모두 렌더링한다', () => {
    render(
      <BodyAnalysisResultView
        result={{
          bodyType: 'V',
          bodyTypeDescription: '상체가 상대적으로 발달한 체형이에요.',
          gaitAnalysis: {
            bodyImpact: {
              hipImpact: { note: '골반에 부담이 있어요.', score: 3 },
              kneeImpact: { note: '무릎에 약간의 부담이 있어요.', score: 3 },
              spineImpact: { note: '척추 정렬에 영향이 있어요.', score: 2 },
            },
            footAlignment: {
              ankleAlignment: {
                note: '발목이 약간 안쪽으로 기울어요.',
                score: 3,
              },
              archType: '보통 아치',
              toeAlignment: { note: '발가락 정렬은 무난해요.', value: '정상' },
            },
            gaitRecommendations: ['종아리와 발목 가동성 운동을 추가해 주세요.'],
            gaitType: {
              description: '뒤꿈치 착지가 조금 강한 편이에요.',
              type: '뒤꿈치 중심 보행',
            },
            shoeRecommendations: {
              afterCorrection: {
                correctedGaitType: '균형 보행',
                daily: [
                  {
                    archSupport: '보통',
                    brand: 'Brand A',
                    cushioning: '높음',
                    features: ['안정화', '쿠셔닝'],
                    model: 'Model A',
                    priceRange: '15만원대',
                    reason: '일상에서 안정감이 좋아요.',
                    stability: '높음',
                    type: '워킹화',
                  },
                ],
                timeline: '6주',
                workout: [
                  {
                    archSupport: '보통',
                    brand: 'Brand B',
                    cushioning: '보통',
                    features: ['가벼움'],
                    model: 'Model B',
                    priceRange: '18만원대',
                    reason: '운동 시 반응성이 좋아요.',
                    stability: '보통',
                    type: '러닝화',
                  },
                ],
              },
              current: {
                daily: [
                  {
                    archSupport: '보통',
                    brand: 'Brand C',
                    cushioning: '높음',
                    features: ['쿠셔닝'],
                    model: 'Model C',
                    priceRange: '14만원대',
                    reason: '현재 보행 패턴에 맞아요.',
                    stability: '보통',
                    type: '워킹화',
                  },
                ],
                workout: [
                  {
                    archSupport: '높음',
                    brand: 'Brand D',
                    cushioning: '보통',
                    features: ['안정성'],
                    model: 'Model D',
                    priceRange: '19만원대',
                    reason: '운동 시 안정성을 보완해요.',
                    stability: '높음',
                    type: '트레이닝화',
                  },
                ],
              },
              matchingLogic: '보행 패턴과 발볼을 함께 고려했어요.',
            },
            shoeSizeEstimate: {
              ageGroup: '성인',
              estimatedSize: 270,
              footLength: '26.8cm',
              footWidthCm: '10.2cm',
              gender: '남성',
              genderReason: '사용자 입력과 비율을 참고했어요.',
              sizeRange: '265-270',
              sizeSystem: 'KR mm 기준',
              width: '보통',
              widthDescription: '발볼은 평균 범위로 보여요.',
            },
            wearPattern: {
              description: '뒤꿈치 바깥쪽 마모가 보여요.',
              leftRight: '양발',
              type: '뒤꿈치마모',
            },
          },
          lowerBody: {
            hipWidth: { note: '골반이 안정적인 편이에요.', value: '보통' },
            kneeAlignment: {
              note: '무릎 정렬은 약간 안쪽이에요.',
              value: '경미한 내반',
            },
            legLength: { note: '다리 비율은 균형적이에요.', value: '보통' },
          },
          medicalAnalysis: {
            bodyStructureImpact: '현재 자세가 허리에 부담을 줄 수 있어요.',
            disclaimer: '참고용 분석이며 전문 진단을 대체하지 않아요.',
            exerciseWarnings: [
              {
                alternative: '브릿지 운동',
                exercise: '무거운 백스쿼트',
                reason: '허리 부담이 커질 수 있어요.',
              },
            ],
            lifestyleAdvice: ['장시간 앉아 있을 때 허리 스트레칭을 해 주세요.'],
            referralSuggestion: '통증이 계속되면 전문가 상담을 권장해요.',
            rehabExercises: [
              {
                description: '골반 안정화에 도움이 돼요.',
                frequency: '주 3회',
                name: '데드버그',
                precaution: '허리 과신전은 피하세요.',
                targetArea: '코어',
              },
            ],
            musculoskeletalRisks: [
              {
                area: '허리',
                description: '요추 부담이 누적될 수 있어요.',
                preventionTip: '코어 안정화 운동을 병행해 주세요.',
                riskLevel: '중간',
              },
            ],
            symptomAssessment: '허리 통증은 자세 영향 가능성이 있어요.',
          },
          multiViewAnalysis: {
            backView: {
              muscleImbalance: {
                detected: true,
                note: '좌우 긴장 차이가 보여요.',
                severity: '경미',
              },
              pelvicAsymmetry: {
                detected: false,
                note: '골반은 비교적 안정적이에요.',
              },
              scapularWinging: {
                detected: true,
                note: '견갑 안정성이 조금 부족해요.',
                severity: '경미',
              },
              scoliosis: { detected: false, note: '큰 측만 징후는 없어요.' },
              shoulderAsymmetry: {
                detected: true,
                note: '어깨 높이 차이가 조금 있어요.',
                severity: '경미',
              },
            },
            compositeGrade: 'B',
            compositePostureScore: 78,
            priorityCorrections: [
              {
                description: '흉추와 견갑 안정화를 먼저 보완해 주세요.',
                exercise: '밴드 풀어파트',
                issue: '어깨 안정성',
                priority: '높음',
              },
            ],
            sideView: {
              anteriorPelvicTilt: {
                detected: true,
                note: '골반이 약간 앞으로 기울어요.',
                severity: '경미',
              },
              forwardHeadPosture: {
                detected: true,
                note: '거북목 경향이 있어요.',
                severity: '경미',
              },
              kneeHyperextension: {
                detected: false,
                note: '과신전은 크지 않아요.',
              },
              roundedShoulders: {
                detected: true,
                note: '어깨가 약간 말려 있어요.',
                severity: '경미',
              },
              spinalCurve: {
                note: '흉추 후만이 약간 강조돼 보여요.',
                type: '과도후만',
              },
            },
            squatView: {
              ankleMobility: { note: '발목 가동성은 보통이에요.', score: 3 },
              balance: { note: '균형은 무난해요.', score: 3 },
              hipMobility: { note: '고관절 가동성이 살짝 부족해요.', score: 2 },
              kneeValgus: {
                detected: true,
                note: '무릎이 안쪽으로 모여요.',
                severity: '경미',
              },
              squatDepth: { note: '하프 스쿼트 깊이예요.', value: '하프' },
              trunkLean: {
                detected: true,
                note: '상체가 조금 앞으로 기울어요.',
                severity: '경미',
              },
            },
            viewsAnalyzed: ['front', 'side', 'back', 'squat'],
          },
          posture: {
            hipBalance: { note: '골반 높이 차이는 크지 않아요.', score: 3 },
            overallAlignment: { note: '정렬이 전반적으로 무난해요.', score: 3 },
            shoulderBalance: {
              note: '어깨 좌우 차이가 약간 있어요.',
              score: 2,
            },
            spinalCurvature: { note: '척추 곡선은 보통이에요.', score: 3 },
          },
          prediction: {
            currentDate: '2026-07-28',
            currentEstimate: '현재 기준으로는 자세 개선 여지가 충분해요.',
            daysSincePhoto: 12,
            exerciseImpact:
              '상체 안정화 루틴을 유지하면 어깨 정렬에 도움이 돼요.',
            milestones: ['3개월 안에 어깨 안정성 향상을 기대할 수 있어요.'],
            oneYearPrediction: '1년 후에는 전체 균형이 더 좋아질 수 있어요.',
            photoDate: '2026-07-16',
            riskFactors: ['허리 과사용은 주의가 필요해요.'],
            sixMonthPrediction:
              '6개월 후에는 골반 안정성이 더 좋아질 가능성이 있어요.',
            threeMonthPrediction:
              '3개월 후에는 상체 정렬이 더 안정될 수 있어요.',
          },
          ratios: {
            armToHeight: 0.49,
            upperToLower: 1.03,
          },
          recommendations: [
            '흉추 가동성 운동과 코어 안정화 운동을 병행해 주세요.',
          ],
          summary: '상체 안정성과 골반 밸런스를 함께 관리하면 좋아요.',
          upperBody: {
            armLength: { note: '팔 길이는 평균적이에요.', value: '보통' },
            neckLength: {
              note: '목 길이는 다소 짧아 보여요.',
              value: '짧은 편',
            },
            shoulderWidth: {
              note: '어깨가 비교적 넓은 편이에요.',
              value: '넓은 편',
            },
            spineAlignment: { note: '척추 정렬은 무난해요.', value: '보통' },
          },
        }}
      />,
    );

    expect(screen.getByText('BODY MBTI')).toBeTruthy();
    expect(screen.getByText('신체 비율')).toBeTruthy();
    expect(screen.getByText('다중 각도 종합 분석')).toBeTruthy();
    expect(screen.getByText('걸음걸이 분석')).toBeTruthy();
    expect(screen.getByText('맞춤 신발 추천')).toBeTruthy();
    expect(screen.getByText('의료 증상 분석')).toBeTruthy();
    expect(screen.getByText('체형 추천사항')).toBeTruthy();
    expect(screen.getByText('종합 요약')).toBeTruthy();
    expect(
      StyleSheet.flatten(
        screen.getByTestId('upper-to-lower-ratio-marker').props.style,
      ).left,
    ).toBe('51.5%');
  });
});
