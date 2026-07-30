import { useNavigation } from '@granite-js/react-native';
import { useCreateManualWorkoutRecord } from 'features/workout-records/api/workout-records';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import {
  OriginalAppIcon,
  SemanticIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { buildOutdoorWorkoutRecordPayload } from '../lib/build-outdoor-workout-record-payload';
import { useOutdoorWorkoutStore } from '../stores/use-outdoor-workout-store';

const SOUND_ON_ICON = require('../../../assets/icons/sound_on.png');
const SOUND_OFF_ICON = require('../../../assets/icons/sound_off.png');
const PAUSE_ICON = require('../../../assets/icons/pause.png');
const STOP_ICON = require('../../../assets/icons/stop.png');
const PLAY_ICON = require('../../../assets/icons/play.png');
const SEGMENT_COLORS = ['#22C55E', '#FFA500', '#3B82F6'];
const SEGMENT_GRADIENTS = [
  ['#15C47E', '#76E4B8'],
  ['#FE9800', '#FFBD51'],
  ['#3182F6', '#64A8FF'],
] as const;

type OutdoorWorkoutResultScreenProps = {
  contentBottomInset: number;
  tabBarHeight: number;
};

export function OutdoorWorkoutResultScreen({
  contentBottomInset,
  tabBarHeight,
}: OutdoorWorkoutResultScreenProps) {
  const navigation = useNavigation();
  const createManualWorkoutRecord = useCreateManualWorkoutRecord();
  const planResult = useOutdoorWorkoutStore((state) => state.planResult);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saved, setSaved] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedElapsedRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!planResult) {
      navigation.goBack();
    }
  }, [navigation, planResult]);

  const plan = planResult?.plan;
  const elevationPoints = planResult?.elevationPoints ?? [];
  const workoutMode = planResult?.workoutMode ?? 'walking';
  const minimumElevation = elevationPoints.length
    ? Math.min(...elevationPoints.map((point) => point.elevation))
    : 0;
  const maximumElevation = elevationPoints.length
    ? Math.max(...elevationPoints.map((point) => point.elevation))
    : 0;
  const elevationRange = maximumElevation - minimumElevation || 1;
  const shouldRenderElevationCard =
    elevationPoints.length > 0 && maximumElevation > minimumElevation;

  const activeTimerText = useMemo(
    () => formatElapsedSeconds(elapsedSeconds),
    [elapsedSeconds],
  );

  const handleStartWorkout = () => {
    setCountdown(3);
    let countdownValue = 3;

    const tick = () => {
      countdownValue -= 1;

      if (countdownValue <= 0) {
        setCountdown(null);
        setWorkoutActive(true);
        const baseTime = Date.now();
        timerRef.current = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - baseTime) / 1000));
        }, 1000);
        return;
      }

      setCountdown(countdownValue);
      countdownRef.current = setTimeout(tick, 1000);
    };

    countdownRef.current = setTimeout(tick, 1000);
  };

  const handlePauseResume = () => {
    if (workoutPaused) {
      const resumedBaseTime = Date.now() - pausedElapsedRef.current * 1000;
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - resumedBaseTime) / 1000));
      }, 1000);
      setWorkoutPaused(false);
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    pausedElapsedRef.current = elapsedSeconds;
    setWorkoutPaused(true);
  };

  const handleStopWorkout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setWorkoutActive(false);
    setWorkoutPaused(false);
    Alert.alert(
      '운동 종료',
      `운동 시간: ${formatElapsedSeconds(elapsedSeconds)}`,
    );
  };

  const handleSave = async () => {
    if (!plan || createManualWorkoutRecord.isPending) {
      return;
    }

    try {
      await createManualWorkoutRecord.mutateAsync(
        buildOutdoorWorkoutRecordPayload({
          plan,
          workoutMode,
        }),
      );
      setSaved(true);
      Alert.alert(
        '저장 완료',
        `야외 ${workoutMode === 'hiking' ? '등산' : '걷기'} 기록이 저장되었습니다.`,
      );
    } catch (error) {
      Alert.alert(
        '저장 실패',
        error instanceof Error
          ? error.message
          : '야외운동 기록 저장에 실패했어요.',
      );
    }
  };

  if (!planResult || !plan) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>야외운동</Text>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>코스 요약</Text>
            {plan.difficulty ? (
              <DifficultyChip label={plan.difficulty} />
            ) : null}
          </View>
          {plan.summary ? (
            <Text style={styles.summaryText}>{plan.summary}</Text>
          ) : null}
          <View style={styles.statsRow}>
            <StatItem
              fallbackUnit="km"
              label="거리"
              value={plan.totalDistance || '-'}
            />
            <View style={styles.statDivider} />
            <StatItem
              fallbackUnit="분"
              label="소요시간"
              value={plan.estimatedTime || '-'}
            />
            <View style={styles.statDivider} />
            <StatItem
              fallbackUnit="kcal"
              label="칼로리"
              value={plan.estimatedCalories || '-'}
            />
            <View style={styles.statDivider} />
            <StatItem
              fallbackUnit="m"
              label="고도차"
              value={plan.elevationGain || '-'}
            />
          </View>
        </View>

        {shouldRenderElevationCard ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>코스 고도 그래프</Text>
            <View style={styles.barChart}>
              {elevationPoints.slice(0, 10).map((point, index) => {
                const height =
                  Math.round(
                    ((point.elevation - minimumElevation) / elevationRange) *
                      0.65 *
                      150 +
                      0.35 * 150,
                  ) || 16;

                const gradientIndex = getSegmentGradientIndex(
                  index,
                  elevationPoints.length,
                );

                return (
                  <View key={`${point.point}-${index}`} style={styles.barWrap}>
                    <Text
                      style={[
                        styles.barLabel,
                        { color: SEGMENT_COLORS[gradientIndex] },
                      ]}
                    >
                      {Math.round(point.elevation)}m
                    </Text>
                    <GradientBar
                      colors={SEGMENT_GRADIENTS[gradientIndex]}
                      height={height}
                      index={index}
                    />
                  </View>
                );
              })}
            </View>

            {plan.segments.length > 0 ? (
              <View style={styles.segmentList}>
                {plan.segments.map((segment, index) => (
                  <Fragment key={`${segment.name}-${index}`}>
                    {index > 0 ? <View style={styles.segmentDivider} /> : null}
                    <View
                      style={[
                        styles.segmentItem,
                        index === 0 ? styles.firstSegmentItem : null,
                      ]}
                    >
                      <View style={styles.segmentContent}>
                        <View style={styles.segmentTitleRow}>
                          <View
                            style={[
                              styles.segmentDot,
                              {
                                backgroundColor:
                                  SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                              },
                            ]}
                          />
                          <Text style={styles.segmentName}>
                            {segment.name || `구간 ${index + 1}`}
                          </Text>
                          {segment.difficulty ? (
                            <DifficultyChip label={segment.difficulty} />
                          ) : null}
                        </View>
                        <Text style={styles.segmentMeta}>
                          {[
                            segment.distance ? `${segment.distance}km` : null,
                            segment.terrainType,
                            segment.slopeInfo,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </Text>
                      </View>
                    </View>
                  </Fragment>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {plan.personalizedNote || plan.generalTips?.length ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>맞춤 조언</Text>
            {plan.personalizedNote ? (
              <Text style={styles.adviceText}>{plan.personalizedNote}</Text>
            ) : (
              plan.generalTips?.map((tip) => (
                <Text key={tip} style={styles.adviceText}>
                  {tip}
                </Text>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>

      {!workoutActive && countdown === null ? (
        <View style={[styles.bottomBar, { bottom: tabBarHeight }]}>
          {saved ? (
            <View style={[styles.startButton, styles.savedButton]}>
              <OriginalAppIcon
                color={Colors.white}
                name="checkmarkCircle"
                size={20}
              />
              <Text style={styles.startButtonText}>기록 저장 완료</Text>
            </View>
          ) : (
            <View style={styles.bottomButtonRow}>
              <Pressable
                onPress={() => void handleSave()}
                style={styles.saveButton}
              >
                {createManualWorkoutRecord.isPending ? (
                  <ActivityIndicator
                    color={Colors.textSecondary}
                    size="small"
                  />
                ) : (
                  <Text style={styles.saveButtonText}>기록 저장</Text>
                )}
              </Pressable>
              <Pressable
                onPress={handleStartWorkout}
                style={styles.startButton}
              >
                <SemanticIcon color={Colors.white} name="play" size={16} />
                <Text style={styles.startButtonText}>운동시작</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {countdown !== null ? (
        <View style={[styles.overlay, { bottom: tabBarHeight + 10 }]}>
          <View style={styles.countdownCircle}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>
      ) : null}

      {workoutActive ? (
        <View style={[styles.overlay, { bottom: tabBarHeight + 10 }]}>
          <Text style={styles.activeTimer}>{activeTimerText}</Text>
          <View style={styles.workoutControlRow}>
            <WorkoutControl
              icon={voiceEnabled ? SOUND_ON_ICON : SOUND_OFF_ICON}
              label={`음성안내 ${voiceEnabled ? 'ON' : 'OFF'}`}
              onPress={() => setVoiceEnabled((current) => !current)}
            />
            <WorkoutControl
              icon={workoutPaused ? PLAY_ICON : PAUSE_ICON}
              label={workoutPaused ? '다시 시작' : '일시정지'}
              onPress={handlePauseResume}
            />
            <WorkoutControl
              icon={STOP_ICON}
              label="종료"
              onPress={handleStopWorkout}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DifficultyChip({ label }: { label: string }) {
  const backgroundColor =
    label.includes('쉬움') || label.includes('완만')
      ? '#D0F1E4'
      : label.includes('보통') || label.includes('중간')
        ? '#FFF3E0'
        : '#FFE5E5';
  const color =
    label.includes('쉬움') || label.includes('완만')
      ? '#16BB76'
      : label.includes('보통') || label.includes('중간')
        ? '#FF9500'
        : '#FF3B30';

  return (
    <View style={[styles.difficultyChip, { backgroundColor }]}>
      <Text style={[styles.difficultyChipText, { color }]}>{label}</Text>
    </View>
  );
}

function StatItem({
  fallbackUnit,
  label,
  value,
}: {
  fallbackUnit: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <StatValue fallbackUnit={fallbackUnit} value={value} />
    </View>
  );
}

function StatValue({
  fallbackUnit,
  value,
}: {
  fallbackUnit: string;
  value: string;
}) {
  if (!value || value === '-') {
    return <Text style={styles.statValue}>-</Text>;
  }

  const match = value.match(/^(약\s*)?([+-]?[\d.]+)\s*(.+)?$/);
  if (!match) {
    return <Text style={styles.statValue}>{value}</Text>;
  }

  const prefix = match[1] ?? '';
  const number = match[2] ?? value;
  const unit = match[3]?.trim() || fallbackUnit;

  return (
    <Text style={styles.statValue}>
      {prefix ? <Text style={styles.statUnit}>{prefix}</Text> : null}
      {number}
      {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
    </Text>
  );
}

function GradientBar({
  colors,
  height,
  index,
}: {
  colors: readonly [string, string];
  height: number;
  index: number;
}) {
  const gradientId = `outdoor-elevation-${index}`;

  return (
    <View style={[styles.bar, { height }]}>
      <Svg height="100%" width="100%">
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </SvgLinearGradient>
        </Defs>
        <Rect fill={`url(#${gradientId})`} height="100%" rx="5" width="100%" />
      </Svg>
    </View>
  );
}

function getSegmentGradientIndex(index: number, total: number) {
  const ratio = index / total;

  if (ratio < 0.25) {
    return 0;
  }

  return ratio < 0.8 ? 1 : 2;
}

function WorkoutControl({
  icon,
  label,
  onPress,
}: {
  icon: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.workoutControlButton}>
      <Image source={icon} style={styles.workoutControlIcon} />
      <Text style={styles.workoutControlText}>{label}</Text>
    </Pressable>
  );
}

function formatElapsedSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// TODO(outdoor-workout-migration): 원본 앱과 동일하게 이 화면의 타이머는
// 실제 GPS 세션 추적이 아니라 화면 내 카운트다운/시계예요.
// 음성안내 토글도 실제 TTS 연결 없이 UI 상태만 바꿔요.

// TODO(outdoor-workout-migration): 원본 저장 의미를 유지하기 위해 현재 `기록 저장`은
// 운동 시작/종료 여부와 무관하게 계획값 기반 payload를 바로 DB에 저장해요.
// 추후 실측 세션 개념이 들어오면 저장 버튼 노출 조건과 payload 구조를 다시 설계해야 해요.

const outdoorResultCardShadow =
  Platform.OS === 'web'
    ? { boxShadow: 'rgba(0,0,0,0.05) 0px 0px 1px' }
    : {
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      };

const styles = StyleSheet.create({
  activeTimer: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 52,
    letterSpacing: 2,
  },
  adviceText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 8,
  },
  bar: {
    borderRadius: 5,
    minHeight: 10,
    overflow: 'hidden',
    width: '100%',
  },
  barChart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
    height: 150,
    marginBottom: 0,
    marginTop: 32,
  },
  barLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    marginBottom: 5,
  },
  barWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomBar: {
    backgroundColor: Colors.background,
    left: 0,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
  },
  bottomButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    ...outdoorResultCardShadow,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  countdownCircle: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: Colors.white,
    borderRadius: 45,
    borderWidth: 3,
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
  countdownText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 42,
  },
  difficultyChip: {
    alignItems: 'center',
    borderRadius: 9,
    height: 21,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  difficultyChipText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    lineHeight: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  firstSegmentItem: {
    paddingTop: 0,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    gap: 20,
    height: 170,
    justifyContent: 'center',
    left: 10,
    position: 'absolute',
    right: 10,
    zIndex: 100,
  },
  pageTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
    marginBottom: 4,
  },
  savedButton: {
    backgroundColor: '#22C55E',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#ECEEF2',
    borderRadius: 14,
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#4B5563',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  scrollContent: {
    gap: 12,
    padding: 16,
  },
  segmentContent: {
    flex: 1,
    gap: 3,
  },
  segmentDivider: {
    backgroundColor: '#F0F2F5',
    height: 1,
  },
  segmentDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  segmentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  segmentList: {
    marginTop: 20,
  },
  segmentMeta: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  segmentName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  segmentTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 56,
    justifyContent: 'center',
  },
  startButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  statDivider: {
    backgroundColor: '#F0F2F5',
    height: 32,
    width: 1,
  },
  statItem: {
    alignItems: 'flex-start',
    gap: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  statUnit: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  statValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  summaryText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  workoutControlButton: {
    alignItems: 'center',
    gap: 6,
  },
  workoutControlIcon: {
    height: 36,
    width: 36,
  },
  workoutControlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 36,
    justifyContent: 'center',
  },
  workoutControlText: {
    color: '#8E8E8E',
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
});
