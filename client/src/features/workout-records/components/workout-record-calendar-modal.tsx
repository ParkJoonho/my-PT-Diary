import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Colors from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';
import {
  DAY_KO,
  formatShortDate,
  type DateRange,
} from '../lib/workout-record-list-metadata';

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function WorkoutRecordCalendarModal({
  appliedRange,
  markedDates,
  onApply,
  onClear,
  onClose,
  visible,
}: {
  appliedRange: DateRange;
  markedDates: Set<string>;
  onApply: (range: DateRange) => void;
  onClear: () => void;
  onClose: () => void;
  visible: boolean;
}) {
  const { width } = useWindowDimensions();
  const today = getClientTodayDate();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [localRange, setLocalRange] = useState<DateRange>(appliedRange);
  const calendarWidth = Math.min(width - 48, 360);
  const cellWidth = Math.floor((calendarWidth - 32) / 7);

  useEffect(() => {
    if (visible) {
      setLocalRange(appliedRange);
    }
  }, [appliedRange, visible]);

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const result: Array<number | null> = Array(firstDay).fill(null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(day);
    }

    while (result.length % 7 !== 0) {
      result.push(null);
    }

    return result;
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((current) => current - 1);
      setViewMonth(12);
      return;
    }

    setViewMonth((current) => current - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((current) => current + 1);
      setViewMonth(1);
      return;
    }

    setViewMonth((current) => current + 1);
  };

  const handleDayPress = (date: string) => {
    if (!localRange.start || localRange.end) {
      setLocalRange({ end: null, start: date });
      return;
    }

    if (date === localRange.start) {
      setLocalRange({ end: date, start: date });
      return;
    }

    if (date > localRange.start) {
      setLocalRange({ end: date, start: localRange.start });
      return;
    }

    setLocalRange({ end: null, start: date });
  };

  const hintText = !localRange.start
    ? '시작 날짜를 선택하세요'
    : !localRange.end
      ? '종료 날짜를 선택하세요'
      : `${formatShortDate(localRange.start)} ~ ${formatShortDate(localRange.end)}`;
  const hasSelection = !!localRange.start;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.overlay}>
        <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()}>
          <View style={[styles.sheet, { width: calendarWidth }]}>
            <View style={styles.monthRow}>
              <Pressable onPress={prevMonth} style={styles.navButton}>
                <Text style={styles.navButtonText}>{'<'}</Text>
              </Pressable>
              <Text style={styles.monthTitle}>
                {viewYear}년 {viewMonth}월
              </Text>
              <Pressable onPress={nextMonth} style={styles.navButton}>
                <Text style={styles.navButtonText}>{'>'}</Text>
              </Pressable>
            </View>

            <Text style={styles.hint}>{hintText}</Text>

            <View style={styles.weekRow}>
              {DAY_KO.map((day, index) => (
                <View key={day} style={[styles.weekCell, { width: cellWidth }]}>
                  <Text
                    style={[
                      styles.weekText,
                      index === 0 && styles.sundayText,
                      index === 6 && styles.saturdayText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (!day) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={{ height: cellWidth + 8, width: cellWidth }}
                    />
                  );
                }

                const date = toDateString(viewYear, viewMonth, day);
                const isStart = date === localRange.start;
                const isEnd = date === localRange.end;
                const isSelected = isStart || isEnd;
                const isInRange =
                  !!localRange.start &&
                  !!localRange.end &&
                  date > localRange.start &&
                  date < localRange.end;
                const hasRecord = markedDates.has(date);

                return (
                  <View
                    key={date}
                    style={{ height: cellWidth + 8, width: cellWidth }}
                  >
                    {isInRange ? (
                      <View style={[styles.rangeBackground, { width: cellWidth }]} />
                    ) : null}
                    <Pressable
                      onPress={() => handleDayPress(date)}
                      style={[
                        styles.dayCell,
                        {
                          height: cellWidth,
                          width: cellWidth,
                        },
                        isSelected && {
                          backgroundColor: Colors.accent,
                          borderRadius: cellWidth / 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          !isSelected && date === today && styles.dayTextToday,
                        ]}
                      >
                        {day}
                      </Text>
                      {hasRecord ? (
                        <View
                          style={[
                            styles.dot,
                            {
                              backgroundColor: isSelected
                                ? '#FFFFFF99'
                                : isInRange || date === today
                                  ? Colors.accent
                                  : Colors.textMuted,
                            },
                          ]}
                        />
                      ) : null}
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => {
                  onClear();
                  onClose();
                }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>전체 보기</Text>
              </Pressable>
              <Pressable
                disabled={!hasSelection}
                onPress={() => {
                  if (!hasSelection) {
                    return;
                  }

                  onApply(localRange);
                  onClose();
                }}
                style={[
                  styles.primaryButton,
                  !hasSelection && styles.primaryButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    !hasSelection && styles.primaryButtonTextDisabled,
                  ]}
                >
                  적용
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  dayTextSelected: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
  },
  dayTextToday: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
  },
  dot: {
    borderRadius: 2,
    bottom: 2,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hint: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  monthTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  navButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  navButtonText: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: '#00000055',
    flex: 1,
    justifyContent: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.inputBg,
  },
  primaryButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  primaryButtonTextDisabled: {
    color: Colors.textMuted,
  },
  rangeBackground: {
    backgroundColor: `${Colors.accent}1A`,
    bottom: 4,
    position: 'absolute',
    top: 4,
  },
  saturdayText: {
    color: '#007AFF',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  sheet: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  sundayText: {
    color: '#FF3B30',
  },
  weekCell: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  weekText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
});
