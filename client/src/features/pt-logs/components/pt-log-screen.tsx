import { useNavigation } from '@granite-js/react-native';
import { useQueryClient } from '@tanstack/react-query';
import { HomeTabBar } from 'features/home/components/home-tab-bar';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Plus,
  Users,
} from 'lucide-react-native';
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
import { useTrackerUserKey } from 'shared/api/user-key';
import { getWeeklyTrackerSummaryQueryKeyPrefix } from 'shared/api/weekly-tracker';
import { SuspenseSection } from 'shared/components/async-state';
import Colors, { iosShadow } from 'shared/constants/colors';
import {
  getPtLessonsQueryKeyPrefix,
  useDeletePtLesson,
  usePtLessons,
} from '../api/pt-lessons';
import {
  filterPtLessonsByRange,
  formatPtDateRangeLabel,
} from '../lib/pt-log-format';
import type { PtDateRange } from '../types/pt-log';
import { PtLessonCard } from './pt-lesson-card';
import { PtLogCalendarModal } from './pt-log-calendar-modal';

export function PtLogScreen() {
  return (
    <View style={styles.container}>
      <SuspenseSection errorMessage="PT 수업일지를 불러오지 못했어요.">
        <PtLogContent />
      </SuspenseSection>
      <HomeTabBar activeKey="pt-log" />
    </View>
  );
}

function PtLogContent() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();
  const { data: lessons } = usePtLessons();
  const deletePtLessonMutation = useDeletePtLesson();
  const [dateRange, setDateRange] = useState<PtDateRange>({
    end: null,
    start: null,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredLessons = useMemo(
    () => filterPtLessonsByRange(lessons, dateRange),
    [dateRange, lessons],
  );
  const markedDates = useMemo(
    () => new Set(lessons.map((lesson) => lesson.date)),
    [lessons],
  );
  const isFiltered = Boolean(dateRange.start);

  const handleDelete = (lessonId: string) => {
    Alert.alert('삭제', '이 수업일지를 삭제할까요?', [
      {
        style: 'cancel',
        text: '닫기',
      },
      {
        onPress: async () => {
          try {
            await deletePtLessonMutation.mutateAsync(lessonId);
          } catch {
            Alert.alert('오류', 'PT 수업일지를 삭제하지 못했어요.');
          }
        },
        style: 'destructive',
        text: '삭제',
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getPtLessonsQueryKeyPrefix(userKey),
        }),
        queryClient.invalidateQueries({
          queryKey: getWeeklyTrackerSummaryQueryKeyPrefix(userKey),
        }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredLessons}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {isFiltered
                ? '해당 기간에 수업일지가 없어요.'
                : '수업일지가 없어요.\n+ 버튼으로 첫 수업을 등록해보세요.'}
            </Text>
            {!isFiltered ? (
              <Pressable
                onPress={() =>
                  navigation.navigate({ name: '/pt-lesson-form', params: {} })
                }
              >
                <Text style={styles.emptyAction}>+수업일지 기록하기</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>PT</Text>
                <Text style={styles.title}>PT 수업일지</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>AI 추천 트레이너</Text>
            <Pressable
              onPress={() =>
                navigation.navigate({ name: '/ai-trainer-match', params: {} })
              }
              style={({ pressed }) => [
                styles.trainerCard,
                pressed && styles.trainerCardPressed,
              ]}
            >
              <View style={styles.trainerIconWrap}>
                <Users color={Colors.accent} size={20} />
              </View>
              <View style={styles.trainerTextWrap}>
                <View style={styles.trainerTitleRow}>
                  <Text style={styles.trainerTitle}>트레이너 연결</Text>
                </View>
                <Text style={styles.trainerSubtitle}>
                  현재 운동 기록과 PT 수업일지를 바탕으로 트레이너를
                  추천해드려요.
                </Text>
              </View>
              <ArrowRight color={Colors.iconMuted} size={18} />
            </Pressable>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PT 수업일지</Text>
              <Pressable
                onPress={() => setIsCalendarOpen(true)}
                style={[
                  styles.filterButton,
                  isFiltered && styles.filterButtonActive,
                ]}
              >
                <Calendar
                  color={isFiltered ? Colors.accent : Colors.textSecondary}
                  size={14}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    isFiltered && styles.filterButtonTextActive,
                  ]}
                >
                  {formatPtDateRangeLabel(dateRange)}
                </Text>
                <ChevronDown
                  color={isFiltered ? Colors.accent : Colors.textSecondary}
                  size={14}
                />
              </Pressable>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />
        }
        renderItem={({ item }) => (
          <PtLessonCard
            lesson={item}
            onLongPress={() => handleDelete(item.id)}
            onPress={() =>
              navigation.navigate({
                name: '/pt-lesson-form',
                params: { lessonId: item.id },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={() =>
          navigation.navigate({ name: '/pt-lesson-form', params: {} })
        }
        style={styles.fab}
      >
        <Plus color={Colors.white} size={28} />
      </Pressable>

      <PtLogCalendarModal
        appliedRange={dateRange}
        markedDates={markedDates}
        onApply={setDateRange}
        onClear={() => setDateRange({ end: null, start: null })}
        onClose={() => setIsCalendarOpen(false)}
        visible={isCalendarOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  emptyAction: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  emptyCard: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  eyebrow: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 26,
    bottom: 104,
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 52,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  header: {
    marginBottom: 22,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    marginBottom: 10,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 30,
    marginTop: 4,
  },
  trainerCard: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  trainerCardPressed: {
    opacity: 0.84,
  },
  trainerIconWrap: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  trainerSubtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  trainerTextWrap: {
    flex: 1,
    gap: 4,
  },
  trainerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  trainerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
