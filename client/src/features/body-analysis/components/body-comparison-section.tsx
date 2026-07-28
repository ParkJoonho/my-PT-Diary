import {
  ArrowRight,
  Camera,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  GitCompareArrows,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Colors, { iosShadow } from 'shared/constants/colors';
import { useAnalyzeBodyComparison } from '../api/body-comparison';
import { useCreateAnalysisRecord } from '../api/analysis-records';
import { buildBodyComparisonRecordPayload } from '../lib/analysis-record-payload';
import { pickSingleImage, type PickedImage } from '../lib/pick-image';
import { toBodyComparisonResult } from '../lib/object-access';
import { AnalysisRecordSaveBanner } from './analysis-record-save-banner';
import { BodyComparisonResultView } from './body-comparison-result';

type ComparisonImageTarget = 'after' | 'before';

type ComparisonImages = Partial<Record<ComparisonImageTarget, PickedImage>>;

function ComparisonSlot({
  accentColor,
  image,
  label,
  onPickAlbum,
  onPickCamera,
  onRemove,
  shortLabel,
}: {
  accentColor: string;
  image?: PickedImage;
  label: string;
  onPickAlbum: () => void;
  onPickCamera: () => void;
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
          <Image resizeMode="cover" source={{ uri: image.uri }} style={styles.thumb} />
          <Pressable hitSlop={8} onPress={onRemove} style={styles.removeButton}>
            <X color={Colors.white} size={16} strokeWidth={2.1} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <FolderOpen color={accentColor} size={26} strokeWidth={2.1} />
          <Text style={styles.placeholderText}>갤러리에서{'\n'}선택</Text>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={onPickCamera}>
              <Camera color={accentColor} size={16} strokeWidth={2.1} />
              <Text style={[styles.actionText, { color: accentColor }]}>
                카메라
              </Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onPickAlbum}>
              <FolderOpen color={accentColor} size={16} strokeWidth={2.1} />
              <Text style={[styles.actionText, { color: accentColor }]}>
                앨범
              </Text>
            </Pressable>
          </View>
        </View>
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

  const selectedCount = Number(Boolean(images.before)) + Number(Boolean(images.after));

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
        error instanceof Error ? error.message : '전·후 비교 분석 요청에 실패했어요.';
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
    <View style={[styles.card, iosShadow]}>
      <Pressable onPress={() => onOpenChange(!open)} style={styles.toggleButton}>
        <View style={styles.toggleLeft}>
          <GitCompareArrows color="#10B981" size={18} strokeWidth={2.1} />
          <Text style={styles.toggleTitle}>전/후 비교 분석</Text>
          {selectedCount > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selectedCount}</Text>
            </View>
          ) : null}
        </View>
        {open ? (
          <ChevronUp color={Colors.textMuted} size={18} strokeWidth={2.1} />
        ) : (
          <ChevronDown color={Colors.textMuted} size={18} strokeWidth={2.1} />
        )}
      </Pressable>

      {!open && !images.before && !images.after ? (
        <Text style={styles.collapsedDescription}>
          운동 전/후 사진을 비교하여 AI가 체형 변화를 분석합니다
        </Text>
      ) : null}

      {open && !result ? (
        <>
          <View style={styles.comparisonRow}>
            <ComparisonSlot
              accentColor="#6366F1"
              image={images.before}
              label="Before"
              onPickAlbum={() =>
                void handlePickImage({ target: 'before', useCamera: false })
              }
              onPickCamera={() =>
                void handlePickImage({ target: 'before', useCamera: true })
              }
              onRemove={() => {
                setImages((previous) => ({ ...previous, before: undefined }));
                resetResultState();
              }}
              shortLabel="전"
            />
            <View style={styles.arrowWrap}>
              <ArrowRight color={Colors.textMuted} size={22} strokeWidth={2.1} />
            </View>
            <ComparisonSlot
              accentColor="#10B981"
              image={images.after}
              label="After"
              onPickAlbum={() =>
                void handlePickImage({ target: 'after', useCamera: false })
              }
              onPickCamera={() =>
                void handlePickImage({ target: 'after', useCamera: true })
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
            <GitCompareArrows color={Colors.white} size={16} strokeWidth={2.1} />
            <Text style={styles.analyzeButtonText}>
              {analyzeComparison.isPending
                ? '비교 분석 중...'
                : images.before?.base64 && images.after?.base64
                  ? 'AI 전/후 비교 분석'
                  : '전/후 사진을 모두 선택하세요'}
            </Text>
          </Pressable>
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
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 36,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  actionText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  analyzeButton: {
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
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
    justifyContent: 'center',
    paddingTop: 28,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  collapsedDescription: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  comparisonRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 8,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 999,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 10,
    height: 180,
    justifyContent: 'center',
    padding: 12,
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
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: 999,
    height: 26,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 26,
  },
  slot: {
    flex: 1,
    gap: 8,
  },
  slotBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slotBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  slotHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  slotLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  thumb: {
    borderRadius: 12,
    height: 180,
    width: '100%',
  },
  toggleButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toggleTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
});
