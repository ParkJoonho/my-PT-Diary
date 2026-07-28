import { useNavigation } from '@granite-js/react-native';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Footprints,
  History,
  ScanFace,
  Sparkles,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { iosShadow } from 'shared/constants/colors';
import { useAnalyzeBody } from '../api/body-analysis';
import { pickSingleImage, type PickedImage } from '../lib/pick-image';
import { toBodyAnalysisResult } from '../lib/object-access';
import { AnalysisRecordSaveBanner } from './analysis-record-save-banner';
import { BodyAnalysisResultView } from './body-analysis-result';
import { BodyComparisonSection } from './body-comparison-section';

type ImageTarget = 'back' | 'front' | 'shoe' | 'side' | 'squat';
type PickedImages = Partial<Record<ImageTarget, PickedImage>>;

function TipRow({
  text,
  tone = 'success',
}: {
  text: string;
  tone?: 'muted' | 'success';
}) {
  const color = tone === 'success' ? Colors.success : Colors.textMuted;

  return (
    <View style={styles.tipItem}>
      <CheckCircle2 color={color} size={15} strokeWidth={2.1} />
      <Text
        style={[
          styles.tipText,
          tone === 'muted' ? styles.tipTextMuted : undefined,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function SectionActionRow({
  accentColor,
  onPickAlbum,
  onPickCamera,
}: {
  accentColor: string;
  onPickAlbum: () => void;
  onPickCamera: () => void;
}) {
  return (
    <View style={styles.actionRow}>
      <Pressable
        onPress={onPickCamera}
        style={[
          styles.pickButton,
          { backgroundColor: accentColor, borderColor: accentColor },
        ]}
      >
        <Camera color={Colors.white} size={20} strokeWidth={2.1} />
        <Text style={styles.pickButtonText}>카메라</Text>
      </Pressable>
      <Pressable
        onPress={onPickAlbum}
        style={[
          styles.pickButton,
          styles.pickButtonSecondary,
          { borderColor: accentColor },
        ]}
      >
        <FolderOpen color={accentColor} size={20} strokeWidth={2.1} />
        <Text style={[styles.pickButtonText, { color: accentColor }]}>
          갤러리
        </Text>
      </Pressable>
    </View>
  );
}

function ImagePreview({
  image,
  onRemove,
  small = false,
}: {
  image?: PickedImage;
  onRemove: () => void;
  small?: boolean;
}) {
  if (!image) {
    return null;
  }

  return (
    <View style={styles.previewCard}>
      <Image
        resizeMode="contain"
        source={{ uri: image.uri }}
        style={small ? styles.previewImageSmall : styles.previewImage}
      />
      <Pressable hitSlop={8} onPress={onRemove} style={styles.removeImageButton}>
        <X color={Colors.danger} size={24} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function OptionalPhotoItem({
  description,
  image,
  onPickAlbum,
  onPickCamera,
  onRemove,
  title,
}: {
  description: string;
  image?: PickedImage;
  onPickAlbum: () => void;
  onPickCamera: () => void;
  onRemove: () => void;
  title: string;
}) {
  return (
    <View style={styles.optionalItem}>
      <View style={styles.optionalItemHeader}>
        <Text style={styles.optionalItemTitle}>{title} 사진</Text>
        {image ? (
          <CheckCircle2 color={Colors.success} size={16} strokeWidth={2.1} />
        ) : null}
      </View>

      {image ? (
        <View style={styles.optionalPreviewWrap}>
          <Image
            resizeMode="cover"
            source={{ uri: image.uri }}
            style={styles.optionalPreviewImage}
          />
          <Pressable hitSlop={8} onPress={onRemove} style={styles.optionalRemove}>
            <X color={Colors.danger} size={20} strokeWidth={2.1} />
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.optionalDescription}>{description}</Text>
          <View style={styles.optionalActionRow}>
            <Pressable onPress={onPickCamera} style={styles.optionalActionButton}>
              <Camera color={Colors.white} size={15} strokeWidth={2.1} />
            </Pressable>
            <Pressable
              onPress={onPickAlbum}
              style={[styles.optionalActionButton, styles.optionalActionButtonOutline]}
            >
              <FolderOpen color="#8B5CF6" size={15} strokeWidth={2.1} />
            </Pressable>
          </View>
        </>
      )}
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
  const [multiViewOpen, setMultiViewOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof toBodyAnalysisResult> | null>(
    null,
  );
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [recordSave, setRecordSave] = useState<{
    message?: string;
    recordId?: string;
    status: 'failed' | 'saved';
  } | null>(null);

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
      Alert.alert('전신 사진 필요', '먼저 전신 사진을 선택해 주세요.');
      return;
    }

    try {
      const response = await analyzeBody.mutateAsync({
        backImageBase64: images.back?.base64,
        height: height.trim() ? Number(height.trim()) : undefined,
        imageBase64: images.front.base64,
        medicalSymptoms: medicalSymptoms.trim() || undefined,
        // TODO(body-analysis-migration): photoDate 필드는 서버에서 이미 지원하지만
        // 현재 Granite 사진 선택 래퍼는 EXIF 촬영일을 노출하지 않아요. 원본의 촬영일
        // 배지/UI를 완전히 복원하려면 native/web picker 레이어부터 확장해야 해요.
        shoeImageBase64: images.shoe?.base64,
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

  const resetAnalysis = () => {
    setImages({});
    setMultiViewOpen(false);
    setComparisonOpen(false);
    setResult(null);
    setAnalyzedAt(null);
    setRecordSave(null);
  };

  const multiViewCount = Number(Boolean(images.side))
    + Number(Boolean(images.back))
    + Number(Boolean(images.squat));
  const analyzeButtonLabel = multiViewCount > 0
    ? `AI 다중 각도 분석 (${multiViewCount + 1}장)`
    : images.shoe?.base64
      ? 'AI 체형 + 걸음걸이 분석'
      : 'AI 분석 시작';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 24 + insets.bottom,
          paddingTop: Platform.OS === 'web' ? 24 : insets.top + 14,
        }}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={Colors.text} size={22} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>AI 체형 분석</Text>
          <Pressable
            onPress={() =>
              navigation.navigate({ name: '/analysis-history', params: {} })
            }
            style={styles.backButton}
            testID="history-btn"
          >
            <History color={Colors.accent} size={22} strokeWidth={2.1} />
          </Pressable>
        </View>

        {!result ? (
          <>
            <View style={[styles.infoCard, iosShadow]}>
              <View style={styles.infoIconWrap}>
                <ScanFace color={Colors.accent} size={28} strokeWidth={2.1} />
              </View>
              <Text style={styles.infoTitle}>AI 체형 분석</Text>
              <Text style={styles.infoDescription}>
                전신 사진을 촬영하거나 선택하면{'\n'}AI가 체형, 자세, 비율을
                분석하고{'\n'}미래 변화를 예측합니다
              </Text>
              <View style={styles.tipList}>
                <TipRow text="전신이 보이는 정면 사진" />
                <TipRow text="몸에 맞는 옷 착용 권장" />
                <TipRow text="밝고 균일한 조명" />
                <TipRow text="단색 배경 권장" />
              </View>
            </View>

            <View style={styles.contextBanner}>
              <CheckCircle2 color={Colors.success} size={17} strokeWidth={2.1} />
              <Text style={styles.contextBannerText}>
                최근 운동 기록을 함께 참고해 분석해요
              </Text>
            </View>

            <View style={[styles.photoSection, iosShadow]}>
              <Text style={styles.photoSectionTitle}>전신 사진 (필수)</Text>
              <ImagePreview
                image={images.front}
                onRemove={() =>
                  setImages((previous) => ({ ...previous, front: undefined }))
                }
              />
              <SectionActionRow
                accentColor={Colors.accent}
                onPickAlbum={() =>
                  void handlePickImage({ target: 'front', useCamera: false })
                }
                onPickCamera={() =>
                  void handlePickImage({ target: 'front', useCamera: true })
                }
              />
            </View>

            <View style={[styles.photoSection, iosShadow]}>
              <Pressable
                onPress={() => setMultiViewOpen((previous) => !previous)}
                style={styles.expandableHeader}
              >
                <View style={styles.expandableHeaderLeft}>
                  <Text style={styles.photoSectionTitle}>다중 각도 촬영 (선택)</Text>
                  {multiViewCount > 0 ? (
                    <View style={styles.multiViewBadge}>
                      <Text style={styles.multiViewBadgeText}>{multiViewCount}</Text>
                    </View>
                  ) : null}
                </View>
                {multiViewOpen ? (
                  <ChevronUp color={Colors.textMuted} size={20} strokeWidth={2.1} />
                ) : (
                  <ChevronDown color={Colors.textMuted} size={20} strokeWidth={2.1} />
                )}
              </Pressable>

              {!multiViewOpen && multiViewCount === 0 ? (
                <Text style={styles.photoSectionDescription}>
                  측면/후면/스쿼트 사진을 추가하면 더 정확한 자세 분석이 가능합니다
                </Text>
              ) : null}

              {multiViewOpen ? (
                <View style={styles.optionalGrid}>
                  <OptionalPhotoItem
                    description="옆에서 전신이 보이도록"
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
                  <OptionalPhotoItem
                    description="등이 보이도록 뒤에서"
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
                  <OptionalPhotoItem
                    description="스쿼트 자세로 정면에서"
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
              ) : null}
            </View>

            <View style={[styles.photoSection, iosShadow]}>
              <View style={styles.sectionTitleRow}>
                <Footprints color={Colors.info} size={18} strokeWidth={2.1} />
                <Text style={styles.photoSectionTitle}>신발 밑창 사진 (선택)</Text>
              </View>
              <Text style={styles.photoSectionDescription}>
                신발 뒷면/밑창 사진을 추가하면 걸음걸이 분석이 포함돼요
              </Text>
              <ImagePreview
                image={images.shoe}
                onRemove={() =>
                  setImages((previous) => ({ ...previous, shoe: undefined }))
                }
                small
              />
              <SectionActionRow
                accentColor={Colors.info}
                onPickAlbum={() =>
                  void handlePickImage({ target: 'shoe', useCamera: false })
                }
                onPickCamera={() =>
                  void handlePickImage({ target: 'shoe', useCamera: true })
                }
              />
              {!images.shoe ? (
                <View style={styles.tipListMuted}>
                  <TipRow text="자주 신는 신발의 밑창을 촬영하세요" tone="muted" />
                  <TipRow
                    text="뒤꿈치 마모 부분이 잘 보이도록 촬영"
                    tone="muted"
                  />
                </View>
              ) : null}
            </View>

            <BodyComparisonSection
              heightValue={height}
              onOpenChange={setComparisonOpen}
              open={comparisonOpen}
            />

            <View style={[styles.photoSection, iosShadow]}>
              <Text style={styles.photoSectionTitle}>추가 입력</Text>
              <View style={styles.inputGroup}>
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
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>의료 증상 입력 (선택사항)</Text>
                <Text style={styles.inputHelperText}>
                  현재 겪고 있는 통증, 질환, 부상 이력 등을 입력하면 의료적
                  관점의 분석이 추가돼요
                </Text>
                <TextInput
                  multiline
                  onChangeText={setMedicalSymptoms}
                  placeholder="예: 허리디스크, 오른쪽 무릎 통증, 거북목, 라운드숄더, 족저근막염 등"
                  placeholderTextColor={Colors.textMuted}
                  style={[styles.input, styles.textArea]}
                  value={medicalSymptoms}
                />
                {medicalSymptoms.trim().length > 0 ? (
                  <View style={styles.medicalWarning}>
                    <Text style={styles.medicalWarningText}>
                      AI 분석은 참고용이며 전문 의료 진단을 대체할 수 없어요
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Pressable
              disabled={!images.front?.base64 || analyzeBody.isPending}
              onPress={() => void handleAnalyze()}
              style={[
                styles.analyzeButton,
                (!images.front?.base64 || analyzeBody.isPending) &&
                  styles.analyzeButtonDisabled,
              ]}
            >
              <Sparkles color={Colors.white} size={18} strokeWidth={2.1} />
              <Text style={styles.analyzeButtonText}>
                {analyzeBody.isPending
                  ? 'AI가 체형을 분석 중이에요...'
                  : analyzeButtonLabel}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
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

            <BodyAnalysisResultView
              result={result}
              showFutureAsUnimplemented={false}
            />

            <Pressable onPress={resetAnalysis} style={styles.retryButton}>
              <Sparkles color={Colors.accent} size={18} strokeWidth={2.1} />
              <Text style={styles.retryButtonText}>새로운 분석 시작</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  analyzeButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
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
    marginHorizontal: 16,
    marginTop: 12,
    textAlign: 'right',
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  contextBanner: {
    alignItems: 'center',
    backgroundColor: '#E8F8EE',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  contextBannerText: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  expandableHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expandableHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 24,
  },
  infoDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  infoIconWrap: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  infoTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputGroup: {
    gap: 8,
  },
  inputHelperText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  inputLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  medicalWarning: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  medicalWarningText: {
    color: Colors.warning,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  multiViewBadge: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 999,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
  },
  multiViewBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  optionalActionButton: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 46,
  },
  optionalActionButtonOutline: {
    backgroundColor: Colors.white,
    borderColor: '#8B5CF6',
    borderWidth: 1,
  },
  optionalActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  optionalDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  optionalGrid: {
    gap: 12,
  },
  optionalItem: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  optionalItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionalItemTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  optionalPreviewImage: {
    borderRadius: 12,
    height: 132,
    width: '100%',
  },
  optionalPreviewWrap: {
    position: 'relative',
  },
  optionalRemove: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  photoSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  photoSectionDescription: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  photoSectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  pickButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
  },
  pickButtonSecondary: {
    backgroundColor: Colors.white,
  },
  pickButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  previewCard: {
    marginBottom: 12,
    marginTop: 10,
    position: 'relative',
  },
  previewImage: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    height: 230,
    width: '100%',
  },
  previewImageSmall: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    height: 180,
    width: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.card,
    borderColor: Colors.accent,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    minHeight: 54,
  },
  retryButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  textArea: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  tipItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tipList: {
    alignSelf: 'stretch',
    marginTop: 16,
  },
  tipListMuted: {
    marginTop: 10,
  },
  tipText: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  tipTextMuted: {
    color: Colors.textMuted,
  },
});
