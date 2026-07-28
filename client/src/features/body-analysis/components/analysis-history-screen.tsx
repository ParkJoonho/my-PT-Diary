import { useNavigation } from '@granite-js/react-native';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Circle,
  GitCompareArrows,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, SuspenseSection } from 'shared/components/async-state';
import type { CompareAnalysisRecordsDto } from 'shared/api/generated/models';
import Colors, { iosShadow } from 'shared/constants/colors';
import {
  useAnalysisRecord,
  useAnalysisRecords,
  useCompareAnalysisRecords,
} from '../api/analysis-records';
import {
  getAnalysisRecordCardMeta,
  getAnalysisRecordTypeLabel,
  isComparableAnalysisRecordType,
} from '../lib/analysis-record-presentation';
import {
  toAnalysisRecordComparison,
  toBodyAnalysisResult,
  toBodyComparisonResult,
} from '../lib/object-access';
import { BodyAnalysisResultView } from './body-analysis-result';
import { BodyComparisonResultView } from './body-comparison-result';

function DetailModal({
  onClose,
  recordId,
}: {
  onClose: () => void;
  recordId: string | null;
}) {
  if (!recordId) {
    return null;
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible>
      <DetailModalContent onClose={onClose} recordId={recordId} />
    </Modal>
  );
}

