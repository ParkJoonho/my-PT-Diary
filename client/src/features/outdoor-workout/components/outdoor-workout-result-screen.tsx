import { useNavigation } from '@granite-js/react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CheckIcon } from 'shared/components/icons/pt-diary-icons';
import { EmptyState } from 'shared/components/async-state';
import Colors, { iosShadow } from 'shared/constants/colors';
import { useCreateManualWorkoutRecord } from 'features/workout-records/api/workout-records';
import { buildOutdoorWorkoutRecordPayload } from '../lib/build-outdoor-workout-record-payload';
import { useOutdoorWorkoutStore } from '../stores/use-outdoor-workout-store';

const SOUND_ON_ICON = require('../../../assets/icons/sound_on.png');
const SOUND_OFF_ICON = require('../../../assets/icons/sound_off.png');
const PAUSE_ICON = require('../../../assets/icons/pause.png');
const STOP_ICON = require('../../../assets/icons/stop.png');
const PLAY_ICON = require('../../../assets/icons/play.png');
const SEGMENT_COLORS = ['#22C55E', '#FFA500', '#3B82F6'];

export function OutdoorWorkoutResultScreen() {
  const navigation = useNavigation();
  const createManualWorkoutRecord = useCreateManualWorkoutRecord();
  const clearPlanResult = useOutdoorWorkoutStore((state) => state.clearPlanResult);
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

  const handleExitToHome = () => {
    clearPlanResult();
    navigation.navigate({ name: '/', params: {} });
  };

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
    Alert.alert('운동 종료', `운동 시간: ${formatElapsedSeconds(elapsedSeconds)}`);
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
        <EmptyState message="코스 결과를 찾지 못했어요. 다시 설계해 주세요." />
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>이전 화면으로</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>뒤로</Text>
        </Pressable>
        <Text style={styles.headerTitle}>야외운동</Text>
        <Pressable onPress={handleExitToHome} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
          {plan.summary ? <Text style={styles.summaryText}>{plan.summary}</Text> : null}
          <View style={styles.statsRow}>
            <StatItem label="거리" value={plan.totalDistance || '-'} />
            <StatItem label="소요시간" value={plan.estimatedTime || '-'} />
            <StatItem label="칼로리" value={plan.estimatedCalories || '-'} />
            <StatItem label="고도차" value={plan.elevationGain || '-'} />
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

                return (
                  <View key={`${point.point}-${index}`} style={styles.barWrap}>
                    <Text
                      style={[
                        styles.barLabel,
                        { color: SEGMENT_COLORS[index % SEGMENT_COLORS.length] },
                      ]}
                    >
                      {Math.round(point.elevation)}m
                    </Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor:
                            SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                          height,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {plan.segments.length > 0 ? (
              <View style={styles.segmentList}>
                {plan.segments.map((segment, index) => (
                  <View
                    key={`${segment.name}-${index}`}
                    style={[
                      styles.segmentItem,
                      index > 0 ? styles.segmentItemWithDivider : null,
                    ]}
                  >
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
              plan.generalTips?.map((tip, index) => (
                <Text key={`${tip}-${index}`} style={styles.adviceText}>
                  {tip}
                </Text>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>

      {!workoutActive && countdown === null ? (
        <View style={styles.bottomBar}>
          {saved ? (
            <View style={styles.savedButton}>
              <CheckIcon />
              <Text style={styles.savedButtonText}>기록 저장 완료</Text>
            </View>
          ) : (
            <View style={styles.bottomButtonRow}>
              <Pressable onPress={() => void handleSave()} style={styles.saveButton}>
                {createManualWorkoutRecord.isPending ? (
                  <ActivityIndicator color={Colors.textSecondary} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>기록 저장</Text>
                )}
              </Pressable>
              <Pressable onPress={handleStartWorkout} style={styles.startButton}>
                <Text style={styles.startButtonText}>운동시작</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {countdown !== null ? (
        <View style={styles.overlay}>
          <View style={styles.countdownCircle}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>
      ) : null}

      {workoutActive ? (
        <View style={styles.overlay}>
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
  const backgroundColor = label.includes('쉬움')
    ? '#D0F1E4'
    : label.includes('보통') || label.includes('중간')
      ? '#FFF3E0'
      : '#FFE5E5';
  const color = label.includes('쉬움')
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

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
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

const styles = StyleSheet.create({
  activeTimer: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 36,
  },
  adviceText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  bar: {
    borderRadius: 8,
    width: 22,
  },
  barChart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  barLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    marginBottom: 6,
  },
  barWrap: {
    alignItems: 'center',
    flex: 1,
  },
  bottomBar: {
    backgroundColor: Colors.background,
    borderTopColor: Colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bottomButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  countdownCircle: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 999,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  countdownText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 40,
  },
  difficultyChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  difficultyChipText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  emptyContainer: {
    backgroundColor: Colors.background,
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderBottomColor: Colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerButton: {
    minWidth: 44,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderTopColor: Colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  pageTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 28,
    marginHorizontal: 18,
    marginTop: 20,
  },
  savedButton: {
    alignItems: 'center',
    backgroundColor: '#E7F7EC',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
  },
  savedButtonText: {
    color: '#16A34A',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.divider,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: 120,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.divider,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  segmentDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  segmentItem: {
    paddingTop: 14,
  },
  segmentItemWithDivider: {
    borderTopColor: Colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  segmentList: {
    marginTop: 20,
  },
  segmentMeta: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    marginLeft: 18,
    marginTop: 6,
  },
  segmentName: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  segmentTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
  },
  startButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  statItem: {
    flex: 1,
    minWidth: '22%',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  statValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  summaryText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  workoutControlButton: {
    alignItems: 'center',
    gap: 8,
  },
  workoutControlIcon: {
    height: 28,
    width: 28,
  },
  workoutControlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 28,
    justifyContent: 'center',
  },
  workoutControlText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
});
