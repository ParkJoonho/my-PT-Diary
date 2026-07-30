import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
import { useNavigation } from '@granite-js/react-native';
import { Suspense, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CompareAnalysisRecordsDto } from 'shared/api/generated/models';
import { AsyncErrorBoundary } from 'shared/components/async-state';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
  SemanticIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import {
  useAnalysisRecord,
  useAnalysisRecords,
  useCompareAnalysisRecords,
} from '../api/analysis-records';
import {
  getAnalysisRecordTypeLabel,
  isComparableAnalysisRecordType,
} from '../lib/analysis-record-presentation';
import {
  asNumber,
  asRecord,
  asString,
  toAnalysisRecordComparison,
  toAnalysisRecordDetail,
  toAnalysisRecordSummary,
} from '../lib/object-access';
import { AnalysisRecordComparisonResult } from './analysis-record-comparison-result';
import { AnalysisRecordDetailContent } from './analysis-record-detail-content';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getBodyTypeColor(bodyType?: string) {
  switch (bodyType) {
    case 'I':
      return '#3B82F6';
    case 'V':
      return '#8B5CF6';
    case 'A':
      return '#F59E0B';
    case 'H':
      return '#22C55E';
    case 'X':
      return '#EF4444';
    case 'O':
      return '#EC4899';
    default:
      return Colors.info;
  }
}

function getScoreColor(score?: number) {
  const value = score ?? 0;

  if (value >= 4) {
    return Colors.success;
  }

  if (value >= 3) {
    return Colors.info;
  }

  if (value >= 2) {
    return Colors.warning;
  }

  return Colors.danger;
}

function getAnalysisRecordVisual(analysisType: string) {
  switch (analysisType) {
    case 'body':
      return {
        color: Colors.accent,
        icon: 'humanHandsUp' as OriginalAppIconName,
      };
    case 'body-comparison':
      return {
        color: Colors.success,
        icon: 'compare' as OriginalAppIconName,
      };
    case 'posture':
      return {
        color: '#8B5CF6',
        icon: 'human' as OriginalAppIconName,
      };
    case 'state-vector':
      return {
        color: '#D4AF37',
        icon: 'brain' as OriginalAppIconName,
      };
    default:
      return {
        color: Colors.info,
        icon: 'chartBoxOutline' as OriginalAppIconName,
      };
  }
}