function DetailModalContent({
  onClose,
  recordId,
}: {
  onClose: () => void;
  recordId: string;
}) {
  const insets = useSafeAreaInsets();
  const { data } = useAnalysisRecord(recordId);
  const typeLabel = getAnalysisRecordTypeLabel(data.analysisType);
  const isBodyAnalysis = data.analysisType === 'body';
  const isBodyComparison = data.analysisType === 'body-comparison';

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 24 + insets.bottom,
          paddingHorizontal: 16,
          paddingTop: 16 + insets.top,
        }}
      >
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.iconButton}>
            <X color={Colors.text} size={18} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.headerTitle}>분석 기록 상세</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={[styles.card, iosShadow]}>
          <Text style={styles.cardTitle}>기록 정보</Text>
          <Text style={styles.metaText}>타입 {typeLabel}</Text>
          <Text style={styles.metaText}>
            분석 시각 {new Date(data.analyzedAt).toLocaleString('ko-KR')}
          </Text>
          <Text style={styles.metaText}>
            저장 시각 {new Date(data.createdAt).toLocaleString('ko-KR')}
          </Text>
        </View>

        {isBodyAnalysis ? (
          <BodyAnalysisResultView result={toBodyAnalysisResult(data.rawResult)} />
        ) : null}
        {isBodyComparison ? (
          <BodyComparisonResultView
            result={toBodyComparisonResult(data.rawResult)}
          />
        ) : null}
        {!isBodyAnalysis && !isBodyComparison ? (
          <View style={[styles.card, iosShadow]}>
            <Text style={styles.metaText}>
              이 분석 타입의 상세 렌더링은 아직 준비 중이에요.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function HistoryContent() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [filterType, setFilterType] = useState<
    'all' | 'body' | 'body-comparison'
  >('body');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailRecordId, setDetailRecordId] = useState<string | null>(null);
  const compareRecords = useCompareAnalysisRecords();
  const { data: records } = useAnalysisRecords(
    filterType === 'all' ? {} : { type: filterType },
  );

  const comparison = useMemo(() => {
    if (!compareRecords.data) {
      return null;
    }

    return toAnalysisRecordComparison(compareRecords.data);
  }, [compareRecords.data]);

  const handleToggleSelect = (recordId: string) => {
    compareRecords.reset();
    setSelectedIds((previous) => {
      if (previous.includes(recordId)) {
        return previous.filter((item) => item !== recordId);
      }

      if (previous.length >= 2) {
        return [previous[1]!, recordId];
      }

      return [...previous, recordId];
    });
  };

  const handleCompare = async () => {
    const payload: CompareAnalysisRecordsDto = {
      recordId1: selectedIds[0]!,
      recordId2: selectedIds[1]!,
    };

    try {
      await compareRecords.mutateAsync(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '분석 기록 비교에 실패했어요.';
      Alert.alert('비교 실패', message);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 24 + insets.bottom,
          paddingHorizontal: 16,
          paddingTop: 16 + insets.top,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft color={Colors.text} size={22} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>분석 기록</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={[styles.filterCard, iosShadow]}>
          <Pressable
            onPress={() => {
              setFilterType('body');
              setSelectedIds([]);
              compareRecords.reset();
            }}
            style={[
              styles.filterButton,
              filterType === 'body' && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === 'body' && styles.filterButtonTextActive,
              ]}
            >
              체형
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setFilterType('body-comparison');
              setSelectedIds([]);
              compareRecords.reset();
            }}
            style={[
              styles.filterButton,
              filterType === 'body-comparison' && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === 'body-comparison' && styles.filterButtonTextActive,
              ]}
            >
              전·후
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setFilterType('all');
              setSelectedIds([]);
              compareRecords.reset();
            }}
            style={[
              styles.filterButton,
              filterType === 'all' && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === 'all' && styles.filterButtonTextActive,
              ]}
            >
              전체
            </Text>
          </Pressable>
        </View>

        {selectedIds.length === 2 ? (
          <Pressable
            disabled={compareRecords.isPending}
            onPress={() => void handleCompare()}
            style={[
              styles.compareButton,
              compareRecords.isPending && styles.compareButtonDisabled,
            ]}
          >
            <GitCompareArrows color={Colors.white} size={16} strokeWidth={2.1} />
            <Text style={styles.compareButtonText}>
              {compareRecords.isPending
                ? 'AI가 비교 분석 중이에요...'
                : '선택한 기록 비교'}
            </Text>
          </Pressable>
        ) : null}

        {comparison ? (
          <View style={[styles.card, iosShadow]}>
            <Text style={styles.cardTitle}>비교 분석 결과</Text>
            {comparison.overallChange ? (
              <Text style={styles.comparisonSummary}>
                {comparison.overallChange}
              </Text>
            ) : null}
            {comparison.improvements?.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.bulletRow}>
                <TrendingUp color={Colors.success} size={14} strokeWidth={2.1} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
            {comparison.recommendations?.length ? (
              <View style={styles.recommendationWrap}>
                <Text style={styles.subSectionTitle}>추천사항</Text>
                {comparison.recommendations.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.bulletRow}>
                    <Text style={styles.dotBullet}>•</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {records.length === 0 ? (
          <EmptyState
            message={
              filterType === 'body-comparison'
                ? '아직 저장된 전·후 비교 기록이 없어요.'
                : '아직 저장된 체형 분석 기록이 없어요.'
            }
          />
        ) : (
          records.map((record) => {
            const meta = getAnalysisRecordCardMeta(record);
            const selected =
              isComparableAnalysisRecordType(record.analysisType) &&
              selectedIds.includes(record.id);
            const comparable = isComparableAnalysisRecordType(record.analysisType);

            return (
              <Pressable
                key={record.id}
                onPress={() =>
                  comparable ? handleToggleSelect(record.id) : undefined
                }
                style={[
                  styles.recordCard,
                  iosShadow,
                  selected && styles.recordCardSelected,
                ]}
              >
                <View style={styles.recordHeader}>
                  <View style={styles.bodyTypeBadge}>
                    <Text style={styles.bodyTypeBadgeText}>{meta.badgeText}</Text>
                  </View>
                  <View style={styles.recordHeaderTextWrap}>
                    <Text style={styles.recordTypeTitle}>{meta.title}</Text>
                    <Text style={styles.recordDateText}>
                      {new Date(record.analyzedAt).toLocaleDateString('ko-KR')}
                    </Text>
                  </View>
                  {comparable ? (
                    selected ? (
                      <CheckCircle2
                        color={Colors.accent}
                        size={18}
                        strokeWidth={2.1}
                      />
                    ) : (
                      <Circle
                        color={Colors.textMuted}
                        size={18}
                        strokeWidth={2.1}
                      />
                    )
                  ) : (
                    <Text style={styles.nonComparableText}>상세 전용</Text>
                  )}
                </View>

                <Text numberOfLines={3} style={styles.recordSummary}>
                  {meta.summary}
                </Text>

                <View style={styles.recordFooter}>
                  <Pressable
                    onPress={() => setDetailRecordId(record.id)}
                    style={styles.detailButton}
                  >
                    <Text style={styles.detailButtonText}>상세 보기</Text>
                    <ChevronRight
                      color={Colors.accent}
                      size={14}
                      strokeWidth={2.1}
                    />
                  </Pressable>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <DetailModal
        onClose={() => setDetailRecordId(null)}
        recordId={detailRecordId}
      />
    </View>
  );
}

export function AnalysisHistoryScreen() {
  return (
    <SuspenseSection errorMessage="분석 기록을 불러오지 못했어요.">
      <HistoryContent />
    </SuspenseSection>
  );
}

const styles = StyleSheet.create({
  bodyTypeBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  bodyTypeBadgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  bulletText: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 10,
    padding: 16,
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  compareButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
  },
  compareButtonDisabled: {
    opacity: 0.55,
  },
  compareButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  comparisonSummary: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  detailButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  detailButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  dotBullet: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    lineHeight: 18,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  filterButtonActive: {
    backgroundColor: Colors.accentLight,
  },
  filterButtonText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: Colors.accent,
  },
  filterCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  headerTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  metaText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  nonComparableText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  recommendationWrap: {
    gap: 8,
  },
  recordCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 10,
    padding: 16,
  },
  recordCardSelected: {
    borderColor: Colors.accent,
    borderWidth: 1,
  },
  recordDateText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  recordHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  recordHeaderTextWrap: {
    flex: 1,
    gap: 4,
  },
  recordSummary: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  recordTypeTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  screenContainer: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  subSectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
