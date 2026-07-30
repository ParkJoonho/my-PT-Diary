import { useNavigation } from '@granite-js/react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, ClipboardList, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTrackerUserKey } from 'shared/api/user-key';
import { getWeeklyTrackerSummaryQueryKeyPrefix } from 'shared/api/weekly-tracker';
import { SuspenseSection } from 'shared/components/async-state';
import { SemanticIcon } from 'shared/components/icons/pt-diary-icons';
import { TabPageLayout } from 'shared/components/tab-page-layout';
import Colors, { iosShadow } from 'shared/constants/colors';
import { ptTypography } from 'shared/constants/typography';
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
    <TabPageLayout activeKey="pt-log" contentBottomSpacing={80}>
      {(metrics) => (
        <SuspenseSection errorMessage="PT 수업일지를 불러오지 못했어요.">
          <PtLogContent metrics={metrics} />
        </SuspenseSection>
      )}
    </TabPageLayout>
  );
}

function PtLogContent({
  metrics,
}: {
  metrics: {
    contentBottomInset: number;
    floatingActionBottomInset: number;
  };
}) {
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
        contentContainerStyle={[
          styles.content,
          { paddingBottom: metrics.contentBottomInset },
        ]}
        data={filteredLessons}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <ClipboardList color={Colors.textMuted} size={32} />
            <Text style={styles.emptyTitle}>
              {isFiltered
                ? '해당 기간에 수업일지가 없어요'
                : '수업일지가 없어요\n+ 버튼을 눌러 첫 수업을 등록해보세요'}
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
            <Text style={[styles.sectionTitle, styles.trainerSectionTitle]}>
              AI 추천 트레이너
            </Text>
            <Pressable
              onPress={() =>
                navigation.navigate({ name: '/ai-trainer-match', params: {} })
              }
              style={({ pressed }) => [
                styles.trainerCard,
                pressed && styles.trainerCardPressed,
              ]}
            >
              <Image
                resizeMode="contain"
                source={require('../../../assets/images/trainer-icon.png')}
                style={styles.trainerIcon}
              />
              <View style={styles.trainerTextWrap}>
                <Text style={styles.trainerTitle}>트레이너 연결</Text>
                <Text style={styles.trainerSubtitle}>
                  나에게 딱 맞는 트레이너를 추천해드려요.
                </Text>
              </View>
              <SemanticIcon
                color={Colors.iconMuted}
                name="chevronRight"
                size={20}
              />
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
                <SemanticIcon
                  color={isFiltered ? Colors.accent : Colors.textSecondary}
                  name="chevronDown"
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
        style={[styles.fab, { bottom: metrics.floatingActionBottomInset }]}
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
  content: {
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
  fab: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 26,
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
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.text,
    ...ptTypography.sectionTitle,
  },
  trainerSectionTitle: {
    marginBottom: 10,
  },
  trainerCard: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 19,
  },
  trainerCardPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  trainerIcon: {
    borderRadius: 999,
    height: 34,
    width: 34,
  },
  trainerSubtitle: {
    color: '#8E8E8E',
    ...ptTypography.rowActionSubtitle,
  },
  trainerTextWrap: {
    flex: 1,
    gap: 4,
  },
  trainerTitle: {
    color: '#00192B',
    ...ptTypography.rowActionTitle,
  },
});
