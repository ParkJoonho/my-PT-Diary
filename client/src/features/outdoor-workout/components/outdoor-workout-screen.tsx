import { useNavigation } from '@granite-js/react-native';
import { useAnalysisRecords } from 'features/body-analysis/api/analysis-records';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Suspense } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type {
  AnalysisRecordDto,
  CreateOutdoorWorkoutPlanDto,
} from 'shared/api/generated/models';
import { AsyncErrorBoundary } from 'shared/components/async-state';
import {
  AIInfoIcon,
  OriginalAppIcon,
  SemanticIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { useCreateOutdoorWorkoutPlan } from '../api/outdoor-workout';
import { calculateDistanceKilometers } from '../lib/calculate-distance';
import { fetchElevationData } from '../lib/fetch-elevation-data';
import { generateRoutePoints } from '../lib/generate-route-points';
import {
  getCurrentLocation,
  getLocationDisplayName,
} from '../lib/get-current-location';
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

type OutdoorWorkoutScreenProps = {
  contentBottomInset: number;
};

export function OutdoorWorkoutScreen({
  contentBottomInset,
}: OutdoorWorkoutScreenProps) {
  const navigation = useNavigation();
  const createOutdoorWorkoutPlan = useCreateOutdoorWorkoutPlan();
  const setPlanResult = useOutdoorWorkoutStore((state) => state.setPlanResult);
  const [location, setLocation] = useState<OutdoorWorkoutLocation | null>(null);
  const [locationName, setLocationName] = useState('내 위치');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState<OutdoorWorkoutRadius>(1);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [autoDestinationEnabled, setAutoDestinationEnabled] = useState(false);
  const [workoutMode, setWorkoutMode] = useState<OutdoorWorkoutMode>('walking');
  const [bodyAnalysis, setBodyAnalysis] = useState<AnalysisRecordDto | null>(
    null,
  );

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
    const distance = (0.3 + Math.random() * 0.7) * Number(selectedRadius);
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
    const target = activeDestination ?? {
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
        bodyAnalysis: bodyAnalysis
          ? {
              qualitativeData: bodyAnalysis.qualitativeData,
              quantitativeData: bodyAnalysis.quantitativeData,
            }
          : undefined,
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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>야외운동</Text>

        <View style={styles.locationRow}>
          <OutdoorLocationIcon />
          <Text style={styles.locationName}>{locationName}</Text>
          <Pressable onPress={requestLocation} style={styles.resetChip}>
            <OriginalAppIcon
              color={Colors.textSecondary}
              name="refresh"
              size={12}
            />
            <Text style={styles.resetChipText}>재설정</Text>
          </Pressable>
        </View>

        <View style={styles.controlCard}>
          <Text style={styles.sectionLabel}>운동 선택</Text>
          <View style={styles.insetControl}>
            <InsetSegment
              active={workoutMode === 'walking'}
              label="걷기/러닝"
              onPress={() => setWorkoutMode('walking')}
              testID="mode-walking"
            />
            <InsetSegment
              active={workoutMode === 'hiking'}
              label="등산"
              onPress={() => setWorkoutMode('hiking')}
              testID="mode-hiking"
            />
          </View>

          <Text style={[styles.sectionLabel, styles.sectionMargin]}>
            거리 선택
          </Text>
          <View style={styles.insetControl}>
            {[1, 2, 3].map((radius) => (
              <InsetSegment
                active={selectedRadius === radius}
                key={radius}
                label={`${radius}km`}
                onPress={() =>
                  setSelectedRadius(radius as OutdoorWorkoutRadius)
                }
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
            <AsyncErrorBoundary message="체형 분석 정보를 불러오지 못했어요.">
              <Suspense fallback={<BodyAnalysisTipLoading />}>
                <BodyAnalysisTip
                  onBodyAnalysisChange={setBodyAnalysis}
                  onOpenAnalysis={() =>
                    navigation.navigate({ name: '/ai-analysis', params: {} })
                  }
                />
              </Suspense>
            </AsyncErrorBoundary>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InsetSegment({
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
      style={[styles.insetSegment, active ? styles.insetSegmentActive : null]}
      testID={testID}
    >
      <Text
        style={[
          styles.insetSegmentText,
          active ? styles.insetSegmentTextActive : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BodyAnalysisTip({
  onBodyAnalysisChange,
  onOpenAnalysis,
}: {
  onBodyAnalysisChange: (record: AnalysisRecordDto | null) => void;
  onOpenAnalysis: () => void;
}) {
  const { data } = useAnalysisRecords({ type: 'body' });
  const record = data[0] ?? null;

  useEffect(() => {
    onBodyAnalysisChange(record);
  }, [onBodyAnalysisChange, record]);

  const bodyType = getOptionalString(record?.qualitativeData?.bodyType);
  const bodyTypeDescription = getOptionalString(
    record?.qualitativeData?.bodyTypeDescription,
  );

  if (record && bodyType) {
    return (
      <Text style={styles.tipText}>
        {`AI 체형 분석 결과 ${
          bodyTypeDescription?.split(' ')[0] ?? ''
        }(${bodyType}) 체형에 가까워요. 코스 설계에 반영할게요.`}
      </Text>
    );
  }

  return (
    <View style={styles.tipTextGroup}>
      <Text style={styles.tipText}>
        AI 체형 분석 시 내 체형에 맞춰 코스를 설계해요.
      </Text>
      <Pressable onPress={onOpenAnalysis} style={styles.tipLink}>
        <Text style={styles.tipLinkText}>내 체형 분석하기</Text>
        <View style={styles.tipLinkIcon}>
          <SemanticIcon color={Colors.accent} name="chevronRight" size={12} />
        </View>
      </Pressable>
    </View>
  );
}

function BodyAnalysisTipLoading() {
  return (
    <View style={styles.tipTextGroup}>
      <Text style={styles.tipText}>체형 분석 정보를 확인하고 있어요.</Text>
    </View>
  );
}

function OutdoorLocationIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        clipRule="evenodd"
        d="M9.77386 10.7847c-.80801 0-1.55465-.431-1.95866-1.1308-.40401-.69976-.40401-1.5619 0-2.26167.40401-.69976 1.15065-1.13083 1.95866-1.13083 1.24904 0 2.26164 1.01258 2.26164 2.26167 0 1.24908-1.0126 2.26163-2.26164 2.26163ZM8.00219 1.03057C4.44386 1.82473 1.94886 5.1739 2.08886 8.81723c.11 2.86167 1.865 5.42167 7.09 10.44417.33.3167.85914.3183 1.18834.0008 5.4042-5.1941 7.0967-7.7541 7.0967-10.73913 0-4.825-4.4434-8.6125-9.46171-7.4925Z"
        fill={Colors.accent}
        fillRule="evenodd"
      />
    </Svg>
  );
}

function getOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

const outdoorCardShadow =
  Platform.OS === 'web'
    ? { boxShadow: 'rgba(0,0,0,0.05) 0px 0px 1px' }
    : {
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      };

const outdoorSegmentShadow =
  Platform.OS === 'web'
    ? { boxShadow: 'rgba(0,0,0,0.06) 0px 1px 3px' }
    : {
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      };

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
  insetControl: {
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    height: 44,
    padding: 3,
  },
  insetSegment: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  insetSegmentActive: {
    ...outdoorSegmentShadow,
    backgroundColor: Colors.white,
  },
  insetSegmentText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  insetSegmentTextActive: {
    color: Colors.text,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  controlCard: {
    ...outdoorCardShadow,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    backgroundColor: '#F0F2F5',
    height: 1,
    marginHorizontal: 8,
    marginTop: 24,
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
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
  locationName: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  resetChip: {
    backgroundColor: Colors.card,
    borderColor: '#E0E3E8',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginLeft: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  resetChipText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  scrollContent: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    marginBottom: 8,
  },
  sectionMargin: {
    marginTop: 16,
  },
  tipLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 2,
  },
  tipLinkIcon: {
    height: 16,
    justifyContent: 'center',
  },
  tipLinkText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    includeFontPadding: false,
    lineHeight: 16,
    textAlignVertical: 'center',
  },
  tipRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    paddingTop: 24,
  },
  tipText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  tipTextGroup: {
    flex: 1,
    gap: 10,
  },
  toggleRoot: {
    height: 32,
    width: 51,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 16,
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
  pageTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
    marginBottom: 4,
  },
});
