import { StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import { ptTypography } from 'shared/constants/typography';
import type { WeeklyDay } from '../types/home';

type WeeklyTrackerCardProps = {
  days: WeeklyDay[];
  streakCount: number;
};

export function WeeklyTrackerCard({
  days,
  streakCount,
}: WeeklyTrackerCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>주간 트래커</Text>
        {streakCount > 0 ? (
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>{streakCount}일 연속</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.dayRow}>
        {days.map((day) => (
          <View key={day.label} style={styles.dayCol}>
            {day.completed ? <CheckIcon /> : <View style={styles.dayCircle} />}
            <Text style={styles.dayLabel}>{day.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  dayCircle: {
    backgroundColor: Colors.dayCircleInactive,
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dayLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: '#FFE7DE',
    borderRadius: 9,
    height: 21,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  streakBadgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    lineHeight: 14,
  },
  title: {
    color: Colors.text,
    ...ptTypography.sectionTitle,
  },
});
