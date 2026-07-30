import { useNavigation } from '@granite-js/react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
  SemanticIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { useCreateAnalysisRecord } from '../api/analysis-records';
import { useAnalyzeBody } from '../api/body-analysis';
import { buildBodyAnalysisRecordPayload } from '../lib/analysis-record-payload';
import { toBodyAnalysisResult } from '../lib/object-access';
import { type PickedImage, pickSingleImage } from '../lib/pick-image';
import { useBodyAnalysisEntryStore } from '../stores/use-body-analysis-entry-store';
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
      <OriginalAppIcon
        color={color}
        name={tone === 'success' ? 'checkmarkCircle' : 'footsteps'}
        size={tone === 'success' ? 16 : 14}
      />
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
        style={[styles.pickButton, { backgroundColor: accentColor }]}
      >
        <OriginalAppIcon color={Colors.white} name="camera" size={22} />
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
        <OriginalAppIcon color={accentColor} name="images" size={22} />
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
      <Pressable
        hitSlop={8}
        onPress={onRemove}
        style={styles.removeImageButton}
      >
        <OriginalAppIcon color={Colors.danger} name="closeCircle" size={28} />
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
  icon,
  title,
}: {
  description: string;
  image?: PickedImage;
  onPickAlbum: () => void;
  onPickCamera: () => void;
  onRemove: () => void;
  icon: OriginalAppIconName;
  title: string;
}) {
  return (
    <View style={styles.optionalItem}>
      <View style={styles.optionalItemHeader}>
        <OriginalAppIcon color="#8B5CF6" name={icon} size={16} />
        <Text style={styles.optionalItemTitle}>{title} 사진</Text>
        {image ? (
          <OriginalAppIcon
            color={Colors.success}
            name="checkmarkCircle"
            size={16}
          />
        ) : null}
      </View>

      {image ? (
        <View style={styles.optionalPreviewWrap}>
          <Image
            resizeMode="cover"
            source={{ uri: image.uri }}
            style={styles.optionalPreviewImage}
          />
          <Pressable
            hitSlop={8}
            onPress={onRemove}
            style={styles.optionalRemove}
          >
            <OriginalAppIcon
              color={Colors.danger}
              name="closeCircle"
              size={22}
            />
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.optionalDescription}>{description}</Text>
          <View style={styles.optionalActionRow}>
            <Pressable
              onPress={onPickCamera}
              style={styles.optionalActionButton}
            >
              <OriginalAppIcon color={Colors.white} name="camera" size={16} />
            </Pressable>
            <Pressable
              onPress={onPickAlbum}
              style={[
                styles.optionalActionButton,
                styles.optionalActionButtonOutline,
              ]}
            >
              <OriginalAppIcon color="#8B5CF6" name="images" size={16} />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

export function BodyAnalysisScreen({
  contentBottomInset,
}: {
  contentBottomInset: number;
}) {
  const navigation = useNavigation();
  const analyzeBody = useAnalyzeBody();
  const createAnalysisRecord = useCreateAnalysisRecord();
  const consumeEntryPoint = useBodyAnalysisEntryStore(
    (state) => state.consumeEntryPoint,
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const shoeAutoScrollDoneRef = useRef(false);
  const [images, setImages] = useState<PickedImages>({});
  const [height, setHeight] = useState('');
  const [medicalSymptoms, setMedicalSymptoms] = useState('');
  const [multiViewOpen, setMultiViewOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [screenMode, setScreenMode] = useState<'default' | 'shoe'>('default');
  const [shoeSectionOffset, setShoeSectionOffset] = useState<number | null>(
    null,
  );
  const [result, setResult] = useState<ReturnType<
    typeof toBodyAnalysisResult
  > | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [recordSave, setRecordSave] = useState<{
    message?: string;
    recordId?: string;
    status: 'failed' | 'saved';
  } | null>(null);

  useEffect(() => {
    setScreenMode(consumeEntryPoint());
  }, [consumeEntryPoint]);

  useEffect(() => {
    if (
      screenMode !== 'shoe' ||
      shoeAutoScrollDoneRef.current ||
      shoeSectionOffset === null
    ) {
      return;
    }

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        animated: false,
        y: Math.max(shoeSectionOffset - 12, 0),
      });
      shoeAutoScrollDoneRef.current = true;
    });
  }, [screenMode, shoeSectionOffset]);

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

  const handleRetryRecordSave = async () => {
    if (!result || !analyzedAt) {
      return;
    }

    try {
      await createAnalysisRecord.mutateAsync(
        buildBodyAnalysisRecordPayload(analyzedAt, result),
      );
      setRecordSave({
        status: 'saved',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '분석 기록 저장에 실패했어요.';
      Alert.alert('저장 실패', message);
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

  const multiViewCount =
    Number(Boolean(images.side)) +
    Number(Boolean(images.back)) +
    Number(Boolean(images.squat));
  const analyzeButtonLabel =
    multiViewCount > 0
      ? `AI 다중 각도 분석 (${multiViewCount + 1}장)`
      : images.shoe?.base64
        ? 'AI 체형 + 걸음걸이 분석'
        : 'AI 분석 시작';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SemanticIcon color={Colors.text} name="chevronLeft" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {screenMode === 'shoe' ? 'AI 신발 추천' : 'AI 체형 분석'}
        </Text>
        <Pressable
          accessibilityLabel="체형 분석 기록"
          onPress={() =>
            navigation.navigate({ name: '/analysis-history', params: {} })
          }
          style={styles.backButton}
          testID="history-btn"
        >
          <OriginalAppIcon color={Colors.accent} name="timeOutline" size={24} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: contentBottomInset }}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {!result ? (
          <>
            <View style={styles.infoCard}>
              <OriginalAppIcon
                color={screenMode === 'shoe' ? Colors.info : Colors.accent}
                name={screenMode === 'shoe' ? 'shoePrint' : 'humanHandsUp'}
                size={32}
              />
              <Text style={styles.infoTitle}>
                {screenMode === 'shoe' ? 'AI 신발 추천' : 'AI 체형 분석'}
              </Text>
              <Text style={styles.infoDescription}>
                {screenMode === 'shoe'
                  ? '전신 사진과 신발 밑창 사진을 함께 선택하면\nAI가 보행 패턴을 분석하고\n맞춤 신발을 추천합니다'
                  : '전신 사진을 촬영하거나 선택하면\nAI가 체형, 자세, 비율을 분석하고\n미래 변화를 예측합니다'}
              </Text>
              <View style={styles.tipList}>
                <TipRow text="전신이 보이는 정면 사진" />
                <TipRow text="몸에 맞는 옷 착용 권장" />
                <TipRow text="밝고 균일한 조명" />
                <TipRow text="단색 배경 권장" />
              </View>
            </View>

            <View style={styles.contextBanner}>
              <OriginalAppIcon
                color={Colors.success}
                name="fitness"
                size={18}
              />
              <Text style={styles.contextBannerText}>
                최근 운동 기록을 함께 참고해 분석해요
              </Text>
            </View>

            <View style={styles.photoSection}>
              <View style={styles.photoSectionTitleRow}>
                <OriginalAppIcon color={Colors.accent} name="human" size={18} />
                <Text style={styles.photoSectionTitle}>전신 사진 (필수)</Text>
              </View>
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

            <View style={styles.photoSection}>
              <Pressable
                onPress={() => setMultiViewOpen((previous) => !previous)}
                style={styles.expandableHeader}
              >
                <View style={styles.expandableHeaderLeft}>
                  <OriginalAppIcon
                    color="#8B5CF6"
                    name="humanMaleBoard"
                    size={18}
                  />
                  <Text style={styles.expandableHeaderTitle}>
                    다중 각도 촬영 (선택)
                  </Text>
                  {multiViewCount > 0 ? (
                    <View style={styles.multiViewBadge}>
                      <Text style={styles.multiViewBadgeText}>
                        {multiViewCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {multiViewOpen ? (
                  <SemanticIcon
                    color={Colors.textMuted}
                    name="chevronUp"
                    size={20}
                  />
                ) : (
                  <SemanticIcon
                    color={Colors.textMuted}
                    name="chevronDown"
                    size={20}
                  />
                )}
              </Pressable>

              {!multiViewOpen && multiViewCount === 0 ? (
                <Text style={styles.photoSectionDescription}>
                  측면/후면/스쿼트 사진을 추가하면 더 정확한 자세 분석이
                  가능합니다
                </Text>
              ) : null}

              {multiViewOpen ? (
                <View style={styles.optionalGrid}>
                  <OptionalPhotoItem
                    description="옆에서 전신이 보이도록"
                    image={images.side}
                    icon="humanMaleHeight"
                    onPickAlbum={() =>
                      void handlePickImage({ target: 'side', useCamera: false })
                    }
                    onPickCamera={() =>
                      void handlePickImage({ target: 'side', useCamera: true })
                    }
                    onRemove={() =>
                      setImages((previous) => ({
                        ...previous,
                        side: undefined,
                      }))
                    }
                    title="측면"
                  />
                  <OptionalPhotoItem
                    description="등이 보이도록 뒤에서"
                    image={images.back}
                    icon="human"
                    onPickAlbum={() =>
                      void handlePickImage({ target: 'back', useCamera: false })
                    }
                    onPickCamera={() =>
                      void handlePickImage({ target: 'back', useCamera: true })
                    }
                    onRemove={() =>
                      setImages((previous) => ({
                        ...previous,
                        back: undefined,
                      }))
                    }
                    title="후면"
                  />
                  <OptionalPhotoItem
                    description="스쿼트 자세로 정면에서"
                    image={images.squat}
                    icon="humanHandsDown"
                    onPickAlbum={() =>
                      void handlePickImage({
                        target: 'squat',
                        useCamera: false,
                      })
                    }
                    onPickCamera={() =>
                      void handlePickImage({ target: 'squat', useCamera: true })
                    }
                    onRemove={() =>
                      setImages((previous) => ({
                        ...previous,
                        squat: undefined,
                      }))
                    }
                    title="스쿼트"
                  />
                </View>
              ) : null}
            </View>

            <View
              onLayout={(event) => {
                setShoeSectionOffset(event.nativeEvent.layout.y);
              }}
              style={styles.photoSection}
            >
              <View style={styles.photoSectionTitleRow}>
                <OriginalAppIcon
                  color={Colors.info}
                  name="shoePrint"
                  size={18}
                />
                <Text style={styles.photoSectionTitle}>
                  신발 밑창 사진 (선택)
                </Text>
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
                  <TipRow
                    text="자주 신는 신발의 밑창을 촬영하세요"
                    tone="muted"
                  />
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

            <View style={styles.heightInput}>
              <Text style={styles.heightLabel}>키 입력 (선택사항)</Text>
              <View style={styles.heightRow}>
                <TextInput
                  keyboardType="numeric"
                  maxLength={3}
                  onChangeText={setHeight}
                  placeholder="170"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.heightField}
                  value={height}
                />
                <Text style={styles.heightUnit}>cm</Text>
              </View>
            </View>

            <View style={styles.medicalInput}>
              <View style={styles.medicalLabelRow}>
                <OriginalAppIcon
                  color={Colors.danger}
                  name="medicalBag"
                  size={16}
                />
                <Text style={styles.medicalLabel}>
                  의료 증상 입력 (선택사항)
                </Text>
              </View>
              <Text style={styles.medicalHint}>
                현재 겪고 있는 통증, 질환, 부상 이력 등을 입력하면 의료적 관점의
                분석이 추가돼요
              </Text>
              <TextInput
                multiline
                numberOfLines={3}
                onChangeText={setMedicalSymptoms}
                placeholder="예: 허리디스크, 오른쪽 무릎 통증, 거북목, 라운드숄더, 족저근막염 등"
                placeholderTextColor={Colors.textMuted}
                style={styles.medicalField}
                textAlignVertical="top"
                value={medicalSymptoms}
              />
              {medicalSymptoms.trim().length > 0 ? (
                <View style={styles.medicalWarning}>
                  <OriginalAppIcon
                    color={Colors.warning}
                    name="informationCircle"
                    size={14}
                  />
                  <Text style={styles.medicalWarningText}>
                    AI 분석은 참고용이며 전문 의료 진단을 대체할 수 없어요
                  </Text>
                </View>
              ) : null}
            </View>

            <Pressable
              disabled={!images.front?.base64 || analyzeBody.isPending}
              onPress={() => void handleAnalyze()}
              testID="analyze-btn"
              style={[
                styles.analyzeButton,
                (!images.front?.base64 || analyzeBody.isPending) &&
                  styles.analyzeButtonDisabled,
              ]}
            >
              {analyzeBody.isPending ? (
                <>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={styles.analyzeButtonText}>AI 분석 중...</Text>
                </>
              ) : (
                <>
                  <OriginalAppIcon
                    color={Colors.white}
                    name="brain"
                    size={20}
                  />
                  <Text style={styles.analyzeButtonText}>
                    {analyzeButtonLabel}
                  </Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <AnalysisRecordSaveBanner
              failedFallbackMessage="분석 결과는 생성됐지만 기록 저장에 실패했어요."
              onActionPress={
                recordSave?.status === 'failed'
                  ? () => void handleRetryRecordSave()
                  : undefined
              }
              pending={createAnalysisRecord.isPending}
              successMessage="분석 결과를 기록에 저장했어요."
              actionLabel="기록 저장 다시 시도"
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
              <OriginalAppIcon color={Colors.accent} name="refresh" size={20} />
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
    gap: 12,
  },
  analyzeButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    height: 52,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
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
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  contextBannerText: {
    color: '#065F46',
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  expandableHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  expandableHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  expandableHeaderTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
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
  infoTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    marginTop: 12,
  },
  heightField: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    height: 44,
    paddingHorizontal: 12,
  },
  heightInput: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  heightLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    marginBottom: 6,
  },
  heightRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  heightUnit: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  medicalField: {
    backgroundColor: Colors.background,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    minHeight: 72,
    padding: 12,
    textAlignVertical: 'top',
  },
  medicalHint: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  medicalInput: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  medicalLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  medicalLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  medicalWarning: {
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    padding: 10,
  },
  medicalWarningText: {
    color: Colors.warning,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  multiViewBadge: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  multiViewBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  optionalActionButton: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionalActionButtonOutline: {
    backgroundColor: Colors.white,
    borderColor: '#8B5CF6',
    borderWidth: 1,
  },
  optionalActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionalDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    marginBottom: 8,
  },
  optionalGrid: {
    gap: 12,
    marginTop: 12,
  },
  optionalItem: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 12,
  },
  optionalItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  optionalItemTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  optionalPreviewImage: {
    borderRadius: 8,
    height: 80,
    width: 60,
  },
  optionalPreviewWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    position: 'relative',
  },
  optionalRemove: {
    position: 'absolute',
    right: -8,
    top: -8,
  },
  photoSection: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  photoSectionDescription: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    marginBottom: 12,
  },
  photoSectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },
  photoSectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  pickButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 44,
    justifyContent: 'center',
  },
  pickButtonSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1,
  },
  pickButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  previewCard: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    height: 300,
    width: '100%',
  },
  previewImageSmall: {
    height: 200,
    width: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.card,
    borderColor: Colors.accent,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  retryButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
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
