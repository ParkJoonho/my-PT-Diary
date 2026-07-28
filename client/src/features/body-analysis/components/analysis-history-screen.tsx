import { useNavigation } from '@granite-js/react-native';
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
  getAnalysisRecordTypeLabel,
  isComparableAnalysisRecordType,
} from '../lib/analysis-record-presentation';
import {
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
  const record = toAnalysisRecordDetail(useAnalysisRecord(recordId).data);

  return (
    <View style={styles.modalContainer}>
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 32 + insets.bottom,
          paddingHorizontal: 16,
          paddingTop: 16 + insets.top,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>닫기</Text>
          </Pressable>
          <View style={styles.modalHeaderCenter}>
            <Text style={styles.modalHeaderTitle}>
              {getAnalysisRecordTypeLabel(record.analysisType)}
            </Text>
            <Text style={styles.modalHeaderDate}>
              {formatDate(record.analyzedAt)}
            </Text>
          </View>
          <View style={styles.iconButtonPlaceholder} />
        </View>

        <AnalysisRecordDetailContent record={record} />
      </ScrollView>
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
  const summary = asString(qualitativeData.summary) ?? '요약 정보가 아직 없어요.';
  const grade = asString(qualitativeData.grade);
  const overallAlignment = quantitativeData.overallAlignment;
  const shoulderBalance = quantitativeData.shoulderBalance;
  const hipBalance = quantitativeData.hipBalance;

  return (
    <Pressable
      onPress={onOpenDetail}
      style={[styles.recordCard, iosShadow, selected && styles.recordCardSelected]}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordHeaderLeft}>
          <Pressable
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
            {selected ? <Text style={styles.recordCheckboxMark}>✓</Text> : null}
          </Pressable>
          <Text style={styles.recordType}>{getAnalysisRecordTypeLabel(record.analysisType)}</Text>
        </View>
        <View style={styles.recordHeaderRight}>
          <Text style={styles.recordDate}>{formatDate(record.analyzedAt)}</Text>
          <Text style={styles.recordChevron}>›</Text>
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
            {typeof overallAlignment === 'number' ? (
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>정렬</Text>
                <Text style={styles.miniScoreValue}>{overallAlignment}/5</Text>
              </View>
            ) : null}
            {typeof shoulderBalance === 'number' ? (
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>어깨</Text>
                <Text style={styles.miniScoreValue}>{shoulderBalance}/5</Text>
              </View>
            ) : null}
            {typeof hipBalance === 'number' ? (
              <View style={styles.miniScore}>
                <Text style={styles.miniScoreLabel}>골반</Text>
                <Text style={styles.miniScoreValue}>{hipBalance}/5</Text>
              </View>
            ) : null}
          </View>
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

function HistoryContent() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [filterType, setFilterType] = useState<
    'all' | 'body' | 'posture' | 'state-vector'
  >('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailRecordId, setDetailRecordId] = useState<string | null>(null);
  const compareRecords = useCompareAnalysisRecords();
  const { data } = useAnalysisRecords(
    filterType === 'all' ? {} : { type: filterType },
  );
  const records = data.map((record) => toAnalysisRecordSummary(record));

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
        error instanceof Error ? error.message : '비교 분석에 실패했어요.';
      Alert.alert('비교 실패', message);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 24 + insets.bottom,
          paddingTop: 16 + insets.top,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>뒤로</Text>
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
                setFilterType(item.key as typeof filterType);
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
            <Text style={styles.compareButtonText}>
              {compareRecords.isPending
                ? 'AI 비교 분석 중...'
                : '선택한 2개 기록 비교 분석'}
            </Text>
          </Pressable>
        ) : null}

        {comparison ? (
          <View style={styles.comparisonWrap}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonTitle}>비교 분석 결과</Text>
            </View>
            <AnalysisRecordComparisonResult result={comparison} />
            <Pressable
              onPress={() => {
                compareRecords.reset();
                setSelectedIds([]);
              }}
              style={styles.closeComparisonButton}
            >
              <Text style={styles.closeComparisonButtonText}>비교 결과 닫기</Text>
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

        {records.length === 0 ? (
          <EmptyState message="분석 기록이 없어요." />
        ) : (
          records.map((record) => (
            <RecordCard
              key={record.id}
              onOpenDetail={() => setDetailRecordId(record.id)}
              onToggleSelect={() => handleToggleSelect(record.id)}
              record={record}
              selected={selectedIds.includes(record.id)}
            />
          ))
        )}
      </ScrollView>

      <DetailModal onClose={() => setDetailRecordId(null)} recordId={detailRecordId} />
    </View>
  );
}

export function AnalysisHistoryScreen() {
  return (
    <SuspenseSection errorMessage="분석 기록 화면을 불러오지 못했어요.">
      <HistoryContent />
    </SuspenseSection>
  );
}

const styles = StyleSheet.create({
  bodyBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  bodyBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  closeComparisonButton: {
    alignItems: 'center',
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 12,
  },
  closeComparisonButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  compareButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    minHeight: 48,
  },
  compareButtonDisabled: {
    opacity: 0.5,
  },
  compareButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  comparisonHeader: {
    marginBottom: 12,
  },
  comparisonTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  comparisonWrap: {
    marginHorizontal: 16,
    marginTop: 12,
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
    marginTop: 12,
    paddingHorizontal: 16,
  },
  gradeBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 42,
    paddingHorizontal: 10,
  },
  gradeBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  iconButtonText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalHeaderCenter: {
    alignItems: 'center',
    flex: 1,
  },
  modalHeaderDate: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  modalHeaderTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
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
    marginHorizontal: 16,
    marginTop: 10,
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
  recordCheckboxMark: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  recordCheckboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  recordChevron: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
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
  selectHint: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    marginTop: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
});
