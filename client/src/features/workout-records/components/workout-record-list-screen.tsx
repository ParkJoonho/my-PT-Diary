import { useNavigation } from '@granite-js/react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';
import { useWorkoutRecords } from '../api/workout-records';
import { WorkoutRecordCard } from './workout-record-card';

type RangePreset = 'all' | 'today' | 'week';

export function WorkoutRecordListScreen() {
  const navigation = useNavigation();
  const [range, setRange] = useState<RangePreset>('all');

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

      <View style={styles.segment}>
        <RangeButton
          active={range === 'all'}
          label="전체"
          onPress={() => setRange('all')}
        />
        <RangeButton
          active={range === 'today'}
          label="오늘"
          onPress={() => setRange('today')}
        />
        <RangeButton
          active={range === 'week'}
          label="최근 7일"
          onPress={() => setRange('week')}
        />
      </View>

      <SuspenseSection errorMessage="운동 기록을 불러오지 못했어요.">
        <WorkoutRecordListContent range={range} />
      </SuspenseSection>
    </View>
  );
}

function WorkoutRecordListContent({ range }: { range: RangePreset }) {
  const navigation = useNavigation();
  const { data } = useWorkoutRecords(getRangeParams(range));

  if (!data.length) {
    return <EmptyState message="아직 운동 기록이 없어요." />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      {data.map((record) => (
        <WorkoutRecordCard
          key={record.id}
          onPress={() =>
            navigation.navigate({
              name: '/exercise-record-detail',
              params: {
                recordId: record.id,
              },
            })
          }
          record={record}
        />
      ))}
    </ScrollView>
  );
}

function RangeButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function getRangeParams(range: RangePreset) {
  if (range === 'all') {
    return {};
  }

  const today = getClientTodayDate();

  if (range === 'today') {
    return { from: today, to: today };
  }

  const date = new Date();
  date.setDate(date.getDate() - 6);
  const from = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  return { from, to: today };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    gap: 10,
    paddingBottom: 32,
  },
  segment: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 9,
  },
  segmentButtonActive: {
    backgroundColor: Colors.card,
  },
  segmentText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  segmentTextActive: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
  },
});