function DetailModal({
  onClose,
  record,
}: {
  onClose: () => void;
  record: ReturnType<typeof toAnalysisRecordSummary> | null;
}) {
  const insets = useSafeAreaInsets();

  if (!record) {
    return null;
  }

  const { color: typeColor, icon: typeIcon } = getAnalysisRecordVisual(
    record.analysisType,
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      visible
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalHeader,
            { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 8 },
          ]}
        >
          <Pressable
            accessibilityLabel="분석 상세 닫기"
            onPress={onClose}
            style={styles.iconButton}
          >
            <OriginalAppIcon color={Colors.text} name="close" size={24} />
          </Pressable>
          <View style={styles.modalHeaderCenter}>
            <OriginalAppIcon color={typeColor} name={typeIcon} size={20} />
            <Text style={styles.modalHeaderTitle}>
              {getAnalysisRecordTypeLabel(record.analysisType)}
            </Text>
          </View>
          <Text style={styles.modalHeaderDate}>
            {formatDate(record.analyzedAt)}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{
            gap: 16,
            paddingBottom: 40 + insets.bottom,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
          style={styles.modalScroll}
        >
          <AsyncErrorBoundary message="분석 기록 상세를 불러오지 못했어요.">
            <Suspense fallback={<DetailLoadingState />}>
              <DetailModalContent recordId={record.id} />
            </Suspense>
          </AsyncErrorBoundary>
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailModalContent({
  recordId,
}: {
  recordId: string;
}) {
  const record = toAnalysisRecordDetail(useAnalysisRecord(recordId).data);

  return <AnalysisRecordDetailContent record={record} />;
}

function DetailLoadingState() {
  return (
    <View style={styles.detailLoading}>
      <ActivityIndicator color={Colors.accent} size="large" />
    </View>
  );
}

function RecordCard({
  onOpenDetail,
  onToggleSelect,
  record,
  selected,
}: {
  onOpenDetail: () => void;
  onToggleSelect: () => void;
  record: ReturnType<typeof toAnalysisRecordSummary>;
  selected: boolean;
}) {
  const comparable = isComparableAnalysisRecordType(record.analysisType);
  const qualitativeData = asRecord(record.qualitativeData);
  const quantitativeData = asRecord(record.quantitativeData);
  const bodyType = asString(qualitativeData.bodyType);
  const bodyTypeDescription = asString(qualitativeData.bodyTypeDescription);
  const summary =
    asString(qualitativeData.summary) ?? '요약 정보가 아직 없어요.';
  const grade = asString(qualitativeData.grade);
  const exerciseName = asString(qualitativeData.exerciseName);
  const compositeGrade = asString(qualitativeData.compositeGrade);
  const overallAlignment = asNumber(quantitativeData.overallAlignment);
  const shoulderBalance = asNumber(quantitativeData.shoulderBalance);
  const hipBalance = asNumber(quantitativeData.hipBalance);
  const accuracyScore = asNumber(quantitativeData.accuracyScore);
  const injuryRiskScore = asNumber(quantitativeData.injuryRiskScore);
  const compositeScore = asNumber(quantitativeData.compositeScore);
  const { color: typeColor, icon: typeIcon } = getAnalysisRecordVisual(
    record.analysisType,
  );

  return (
    <Pressable
      onPress={onOpenDetail}
      style={[styles.recordCard, selected && styles.recordCardSelected]}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordHeaderLeft}>
          <Pressable
            accessibilityLabel={
              comparable
                ? `${getAnalysisRecordTypeLabel(record.analysisType)} 기록 비교 선택`
                : `${getAnalysisRecordTypeLabel(record.analysisType)} 기록은 비교할 수 없음`
            }
            disabled={!comparable}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSelect();
            }}
            style={[
              styles.recordCheckbox,
              selected && comparable && styles.recordCheckboxSelected,
              !comparable && styles.recordCheckboxDisabled,
            ]}
          >
            {selected ? (
              <OriginalAppIcon
                color={Colors.white}
                name="checkmark"
                size={14}
              />
            ) : null}
          </Pressable>
          <OriginalAppIcon color={typeColor} name={typeIcon} size={22} />
          <Text style={styles.recordType}>
            {getAnalysisRecordTypeLabel(record.analysisType)}
          </Text>
        </View>
        <View style={styles.recordHeaderRight}>
          <Text style={styles.recordDate}>{formatDate(record.analyzedAt)}</Text>
          <SemanticIcon
            color={Colors.textMuted}
            name="chevronRight"
            size={16}
          />
        </View>
      </View>

      {record.analysisType === 'body' ? (
        <View style={styles.recordBody}>
          <View style={styles.recordBodyRow}>
            {bodyType ? (
              <View
                style={[
                  styles.bodyBadge,
                  { backgroundColor: getBodyTypeColor(bodyType) },
                ]}
              >
                <Text style={styles.bodyBadgeText}>{bodyType}</Text>
              </View>
            ) : null}
            <Text numberOfLines={2} style={styles.recordSummary}>
              {bodyTypeDescription ?? summary}
            </Text>
          </View>
          <View style={styles.recordScoreRow}>
            {overallAlignment !== undefined ? (
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>정렬</Text>
                <Text
                  style={[
                    styles.miniScoreValue,
                    { color: getScoreColor(overallAlignment) },
                  ]}
                >
                  {overallAlignment}/5
                </Text>
              </View>
            ) : null}
            {shoulderBalance !== undefined ? (
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>어깨</Text>
                <Text
                  style={[
                    styles.miniScoreValue,
                    { color: getScoreColor(shoulderBalance) },
                  ]}
                >
                  {shoulderBalance}/5
                </Text>
              </View>
            ) : null}
            {hipBalance !== undefined ? (
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>골반</Text>
                <Text
                  style={[
                    styles.miniScoreValue,
                    { color: getScoreColor(hipBalance) },
                  ]}
                >
                  {hipBalance}/5
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : record.analysisType === 'posture' ? (
        <View style={styles.recordBody}>
          <View style={styles.recordBodyRow}>
            {grade ? (
              <View
                style={[
                  styles.gradeBadge,
                  {
                    backgroundColor: grade.startsWith('A')
                      ? Colors.success
                      : grade.startsWith('B')
                        ? Colors.info
                        : Colors.warning,
                  },
                ]}
              >
                <Text style={styles.gradeBadgeText}>{grade}</Text>
              </View>
            ) : null}
            <Text numberOfLines={2} style={styles.recordSummary}>
              {exerciseName ? `${exerciseName} - ` : ''}
              {summary}
            </Text>
          </View>
          <View style={styles.recordScoreRow}>
            {accuracyScore !== undefined ? (
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>정확도</Text>
                <Text
                  style={[
                    styles.miniScoreValue,
                    {
                      color:
                        accuracyScore >= 7
                          ? Colors.success
                          : accuracyScore >= 4
                            ? Colors.warning
                            : Colors.danger,
                    },
                  ]}
                >
                  {accuracyScore}/10
                </Text>
              </View>
            ) : null}
            {injuryRiskScore !== undefined ? (
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>위험도</Text>
                <Text
                  style={[
                    styles.miniScoreValue,
                    {
                      color:
                        injuryRiskScore <= 3
                          ? Colors.success
                          : injuryRiskScore <= 6
                            ? Colors.warning
                            : Colors.danger,
                    },
                  ]}
                >
                  {injuryRiskScore}/10
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : record.analysisType === 'state-vector' ? (
        <View style={styles.recordBody}>
          <Text numberOfLines={2} style={styles.recordSummary}>
            {compositeGrade ? `종합 등급: ${compositeGrade}` : ''}
            {summary ? ` — ${summary}` : ''}
          </Text>
          {compositeScore !== undefined ? (
            <View style={styles.recordScoreRow}>
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>종합</Text>
                <Text
                  style={[
                    styles.miniScoreValue,
                    {
                      color:
                        compositeScore >= 70
                          ? Colors.success
                          : compositeScore >= 40
                            ? Colors.warning
                            : Colors.danger,
                    },
                  ]}
                >
                  {compositeScore}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : record.analysisType === 'body-comparison' ? (
        <View style={styles.recordBody}>
          <View style={styles.recordBodyRow}>
            {grade ? (
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>{grade}</Text>
              </View>
            ) : null}
            <Text numberOfLines={2} style={styles.recordSummary}>
              {summary}
            </Text>
          </View>
        </View>
      ) : (
        <Text numberOfLines={2} style={styles.recordSummary}>
          {summary}
        </Text>
      )}
    </Pressable>
  );
}

type HistoryFilter = 'all' | 'body' | 'posture' | 'state-vector';
type HistoryRecord = ReturnType<typeof toAnalysisRecordSummary>;
type HistoryComparison = ReturnType<typeof toAnalysisRecordComparison>;

function HistoryRecordList({
  comparison,
  contentBottomInset,
  filterType,
  onCloseComparison,
  onOpenDetail,
  onToggleSelect,
  selectedIds,
}: {
  comparison: HistoryComparison | null;
  contentBottomInset: number;
  filterType: HistoryFilter;
  onCloseComparison: () => void;
  onOpenDetail: (record: HistoryRecord) => void;
  onToggleSelect: (recordId: string) => void;
  selectedIds: string[];
}) {
  const { data } = useAnalysisRecords(
    filterType === 'all' ? {} : { type: filterType },
  );
  const records = data.map((record) => toAnalysisRecordSummary(record));

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: contentBottomInset }}
      showsVerticalScrollIndicator={false}
      style={styles.recordScroll}
    >
      {records.length === 0 ? (
        <View style={styles.emptyWrap}>
          <OriginalAppIcon
            color={Colors.textMuted}
            name="analyticsOutline"
            size={48}
          />
          <Text style={styles.emptyTitle}>분석 기록이 없어요</Text>
          <Text style={styles.emptyDescription}>
            AI 체형 분석 또는 자세 분석을 실행하면{'\n'}결과가 자동으로 저장돼요
          </Text>
        </View>
      ) : (
        <>
          {comparison ? (
            <View style={styles.comparisonWrap}>
              <View style={styles.comparisonHeader}>
                <OriginalAppIcon
                  color={Colors.accent}
                  name="compareHorizontal"
                  size={28}
                />
                <Text style={styles.comparisonTitle}>비교 분석 결과</Text>
              </View>
              <AnalysisRecordComparisonResult result={comparison} />
              <Pressable
                onPress={onCloseComparison}
                style={styles.closeComparisonButton}
              >
                <OriginalAppIcon
                  color={Colors.textMuted}
                  name="closeCircle"
                  size={18}
                />
                <Text style={styles.closeComparisonButtonText}>
                  비교 결과 닫기
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.selectHint}>
              {selectedIds.length === 0
                ? '기록을 2개 선택하면 AI 비교 분석을 할 수 있습니다'
                : selectedIds.length === 1
                  ? '1개 더 선택하세요'
                  : '비교 분석 버튼을 눌러 주세요'}
            </Text>
          )}

          {records.map((record) => (
            <RecordCard
              key={record.id}
              onOpenDetail={() => onOpenDetail(record)}
              onToggleSelect={() => onToggleSelect(record.id)}
              record={record}
              selected={selectedIds.includes(record.id)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function HistoryLoadingState() {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator color={Colors.accent} size="large" />
      <Text style={styles.loadingText}>기록 불러오는 중...</Text>
    </View>
  );
}

export function AnalysisHistoryScreen({
  contentBottomInset,
}: {
  contentBottomInset: number;
}) {
  const navigation = useNavigation();
  const [filterType, setFilterType] = useState<HistoryFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailRecord, setDetailRecord] = useState<HistoryRecord | null>(null);
  const compareRecords = useCompareAnalysisRecords();
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
        return [previous.at(-1) ?? recordId, recordId];
      }

      return [...previous, recordId];
    });
  };

  const handleCompare = async () => {
    const [recordId1, recordId2] = selectedIds;

    if (!recordId1 || !recordId2) {
      Alert.alert('알림', '비교할 기록 2개를 선택해 주세요.');
      return;
    }

    const payload: CompareAnalysisRecordsDto = {
      recordId1,
      recordId2,
    };

    try {
      await compareRecords.mutateAsync(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '비교 분석에 실패했어요.';
      Alert.alert('비교 실패', message);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로"
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <SemanticIcon color={Colors.text} name="chevronLeft" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>분석 기록</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <View style={styles.filterRow}>
        {[
          { key: 'all', label: '전체' },
          { key: 'body', label: '체형' },
          { key: 'posture', label: '자세' },
          { key: 'state-vector', label: '통합' },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={() => {
              setFilterType(item.key as HistoryFilter);
              setSelectedIds([]);
              compareRecords.reset();
            }}
            style={[
              styles.filterButton,
              filterType === item.key && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === item.key && styles.filterButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedIds.length === 2 && !comparison ? (
        <Pressable
          disabled={compareRecords.isPending}
          onPress={() => void handleCompare()}
          style={[
            styles.compareButton,
            compareRecords.isPending && styles.compareButtonDisabled,
          ]}
        >
          {compareRecords.isPending ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <OriginalAppIcon
              color={Colors.white}
              name="compareHorizontal"
              size={20}
            />
          )}
          <Text style={styles.compareButtonText}>
            {compareRecords.isPending
              ? 'AI 비교 분석 중...'
              : '선택한 2개 기록 비교 분석'}
          </Text>
        </Pressable>
      ) : null}

      <AsyncErrorBoundary message="분석 기록 화면을 불러오지 못했어요.">
        <Suspense fallback={<HistoryLoadingState />}>
          <HistoryRecordList
            comparison={comparison}
            contentBottomInset={contentBottomInset}
            filterType={filterType}
            onCloseComparison={() => {
              compareRecords.reset();
              setSelectedIds([]);
            }}
            onOpenDetail={setDetailRecord}
            onToggleSelect={handleToggleSelect}
            selectedIds={selectedIds}
          />
        </Suspense>
      </AsyncErrorBoundary>

      <DetailModal
        onClose={() => setDetailRecord(null)}
        record={detailRecord}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bodyBadge: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  bodyBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  closeComparisonButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
  },
  closeComparisonButtonText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  compareButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    height: 48,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  compareButtonDisabled: {
    opacity: 0.5,
  },
  compareButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },
  comparisonHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 12,
    marginHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderColor: Colors.accent,
    borderRadius: 16,
    borderWidth: 2,
  },
  comparisonTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
  },
  comparisonWrap: {
    marginBottom: 20,
  },
  detailLoading: {
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  emptyDescription: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  filterButton: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  gradeBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  gradeBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
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
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    minWidth: 40,
  },
  iconButtonPlaceholder: {
    minWidth: 40,
  },
  miniScore: {
    alignItems: 'center',
  },
  miniScoreLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  miniScoreValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  modalContainer: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  modalHeaderCenter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalHeaderDate: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  modalHeaderTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
  },
  modalScroll: {
    flex: 1,
  },
  recordBody: {
    gap: 8,
  },
  recordBodyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  recordCard: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    marginHorizontal: 16,
    padding: 16,
  },
  recordCardSelected: {
    backgroundColor: `${Colors.accent}08`,
    borderColor: Colors.accent,
  },
  recordCheckbox: {
    alignItems: 'center',
    borderColor: Colors.textMuted,
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  recordCheckboxDisabled: {
    opacity: 0.45,
  },
  recordCheckboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  recordDate: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  recordHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  recordHeaderRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  recordScoreRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  recordSummary: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  recordType: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  screenContainer: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  loadingText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    marginTop: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 80,
  },
  recordScroll: {
    flex: 1,
  },
  selectHint: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    marginBottom: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
});
