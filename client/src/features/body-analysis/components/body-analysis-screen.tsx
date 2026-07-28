import { useNavigation } from '@granite-js/react-native';
import {
  ArrowLeft,
  Footprints,
  GitCompareArrows,
  History,
  ScanFace,
  Sparkles,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors, { iosShadow } from 'shared/constants/colors';
import { useAnalyzeBody } from '../api/body-analysis';
import { pickSingleImage, type PickedImage } from '../lib/pick-image';
import { toBodyAnalysisResult } from '../lib/object-access';
import { AnalysisRecordSaveBanner } from './analysis-record-save-banner';
import { BodyAnalysisResultView } from './body-analysis-result';
import { BodyComparisonSection } from './body-comparison-section';
import { PhotoCard } from './photo-card';

type ImageTarget = 'back' | 'front' | 'side' | 'squat';
type PickedImages = Partial<Record<ImageTarget, PickedImage>>;

function CircleIcon({
  backgroundColor = Colors.surfaceMuted,
  children,
  size = 36,
}: {
  backgroundColor?: string;
  children: ReactNode;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.circleIcon,
        { backgroundColor, borderRadius: size / 2, height: size, width: size },
      ]}
    >
      {children}
    </View>
  );
}

export function BodyAnalysisScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const analyzeBody = useAnalyzeBody();
  const [images, setImages] = useState<PickedImages>({});
  const [height, setHeight] = useState('');
  const [medicalSymptoms, setMedicalSymptoms] = useState('');
  const [result, setResult] = useState<ReturnType<typeof toBodyAnalysisResult> | null>(
    null,
  );
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [recordSave, setRecordSave] = useState<{
    message?: string;
    recordId?: string;
    status: 'failed' | 'saved';
  } | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const handlePickImage = async ({
    target,
    useCamera,
  }: {
    target: ImageTarget;
    useCamera: boolean;
  }) => {
    try {
      const pickedImage = await pickSingleImage({ useCamera });

      if (!pickedImage) {
        return;
      }

      setImages((previous) => ({
        ...previous,
        [target]: pickedImage,
      }));
      setResult(null);
      setAnalyzedAt(null);
      setRecordSave(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '사진을 가져오지 못했어요.';
      Alert.alert('사진 선택 실패', message);
    }
  };

  const handleAnalyze = async () => {
    if (!images.front?.base64) {
      Alert.alert('전신 사진 필요', '정면 전신 사진을 먼저 선택해 주세요.');
      return;
    }

    try {
      const response = await analyzeBody.mutateAsync({
        backImageBase64: images.back?.base64,
        height: height.trim() ? Number(height.trim()) : undefined,
        imageBase64: images.front.base64,
        medicalSymptoms: medicalSymptoms.trim() || undefined,
        sideImageBase64: images.side?.base64,
        squatImageBase64: images.squat?.base64,
      });

      setResult(toBodyAnalysisResult(response.analysis));
      setAnalyzedAt(response.analyzedAt);
      setRecordSave(response.recordSave);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '체형 분석 요청에 실패했어요.';
      Alert.alert('분석 실패', message);
    }
  };

  const multiViewCount = ['side', 'back', 'squat'].filter(
    (key) => images[key as ImageTarget],
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 24 + insets.bottom,
          paddingHorizontal: 16,
          paddingTop: Platform.OS === 'web' ? 24 : insets.top + 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft color={Colors.text} size={22} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>AI 체형 분석</Text>
          <Pressable
            onPress={() =>
              navigation.navigate({ name: '/analysis-history', params: {} })
            }
            style={styles.iconButton}
          >
            <History color={Colors.accent} size={18} strokeWidth={2.1} />
          </Pressable>
        </View>

        <View style={[styles.heroCard, iosShadow]}>
          <CircleIcon backgroundColor={Colors.accentLight} size={56}>
            <ScanFace color={Colors.accent} size={24} strokeWidth={2.1} />
          </CircleIcon>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>체형 타입 분석 및 체형 변화 예측</Text>
            <Text style={styles.heroDescription}>
              원본 앱처럼 전신 사진을 기반으로 체형 타입, 비율, 자세를 함께
              분석해요.
            </Text>
          </View>
        </View>

        <View style={[styles.featureRowCard, iosShadow]}>
          <Pressable
            onPress={() =>
              navigation.navigate({ name: '/analysis-history', params: {} })
            }
            style={styles.featureShortcut}
          >
            <CircleIcon backgroundColor="#EAF0FF">
              <History color={Colors.info} size={16} strokeWidth={2.1} />
            </CircleIcon>
            <Text style={styles.featureShortcutLabel}>분석 기록</Text>
          </Pressable>
          <Pressable
            onPress={() => setComparisonOpen((previous) => !previous)}
            style={styles.featureShortcut}
          >
            <CircleIcon backgroundColor="#ECFDF5">
              <GitCompareArrows
                color="#10B981"
                size={16}
                strokeWidth={2.1}
              />
            </CircleIcon>
            <Text style={styles.featureShortcutLabel}>전·후 비교</Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('AI 신발 추천', '준비 중입니다.')}
            style={styles.featureShortcut}
          >
            <CircleIcon>
              <Footprints color={Colors.textMuted} size={16} strokeWidth={2.1} />
            </CircleIcon>
            <View style={styles.featureShortcutBadgeLabel}>
              <Text style={styles.featureShortcutLabel}>신발 추천</Text>
              <UnimplementedBadge compact />
            </View>
          </Pressable>
        </View>

        <BodyComparisonSection
          heightValue={height}
          onOpenChange={setComparisonOpen}
          open={comparisonOpen}
        />

        <PhotoCard
          image={images.front}
          onPickAlbum={() =>
            void handlePickImage({ target: 'front', useCamera: false })
          }
          onPickCamera={() =>
            void handlePickImage({ target: 'front', useCamera: true })
          }
          onRemove={() =>
            setImages((previous) => ({ ...previous, front: undefined }))
          }
          required
          title="정면 전신 사진"
        />

        <View style={[styles.card, iosShadow]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>다각도 추가 사진</Text>
            <Text style={styles.sectionSubtitle}>{multiViewCount}/3 선택됨</Text>
          </View>
          <Text style={styles.helperText}>
            원본처럼 측면, 후면, 스쿼트 사진을 추가하면 자세 분석 정확도를 더
            높일 수 있어요.
          </Text>
          <View style={styles.optionalPhotoGrid}>
            <PhotoCard
              image={images.side}
              onPickAlbum={() =>
                void handlePickImage({ target: 'side', useCamera: false })
              }
              onPickCamera={() =>
                void handlePickImage({ target: 'side', useCamera: true })
              }
              onRemove={() =>
                setImages((previous) => ({ ...previous, side: undefined }))
              }
              title="측면"
            />
            <PhotoCard
              image={images.back}
              onPickAlbum={() =>
                void handlePickImage({ target: 'back', useCamera: false })
              }
              onPickCamera={() =>
                void handlePickImage({ target: 'back', useCamera: true })
              }
              onRemove={() =>
                setImages((previous) => ({ ...previous, back: undefined }))
              }
              title="후면"
            />
            <PhotoCard
              image={images.squat}
              onPickAlbum={() =>
                void handlePickImage({ target: 'squat', useCamera: false })
              }
              onPickCamera={() =>
                void handlePickImage({ target: 'squat', useCamera: true })
              }
              onRemove={() =>
                setImages((previous) => ({ ...previous, squat: undefined }))
              }
              title="스쿼트"
            />
          </View>
        </View>

        <View style={[styles.card, iosShadow]}>
          <Text style={styles.sectionTitle}>추가 입력</Text>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>키 (cm)</Text>
            <TextInput
              inputMode="numeric"
              onChangeText={setHeight}
              placeholder="예: 175"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              value={height}
            />
          </View>
          <View style={styles.inputBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.inputLabel}>증상 / 불편감</Text>
              <UnimplementedBadge compact />
            </View>
            <TextInput
              multiline
              onChangeText={setMedicalSymptoms}
              placeholder="예: 허리가 자주 뻐근해요, 어깨가 말려 보여요"
              placeholderTextColor={Colors.textMuted}
              style={[styles.input, styles.textArea]}
              value={medicalSymptoms}
            />
            <Text style={styles.helperText}>
              원본처럼 참고용 의료 분석 입력은 남겨두되, 현재 앱에서도 진단이
              아니라 참고 정보로만 다뤄요.
            </Text>
          </View>
        </View>

        <Pressable
          disabled={!images.front || analyzeBody.isPending}
          onPress={() => void handleAnalyze()}
          style={[
            styles.analyzeButton,
            (!images.front || analyzeBody.isPending) && styles.analyzeButtonDisabled,
          ]}
        >
          <Sparkles color={Colors.white} size={16} strokeWidth={2.1} />
          <Text style={styles.analyzeButtonText}>
            {analyzeBody.isPending ? 'AI가 체형을 분석 중이에요...' : 'AI 체형 분석 시작'}
          </Text>
        </Pressable>

        <AnalysisRecordSaveBanner
          failedFallbackMessage="분석 결과는 생성됐지만 기록 저장에 실패했어요."
          successMessage="분석 결과를 기록에 저장했어요."
          value={recordSave}
        />

        {analyzedAt ? (
          <Text style={styles.analyzedAtText}>
            분석 시각 {new Date(analyzedAt).toLocaleString('ko-KR')}
          </Text>
        ) : null}

        {result ? (
          <BodyAnalysisResultView
            result={result}
            showFutureAsUnimplemented={false}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  analyzeButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  analyzeButtonDisabled: {
    opacity: 0.55,
  },
  analyzeButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  analyzedAtText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    textAlign: 'right',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  circleIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  featureRowCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  featureShortcut: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 72,
    padding: 10,
  },
  featureShortcutBadgeLabel: {
    alignItems: 'center',
    gap: 4,
  },
  featureShortcutLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  headerTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  helperText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  heroDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  heroTextWrap: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  input: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputBlock: {
    gap: 8,
  },
  inputLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  optionalPhotoGrid: {
    gap: 12,
  },
  requiredBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  requiredBadgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeaderTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionSubtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  textArea: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
