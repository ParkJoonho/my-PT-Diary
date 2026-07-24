import { useNavigation } from '@granite-js/react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import type { ConditionRecordDto } from 'shared/api/generated/models';
import Colors from 'shared/constants/colors';
import {
  useConditionRecords,
  useDeleteConditionRecord,
} from '../api/condition-records';
import {
  formatGroupDate,
  formatRangeLabel,
} from '../lib/condition-record-metadata';
import { useConditionRecordListStore } from '../stores/use-condition-record-list-store';
import { ConditionCalendarModal } from './condition-calendar-modal';
import { ConditionRecordCard } from './condition-record-card';

type ListItem =
  | { date: string; type: 'header' }
  | { record: ConditionRecordDto; type: 'card' };

export function ConditionRecordListScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
        <Text style={styles.headerTitle}>컨디션 기록</Text>
        <Pressable
          onPress={() =>
            navigation.navigate({ name: '/condition-form', params: {} })
          }
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>작성</Text>
        </Pressable>
      </View>

      <SuspenseSection errorMessage="컨디션 기록을 불러오지 못했어요.">
        <ConditionRecordListContent />
      </SuspenseSection>
    </View>
  );
}

function ConditionRecordListContent() {
  const navigation = useNavigation();
  const { data, refetch } = useConditionRecords();
  const deleteMutation = useDeleteConditionRecord();
  const [refreshing, setRefreshing] = useState(false);
  const applyDateRange = useConditionRecordListStore(
    (state) => state.applyDateRange,
  );
  const clearDateRange = useConditionRecordListStore(
    (state) => state.clearDateRange,
  );
  const closeCalendar = useConditionRecordListStore(
    (state) => state.closeCalendar,
  );
  const dateRange = useConditionRecordListStore((state) => state.dateRange);
  const displayCount = useConditionRecordListStore(
    (state) => state.displayCount,
  );
  const expandDisplayCount = useConditionRecordListStore(
    (state) => state.expandDisplayCount,
  );
  const isCalendarOpen = useConditionRecordListStore(
    (state) => state.isCalendarOpen,
  );
  const openCalendar = useConditionRecordListStore(
    (state) => state.openCalendar,
  );

  const sortedRecords = useMemo(
    () =>
      data.slice().sort((left, right) => {
        if (left.date === right.date) {
          return (right.createdAt ?? 0) - (left.createdAt ?? 0);
        }

        return right.date.localeCompare(left.date);
      }),
    [data],
  );

  const markedDates = useMemo(
    () => new Set(sortedRecords.map((record) => record.date)),
    [sortedRecords],
  );

  const filteredRecords = useMemo(() => {
    if (!dateRange.start) {
      return sortedRecords;
    }

    if (!dateRange.end || dateRange.start === dateRange.end) {
      return sortedRecords.filter((record) => record.date === dateRange.start);
    }

    return sortedRecords.filter(
      (record) =>
        record.date >= dateRange.start! && record.date <= dateRange.end!,
    );
  }, [dateRange, sortedRecords]);

  const listData = useMemo(() => {
    const items: ListItem[] = [];
    let previousDate = '';

    filteredRecords.slice(0, displayCount).forEach((record) => {
      if (record.date !== previousDate) {
        items.push({ date: record.date, type: 'header' });
        previousDate = record.date;
      }

      items.push({ record, type: 'card' });
    });

    return items;
  }, [displayCount, filteredRecords]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (conditionId: string) => {
    Alert.alert('삭제', '이 컨디션 기록을 삭제할까요?', [
      {
        style: 'cancel',
        text: '닫기',
      },
      {
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(conditionId);
          } catch {
            Alert.alert('오류', '컨디션 기록을 삭제하지 못했어요.');
          }
        },
        style: 'destructive',
        text: '삭제',
      },
    ]);
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      const group = formatGroupDate(item.date);

      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>{group.display}</Text>
          {group.isToday ? (
            <View style={styles.todayChip}>
              <Text style={styles.todayChipText}>오늘</Text>
            </View>
          ) : null}
        </View>
      );
    }

    return (
      <ConditionRecordCard
        onLongPress={() => handleDelete(item.record.id)}
        onPress={() =>
          navigation.navigate({
            name: '/condition-form',
            params: {
              conditionId: item.record.id,
            },
          })
        }
        record={item.record}
      />
    );
  };

  return (
    <>
      <View style={styles.filterRow}>
        <Text style={styles.listTitle}>전체 컨디션 기록</Text>
        <Pressable
          onPress={openCalendar}
          style={[
            styles.filterButton,
            dateRange.start && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterButtonText,
              dateRange.start && styles.filterButtonTextActive,
            ]}
          >
            {formatRangeLabel(dateRange)}
          </Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={listData}
        keyExtractor={(item, index) =>
          item.type === 'header'
            ? `header-${item.date}`
            : `card-${item.record.id}-${index}`
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {dateRange.start
                ? '해당 기간에 컨디션 기록이 없어요'
                : '컨디션 기록이 없어요'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {dateRange.start
                ? '다른 기간을 선택해 보세요.'
                : '작성 버튼을 눌러 컨디션을 체크해보세요.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          displayCount < filteredRecords.length ? (
            <View style={styles.loadingMore}>
              <Text style={styles.loadingMoreText}>더 불러오는 중...</Text>
            </View>
          ) : null
        }
        onEndReached={() => expandDisplayCount(filteredRecords.length)}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <ConditionCalendarModal
        appliedRange={dateRange}
        markedDates={markedDates}
        onApply={applyDateRange}
        onClear={clearDateRange}
        onClose={closeCalendar}
        visible={isCalendarOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dateHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
    paddingTop: 20,
  },
  dateHeaderText: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 80,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonActive: {
    backgroundColor: `${Colors.accent}12`,
    borderColor: Colors.accent,
  },
  filterButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: Colors.accent,
  },
  filterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerButton: {
    minWidth: 44,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 32,
  },
  listTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  todayChip: {
    backgroundColor: '#E6E9EE',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayChipText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
});
