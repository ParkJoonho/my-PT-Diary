import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import {
  formatPtLessonDate,
  getPtLessonTotalVolume,
} from '../lib/pt-log-format';
import type { PtLesson } from '../types/pt-log';

type PtLessonCardProps = {
  lesson: PtLesson;
  onLongPress?: () => void;
  onPress?: () => void;
};

export const PtLessonCard = memo(function PtLessonCard({
  lesson,
  onLongPress,
  onPress,
}: PtLessonCardProps) {
  const totalVolumeKg = getPtLessonTotalVolume(lesson);
  const mainExercise = lesson.exercises[0]?.name ?? '-';
  const extraExerciseCount = Math.max(lesson.exercises.length - 1, 0);
  const exerciseLabel =
    extraExerciseCount > 0
      ? `${mainExercise} +${extraExerciseCount}`
      : mainExercise;

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.metricRow}>
        <Metric
          icon="calendarOutline"
          label="날짜"
          value={formatPtLessonDate(lesson.date)}
        />
        <View style={styles.metricDivider} />
        <Metric
          icon="barbellOutline"
          label="세션"
          value={`${lesson.sessionNumber} Session`}
        />
        <View style={styles.metricDivider} />
        <Metric
          icon="trendingUpOutline"
          label="총 볼륨"
          value={
            totalVolumeKg > 0
              ? `${totalVolumeKg.toLocaleString()}kg`
              : exerciseLabel
          }
        />
      </View>

      {lesson.bodyParts.length > 0 ? (
        <View style={styles.tagRow}>
          {lesson.bodyParts.map((bodyPart) => (
            <View key={bodyPart} style={styles.tag}>
              <Text style={styles.tagLabel}>{bodyPart}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
});

function Metric({
  icon,
  label,
  value,
}: {
  icon: OriginalAppIconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricHeader}>
        <OriginalAppIcon color={Colors.textMuted} name={icon} size={13} />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metric: {
    flex: 1,
    gap: 6,
  },
  metricDivider: {
    backgroundColor: Colors.divider,
    height: 36,
    marginHorizontal: 12,
    width: 1,
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.84,
  },
  tag: {
    backgroundColor: Colors.inputBg,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  tagRow: {
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 10,
    paddingTop: 10,
  },
});
