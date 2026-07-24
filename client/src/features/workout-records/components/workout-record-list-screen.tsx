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
import type { WorkoutRecordDto } from 'shared/api/generated/models';
import Colors from 'shared/constants/colors';
import {
  useDeleteWorkoutRecord,
  useWorkoutRecords,
} from '../api/workout-records';
import {
  formatGroupDate,
  formatRangeLabel,
} from '../lib/workout-record-list-metadata';
import { useWorkoutRecordListStore } from '../stores/use-workout-record-list-store';
import { WorkoutRecordCalendarModal } from './workout-record-calendar-modal';
import { WorkoutRecordCard } from './workout-record-card';

type ListItem =
  | { date: string; type: 'header' }
  | { record: WorkoutRecordDto; type: 'card' };

export function WorkoutRecordListScreen() {
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
        <Text style={styles.headerTitle}>운동 기록</Text>
        <Pressable
          onPress={() =>
            navigation.navigate({ name: '/exercise-form', params: {} })
          }
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>작성</Text>
        </Pressable>
      </View>

      <WorkoutRecordListContent />
    </View>
  );
}

function WorkoutRecordListContent() {
  const navigation = useNavigation();
  const { data, refetch } = useWorkoutRecords({ source: 'manual' });
  const deleteMutation = useDeleteWorkoutRecord();
  const [refreshing, setRefreshing] = useState(false);
  const applyDateRange = useWorkoutRecordListStore((state) => state.applyDateRange);
  const clearDateRange = useWorkoutRecordListStore((state) => state.clearDateRange);
  const closeCalendar = useWorkoutRecordListStore((state) => state.closeCalendar);
  const dateRange = useWorkoutRecordListStore((state) => state.dateRange);
  const displayCount = useWorkoutRecordListStore((state) => state.displayCount);
  const expandDisplayCount = useWorkoutRecordListStore(
    (state) => state.expandDisplayCount,
  );
  const isCalendarOpen = useWorkoutRecordListStore(
    (state) => state.isCalendarOpen,
  );
  const openCalendar = useWorkoutRecordListStore((state) => state.openCalendar);

  const sortedRecords = useMemo(
    () =>
      data.slice().sort((left, right) => {
        if (left.performedOn === right.performedOn) {
          return left.createdAt.localeCompare(right.createdAt) * -1;
        }

        return right.performedOn.localeCompare(left.performedOn);
      }),
    [data],
  );

  const markedDates = useMemo(
    () => new Set(sortedRecords.map((record) => record.performedOn)),
    [sortedRecords],
  );

  const filteredRecords = useMemo(() => {
    if (!dateRange.start) {
      return sortedRecords;
    }

    if (!dateRange.end || dateRange.start === dateRange.end) {
      return sortedRecords.filter(
        (record) => record.performedOn === dateRange.start,
      );
    }

    return sortedRecords.filter(
      (record) =>
        record.performedOn >= dateRange.start! &&
        record.performedOn <= dateRange.end!,
    );
  }, [dateRange, sortedRecords]);

  const listData = useMemo(() => {
    const items: ListItem[] = [];
    let previousDate = '';

    filteredRecords.slice(0, displayCount).forEach((record) => {
      if (record.performedOn !== previousDate) {
        items.push({ date: record.performedOn, type: 'header' });
        previousDate = record.performedOn;
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

  const handleDelete = (recordId: string) => {
    Alert.alert('삭제', '이 운동기록을 삭제할까요?', [
      {
        style: 'cancel',
        text: '닫기',
      },
      {
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(recordId);
          } catch {
            Alert.alert('오류', '운동 기록을 삭제하지 못했어요.');
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
      <WorkoutRecordCard
        onLongPress={() => handleDelete(item.record.id)}
        onPress={() =>
          navigation.navigate({
            name: '/exercise-form',
            params: {
              recordId: item.record.id,
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
        <Text style={styles.listTitle}>전체 운동기록</Text>
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
                ? '해당 기간에 운동기록이 없어요'
                : '운동기록이 없어요'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {dateRange.start
                ? '다른 기간을 선택해 보세요.'
                : '운동 기록을 작성해 보세요.'}
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
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor={Colors.accent}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <WorkoutRecordCalendarModal
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
    gap: 10,
    paddingTop: 80,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
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
    color: '#8E8E8E',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
});
