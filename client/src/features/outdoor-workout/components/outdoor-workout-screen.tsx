import { useNavigation } from '@granite-js/react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AIInfoIcon } from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow, iosShadowLight } from 'shared/constants/colors';
import type { CreateOutdoorWorkoutPlanDto } from 'shared/api/generated/models';
import { useCreateOutdoorWorkoutPlan } from '../api/outdoor-workout';
import { calculateDistanceKilometers } from '../lib/calculate-distance';
import { fetchElevationData } from '../lib/fetch-elevation-data';
import {
  getCurrentLocation,
  getLocationDisplayName,
} from '../lib/get-current-location';
import { generateRoutePoints } from '../lib/generate-route-points';
import { useOutdoorWorkoutStore } from '../stores/use-outdoor-workout-store';
import type {
  OutdoorWorkoutLocation,
  OutdoorWorkoutMode,
  OutdoorWorkoutRadius,
} from '../types/outdoor-workout';

function IOSToggle({
  onValueChange,
  value,
}: {
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      bounciness: 4,
      speed: 20,
      toValue: value ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [animation, value]);

  return (
    <Pressable onPress={() => onValueChange(!value)} style={styles.toggleRoot}>
      <Animated.View
        style={[
          styles.toggleTrack,
          {
            backgroundColor: animation.interpolate({
              inputRange: [0, 1],
              outputRange: ['#E0E3E8', Colors.accent],
            }) as never,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              borderRadius: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 12],
              }) as never,
              height: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 24],
              }) as never,
              left: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [7, 24],
              }) as never,
              top: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 4],
              }) as never,
              width: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 24],
              }) as never,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export function OutdoorWorkoutScreen() {
  const navigation = useNavigation();
  const createOutdoorWorkoutPlan = useCreateOutdoorWorkoutPlan();
  const setPlanResult = useOutdoorWorkoutStore((state) => state.setPlanResult);
  const [location, setLocation] = useState<OutdoorWorkoutLocation | null>(null);
  const [locationName, setLocationName] = useState('내 위치');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedRadius, setSelectedRadius] =
    useState<OutdoorWorkoutRadius>(1);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [autoDestinationEnabled, setAutoDestinationEnabled] = useState(false);
  const [workoutMode, setWorkoutMode] =
    useState<OutdoorWorkoutMode>('walking');

  useEffect(() => {
    void requestLocation();
  }, []);

  const canAnalyze = Boolean(location) && !createOutdoorWorkoutPlan.isPending;

  const distanceLabel = useMemo(() => {
    if (!destination || !location) {
      return null;
    }

    return calculateDistanceKilometers(
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      destination,
    ).toFixed(1);
  }, [destination, location]);

  const requestLocation = async () => {
    setLoadingLocation(true);

    try {
      const nextLocation = await getCurrentLocation();
      setLocation(nextLocation);
      setLocationName(getLocationDisplayName(nextLocation));
    } finally {
      setLoadingLocation(false);
    }
  };

  const clearDestination = () => {
    setDestination(null);
  };

  const handleSetRandomDestination = () => {
    if (!location) {
      return;
    }

    const angle = Math.random() * 2 * Math.PI;
    const distance =
      (0.3 + Math.random() * 0.7) * Number(selectedRadius);
    const deltaLatitude = (distance / 111.32) * Math.cos(angle);
    const deltaLongitude =
      (distance / (111.32 * Math.cos((location.latitude * Math.PI) / 180))) *
      Math.sin(angle);

    setDestination({
      latitude: location.latitude + deltaLatitude,
      longitude: location.longitude + deltaLongitude,
    });
  };

  const analyzeRoute = async () => {
    if (!location) {
      return;
    }

    const activeDestination =
      autoDestinationEnabled && !destination
        ? createRandomDestination(location, selectedRadius)
        : destination;
    const target =
      activeDestination ?? {
        latitude: location.latitude + Number(selectedRadius) * 0.005,
        longitude: location.longitude + Number(selectedRadius) * 0.005,
      };

    if (!destination && activeDestination) {
      setDestination(activeDestination);
    }

    try {
      const routePoints = generateRoutePoints(
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        target,
        10,
      );
      const elevationData = await fetchElevationData(routePoints);
      const payload: CreateOutdoorWorkoutPlanDto = {
        distanceKm: Number(
          calculateDistanceKilometers(
            {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            target,
          ).toFixed(2),
        ),
        elevationData,
        endLat: target.latitude,
        endLng: target.longitude,
        mode: workoutMode,
        radiusKm: selectedRadius,
        startLat: location.latitude,
        startLng: location.longitude,
      };

      const plan = await createOutdoorWorkoutPlan.mutateAsync(payload);
      setPlanResult({
        elevationPoints: elevationData,
        locationName,
        plan,
        workoutMode,
      });
      navigation.navigate({ name: '/outdoor-workout-result', params: {} });
    } catch (error) {
      Alert.alert(
        '오류',
        error instanceof Error
          ? error.message
          : '야외운동 계획 생성에 실패했어요.',
      );
    }
  };

  if (loadingLocation) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color={Colors.accent} />
        <Text style={styles.loadingText}>위치 정보를 가져오는 중...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyTitle}>위치 정보를 사용할 수 없어요</Text>
        <Pressable onPress={requestLocation} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          testID="outdoor-back-button"
        >
          <Text style={styles.headerButtonText}>뒤로</Text>
        </Pressable>
        <Text style={styles.headerTitle}>야외운동</Text>
        <Pressable
          onPress={() => navigation.navigate({ name: '/', params: {} })}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.locationRow}>
          <Text style={styles.locationDot}>●</Text>
          <Text style={styles.locationName}>{locationName}</Text>
          <Pressable onPress={requestLocation} style={styles.resetChip}>
            <Text style={styles.resetChipText}>재설정</Text>
          </Pressable>
        </View>

        <View style={styles.controlCard}>
          <Text style={styles.sectionLabel}>운동 선택</Text>
          <View style={styles.segmentedControl}>
            <SelectChip
              active={workoutMode === 'walking'}
              label="걷기/러닝"
              onPress={() => setWorkoutMode('walking')}
              testID="mode-walking"
            />
            <SelectChip
              active={workoutMode === 'hiking'}
              label="등산"
              onPress={() => setWorkoutMode('hiking')}
              testID="mode-hiking"
            />
          </View>

          <Text style={[styles.sectionLabel, styles.sectionMargin]}>
            거리 선택
          </Text>
          <View style={styles.radiusGroup}>
            {[1, 2, 3].map((radius) => (
              <SelectChip
                active={selectedRadius === radius}
                key={radius}
                label={`${radius}km`}
                onPress={() => setSelectedRadius(radius as OutdoorWorkoutRadius)}
                testID={`radius-${radius}`}
              />
            ))}
          </View>

          <View style={styles.toggleRow}>
            <IOSToggle
              onValueChange={(nextValue) => {
                setAutoDestinationEnabled(nextValue);

                if (nextValue) {
                  handleSetRandomDestination();
                  return;
                }

                clearDestination();
              }}
              value={autoDestinationEnabled}
            />
            <View style={styles.toggleTextGroup}>
              <Text style={styles.toggleTitle}>반경 내 목적지 자동 설정</Text>
              <Text
                style={[
                  styles.toggleSubtitle,
                  autoDestinationEnabled && distanceLabel
                    ? styles.toggleSubtitleActive
                    : null,
                ]}
              >
                {autoDestinationEnabled && distanceLabel
                  ? `AI 추천 목적지 설정 완료(${distanceLabel}km)`
                  : 'AI가 반경 내 목적지를 설정해줘요.'}
              </Text>
            </View>
          </View>

          <Pressable
            disabled={!canAnalyze}
            onPress={() => void analyzeRoute()}
            style={[
              styles.primaryButton,
              styles.analyzeButton,
              !canAnalyze ? styles.disabledButton : null,
            ]}
            testID="analyze-button"
          >
            {createOutdoorWorkoutPlan.isPending ? (
              <View style={styles.inlineRow}>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.primaryButtonText}>코스 설계 중...</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>
                {autoDestinationEnabled
                  ? '추천 코스 설계 시작'
                  : `${selectedRadius}km 코스 설계 시작`}
              </Text>
            )}
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.tipRow}>
            <AIInfoIcon />
            <View style={styles.tipTextGroup}>
              <Text style={styles.tipText}>
                AI 체형 분석 시 내 체형에 맞춰 코스를 설계해요.
              </Text>
              <Pressable
                onPress={() =>
                  Alert.alert('내 체형 분석하기', '준비 중인 기능입니다.')
                }
                style={styles.tipLink}
              >
                <Text style={styles.tipLinkText}>내 체형 분석하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SelectChip({
  active,
  label,
  onPress,
  testID,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : null]}
      testID={testID}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function createRandomDestination(
  location: OutdoorWorkoutLocation,
  radiusKm: OutdoorWorkoutRadius,
) {
  const angle = Math.random() * 2 * Math.PI;
  const distance = (0.3 + Math.random() * 0.7) * Number(radiusKm);
  const deltaLatitude = (distance / 111.32) * Math.cos(angle);
  const deltaLongitude =
    (distance / (111.32 * Math.cos((location.latitude * Math.PI) / 180))) *
    Math.sin(angle);

  return {
    latitude: location.latitude + deltaLatitude,
    longitude: location.longitude + deltaLongitude,
  };
}

