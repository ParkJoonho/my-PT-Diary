import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  OriginalAppIcon,
  SemanticIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { useCreateAnalysisRecord } from '../api/analysis-records';
import { useAnalyzeBodyComparison } from '../api/body-comparison';
import { buildBodyComparisonRecordPayload } from '../lib/analysis-record-payload';
import { toBodyComparisonResult } from '../lib/object-access';
import { type PickedImage, pickSingleImage } from '../lib/pick-image';
import { AnalysisRecordSaveBanner } from './analysis-record-save-banner';
import { BodyComparisonResultView } from './body-comparison-result';

type ComparisonImageTarget = 'after' | 'before';

type ComparisonImages = Partial<Record<ComparisonImageTarget, PickedImage>>;

function ComparisonSlot({
  accentColor,
  image,
  label,
  onPickAlbum,
  onRemove,
  shortLabel,
}: {
  accentColor: string;
  image?: PickedImage;
  label: string;
  onPickAlbum: () => void;
  onRemove: () => void;
  shortLabel: string;
}) {
  return (
    <View style={styles.slot}>
      <View style={styles.slotHeader}>
        <View style={[styles.slotBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.slotBadgeText}>{shortLabel}</Text>
        </View>
        <Text style={styles.slotLabel}>{label}</Text>
      </View>

      {image ? (
        <View style={styles.previewWrap}>
          <Image
            resizeMode="cover"
            source={{ uri: image.uri }}
            style={styles.thumb}
          />
          <Pressable hitSlop={8} onPress={onRemove} style={styles.removeButton}>
            <OriginalAppIcon
              color={Colors.danger}
              name="closeCircle"
              size={22}
            />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onPickAlbum} style={styles.placeholder}>
          <OriginalAppIcon color={accentColor} name="images" size={28} />
          <Text style={styles.placeholderText}>갤러리에서{'\n'}선택</Text>
        </Pressable>
      )}
    </View>
  );
}

