import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SemanticIcon } from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';
import {
  DAY_KO,
  type DateRange,
  formatShortDate,
} from '../lib/condition-record-metadata';

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function ConditionCalendarModal({
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [localRange, setLocalRange] = useState<DateRange>(appliedRange);

  useEffect(() => {
    if (visible) {
      setLocalRange(appliedRange);
    }
  }, [appliedRange, visible]);

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const result: Array<{ day: number | null; key: string }> = [];

    for (let emptyIndex = 0; emptyIndex < firstDay; emptyIndex += 1) {
      result.push({
        day: null,
        key: `empty-leading-${viewYear}-${viewMonth}-${emptyIndex}`,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push({
        day,
        key: `day-${viewYear}-${viewMonth}-${day}`,
      });
    }

    let trailingIndex = 0;

    while (result.length % 7 !== 0) {
      result.push({
        day: null,
        key: `empty-trailing-${viewYear}-${viewMonth}-${trailingIndex}`,
      });
      trailingIndex += 1;
    }

    return result;
  }, [viewMonth, viewYear]);

  const calendarWidth = Math.min(width - 48, 360);
  const cellWidth = Math.floor((calendarWidth - 32) / 7);
  const today = getClientTodayDate();

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
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(event) => event.stopPropagation()}
        >
          <View
            style={[
              styles.sheet,
              { marginTop: insets.top + 90, width: calendarWidth },
            ]}
          >
            <View style={styles.monthRow}>
              <Pressable
                hitSlop={8}
                onPress={prevMonth}
                style={styles.navButton}
              >
                <SemanticIcon
                  color={Colors.text}
                  name="chevronLeft"
                  size={20}
                />
              </Pressable>
              <Text style={styles.monthTitle}>
                {viewYear}년 {viewMonth}월
              </Text>
              <Pressable
                hitSlop={8}
                onPress={nextMonth}
                style={styles.navButton}
              >
                <SemanticIcon
                  color={Colors.text}
                  name="chevronRight"
                  size={20}
                />
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
              {cells.map((cell, cellIndex) => {
                if (!cell.day) {
                  return (
                    <View
                      key={cell.key}
                      style={{ height: cellWidth + 8, width: cellWidth }}
                    />
                  );
                }

                const date = toDateString(viewYear, viewMonth, cell.day);
                const isStart = date === localRange.start;
                const isEnd = date === localRange.end;
                const isSelected = isStart || isEnd;
                const isInRange =
                  !!localRange.start &&
                  !!localRange.end &&
                  date > localRange.start &&
                  date < localRange.end;
                const hasRecord = markedDates.has(date);
                const isRangeMode = Boolean(
                  localRange.start &&
                    localRange.end &&
                    localRange.start !== localRange.end,
                );
                const isSunday = cellIndex % 7 === 0;
                const isSaturday = cellIndex % 7 === 6;

                return (
                  <View
                    key={cell.key}
                    style={{ height: cellWidth + 8, width: cellWidth }}
                  >
                    {isInRange ? (
                      <View
                        style={[styles.rangeBackground, { width: cellWidth }]}
                      />
                    ) : null}
                    {isStart && isRangeMode ? (
                      <View
                        style={[
                          styles.rangeCapLeft,
                          { left: cellWidth / 2, width: cellWidth / 2 },
                        ]}
                      />
                    ) : null}
                    {isEnd && isRangeMode ? (
                      <View
                        style={[
                          styles.rangeCapRight,
                          { right: cellWidth / 2, width: cellWidth / 2 },
                        ]}
                      />
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
                          !isSelected && isInRange && styles.dayTextInRange,
                          !isSelected && date === today && styles.dayTextToday,
                          !isSelected &&
                            !isInRange &&
                            isSunday &&
                            styles.sundayText,
                          !isSelected &&
                            !isInRange &&
                            isSaturday &&
                            styles.saturdayText,
                        ]}
                      >
                        {cell.day}
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
  dayTextInRange: {
    color: Colors.accent,
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
  overlay: {
    alignItems: 'center',
    backgroundColor: '#00000055',
    flex: 1,
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
  rangeCapLeft: {
    backgroundColor: `${Colors.accent}1A`,
    bottom: 4,
    position: 'absolute',
    right: 0,
    top: 4,
  },
  rangeCapRight: {
    backgroundColor: `${Colors.accent}1A`,
    bottom: 4,
    left: 0,
    position: 'absolute',
    top: 4,
  },
  saturdayText: {
    color: Colors.info,
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
    elevation: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  sundayText: {
    color: Colors.danger,
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