// TODO(outdoor-workout-migration): 원본 앱 구현을 존중해 이 화면은
// 실제 지도/보행로/등산로 분석 없이 반경 기반 임의 목적지 + 직선 거리만으로 계획 생성을 시작해요.
// 추후 지도 라우팅 엔진이 들어오면 목적지 선정과 route geometry 생성을 모두 서버/지도 API 기반으로 교체해야 해요.

// TODO(outdoor-workout-migration): GPS 운동 추적은 아직 붙지 않았어요.
// 따라서 이 화면은 "실시간 야외 활동 측정"이 아니라 "AI 야외운동 계획 시작점 설정" 역할만 해요.

const styles = StyleSheet.create({
  analyzeButton: {
    marginTop: 24,
  },
  centeredContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  chip: {
    ...iosShadowLight,
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipActive: {
    backgroundColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  chipTextActive: {
    color: Colors.white,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  controlCard: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 24,
    marginHorizontal: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    backgroundColor: Colors.divider,
    height: StyleSheet.hairlineWidth,
    marginTop: 20,
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
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
  inlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  locationDot: {
    color: Colors.accent,
    fontSize: 12,
  },
  locationName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginHorizontal: 18,
    marginTop: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  radiusGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  resetChip: {
    backgroundColor: Colors.card,
    borderColor: Colors.divider,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resetChipText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    marginBottom: 10,
  },
  sectionMargin: {
    marginTop: 18,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 10,
  },
  tipLink: {
    alignSelf: 'flex-start',
  },
  tipLinkText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  tipRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  tipText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  tipTextGroup: {
    flex: 1,
    gap: 8,
  },
  toggleRoot: {
    height: 32,
    width: 51,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
  },
  toggleSubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  toggleSubtitleActive: {
    color: Colors.accent,
  },
  toggleTextGroup: {
    flex: 1,
    gap: 4,
  },
  toggleThumb: {
    backgroundColor: Colors.white,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  toggleTrack: {
    borderRadius: 16,
    height: 32,
    width: 51,
  },
});