export function BodyComparisonSection({
  heightValue,
  onOpenChange,
  open,
}: {
  heightValue: string;
  onOpenChange: (next: boolean) => void;
  open: boolean;
}) {
  const analyzeComparison = useAnalyzeBodyComparison();
  const createAnalysisRecord = useCreateAnalysisRecord();
  const [images, setImages] = useState<ComparisonImages>({});
  const [result, setResult] = useState<ReturnType<
    typeof toBodyComparisonResult
  > | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [recordSave, setRecordSave] = useState<{
    message?: string;
    recordId?: string;
    status: 'failed' | 'saved';
  } | null>(null);

  const selectedCount =
    Number(Boolean(images.before)) + Number(Boolean(images.after));

  const resetResultState = () => {
    setResult(null);
    setAnalyzedAt(null);
    setRecordSave(null);
  };

  const handlePickImage = async ({
    target,
    useCamera,
  }: {
    target: ComparisonImageTarget;
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
      resetResultState();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '사진을 가져오지 못했어요.';
      Alert.alert('사진 선택 실패', message);
    }
  };

  const handleAnalyze = async () => {
    if (!images.before?.base64 || !images.after?.base64) {
      Alert.alert(
        '전·후 사진 필요',
        '전(Before)과 후(After) 사진을 모두 선택해 주세요.',
      );
      return;
    }

    try {
      const response = await analyzeComparison.mutateAsync({
        afterImageBase64: images.after.base64,
        beforeImageBase64: images.before.base64,
        height: heightValue.trim() ? Number(heightValue.trim()) : undefined,
      });

      setResult(toBodyComparisonResult(response.comparison));
      setAnalyzedAt(response.analyzedAt);
      setRecordSave(response.recordSave);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '전·후 비교 분석 요청에 실패했어요.';
      Alert.alert('비교 분석 실패', message);
    }
  };

  const handleReset = () => {
    setImages({});
    resetResultState();
    onOpenChange(false);
  };

  const handleRetryRecordSave = async () => {
    if (!result || !analyzedAt) {
      return;
    }

    try {
      await createAnalysisRecord.mutateAsync(
        buildBodyComparisonRecordPayload(analyzedAt, result),
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

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => onOpenChange(!open)}
        style={styles.toggleButton}
      >
        <View style={styles.toggleLeft}>
          <OriginalAppIcon color="#10B981" name="compare" size={18} />
          <Text style={styles.toggleTitle}>전/후 비교 분석</Text>
          {selectedCount > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selectedCount}</Text>
            </View>
          ) : null}
        </View>
        {open ? (
          <SemanticIcon color={Colors.textMuted} name="chevronUp" size={18} />
        ) : (
          <SemanticIcon color={Colors.textMuted} name="chevronDown" size={18} />
        )}
      </Pressable>

      {!open && !images.before && !images.after ? (
        <Text style={styles.collapsedDescription}>
          운동 전/후 사진을 비교하여 AI가 체형 변화를 분석합니다
        </Text>
      ) : null}

      {open && !result ? (
        <>
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonRow}>
              <ComparisonSlot
                accentColor="#6366F1"
                image={images.before}
                label="Before"
                onPickAlbum={() =>
                  void handlePickImage({ target: 'before', useCamera: false })
                }
                onRemove={() => {
                  setImages((previous) => ({ ...previous, before: undefined }));
                  resetResultState();
                }}
                shortLabel="전"
              />
              <View style={styles.arrowWrap}>
                <OriginalAppIcon
                  color={Colors.textMuted}
                  name="arrowForward"
                  size={24}
                />
              </View>
              <ComparisonSlot
                accentColor="#10B981"
                image={images.after}
                label="After"
                onPickAlbum={() =>
                  void handlePickImage({ target: 'after', useCamera: false })
                }
                onRemove={() => {
                  setImages((previous) => ({ ...previous, after: undefined }));
                  resetResultState();
                }}
                shortLabel="후"
              />
            </View>
            <Pressable
              disabled={
                !images.before?.base64 ||
                !images.after?.base64 ||
                analyzeComparison.isPending
              }
              onPress={() => void handleAnalyze()}
              style={[
                styles.analyzeButton,
                (!images.before?.base64 ||
                  !images.after?.base64 ||
                  analyzeComparison.isPending) &&
                  styles.analyzeButtonDisabled,
              ]}
            >
              {analyzeComparison.isPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <OriginalAppIcon
                  color={Colors.white}
                  name="compareHorizontal"
                  size={20}
                />
              )}
              <Text style={styles.analyzeButtonText}>
                {analyzeComparison.isPending
                  ? '비교 분석 중...'
                  : images.before?.base64 && images.after?.base64
                    ? 'AI 전/후 비교 분석'
                    : '전/후 사진을 모두 선택하세요'}
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      <AnalysisRecordSaveBanner
        actionLabel="기록 저장 다시 시도"
        failedFallbackMessage="분석 결과는 생성됐지만 기록 저장에 실패했어요."
        onActionPress={
          recordSave?.status === 'failed'
            ? () => void handleRetryRecordSave()
            : undefined
        }
        pending={createAnalysisRecord.isPending}
        successMessage="전·후 비교 분석 결과를 기록에 저장했어요."
        value={recordSave}
      />

      {analyzedAt ? (
        <Text style={styles.analyzedAtText}>
          분석 시각 {new Date(analyzedAt).toLocaleString('ko-KR')}
        </Text>
      ) : null}

      {open && result ? (
        <BodyComparisonResultView
          afterImageUri={images.after?.uri}
          beforeImageUri={images.before?.uri}
          onRetry={handleReset}
          result={result}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  analyzeButton: {
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 14,
  },
  analyzeButtonDisabled: {
    opacity: 0.55,
  },
  analyzeButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  analyzedAtText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    textAlign: 'right',
  },
  arrowWrap: {
    paddingTop: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  collapsedDescription: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    marginBottom: 12,
  },
  comparisonContainer: {
    gap: 12,
    marginTop: 12,
  },
  comparisonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  countBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 6,
    height: 140,
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  previewWrap: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    right: -8,
    top: -8,
  },
  slot: {
    flex: 1,
  },
  slotBadge: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  slotBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  slotHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  slotLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  thumb: {
    borderRadius: 12,
    height: 140,
    width: '100%',
  },
  toggleButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toggleTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
});
