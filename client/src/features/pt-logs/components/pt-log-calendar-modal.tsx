import { ChevronLeft, ChevronRight } from 'lucide-react-native';
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
import Colors, { iosShadow } from 'shared/constants/colors';
import { KOREAN_DAYS } from '../data/pt-log-options';
import { formatShortPtDate } from '../lib/pt-log-format';
import type { PtDateRange } from '../types/pt-log';

type PtLogCalendarModalProps = {
  appliedRange: PtDateRange;
  markedDates: Set<string>;
  onApply: (range: PtDateRange) => void;
  onClear: () => void;
  onClose: () => void;
  visible: boolean;
};

export function PtLogCalendarModal({
  appliedRange,
  markedDates,
  onApply,
  onClear,
  onClose,
  visible,
}: PtLogCalendarModalProps) {
  const { width } = useWindowDimensions();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [localRange, setLocalRange] = useState<PtDateRange>(appliedRange);

  useEffect(() => {
    if (visible) {
      setLocalRange(appliedRange);
    }
  }, [appliedRange, visible]);

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const items: Array<{ day: number | null; key: string }> = [];

    for (let blankIndex = 0; blankIndex < firstDay; blankIndex += 1) {
      items.push({
        day: null,
        key: `blank-${viewYear}-${viewMonth}-${blankIndex}`,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      items.push({
        day,
        key: `day-${viewYear}-${viewMonth}-${day}`,
      });
    }

    while (items.length % 7 !== 0) {
      items.push({
        day: null,
        key: `tail-${viewYear}-${viewMonth}-${items.length}`,
      });
    }

    return items;
  }, [viewMonth, viewYear]);

  const calendarWidth = Math.min(width - 48, 360);
  const cellSize = Math.floor((calendarWidth - 32) / 7);
  const hasSelection = Boolean(localRange.start);
  const isRangeMode = Boolean(
    localRange.start && localRange.end && localRange.start !== localRange.end,
  );
  const hintText = !localRange.start
    ? '시작 날짜를 선택하세요'
    : !localRange.end
      ? '종료 날짜를 선택하세요'
      : `${formatShortPtDate(localRange.start)} ~ ${formatShortPtDate(localRange.end)}`;

  const selectDate = (dateString: string) => {
    if (!localRange.start || localRange.end) {
      setLocalRange({ end: null, start: dateString });
      return;
    }

    if (dateString === localRange.start) {
      setLocalRange({ end: dateString, start: dateString });
      return;
    }

    if (dateString > localRange.start) {
      setLocalRange({ end: dateString, start: localRange.start });
      return;
    }

    setLocalRange({ end: null, start: dateString });
  };

  const changeMonth = (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      if (viewMonth === 1) {
        setViewYear((currentYear) => currentYear - 1);
        setViewMonth(12);
        return;
      }

      setViewMonth((currentMonth) => currentMonth - 1);
      return;
    }

    if (viewMonth === 12) {
      setViewYear((currentYear) => currentYear + 1);
      setViewMonth(1);
      return;
    }

    setViewMonth((currentMonth) => currentMonth + 1);
  };

  const isInRange = (dateString: string) =>
    Boolean(
      localRange.start &&
        localRange.end &&
        dateString > localRange.start &&
        dateString < localRange.end,
    );

  return (
    <Modal onRequestClose={onClose} transparent visible={visible}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.sheet, { width: calendarWidth }]}>
            <View style={styles.monthRow}>
              <Pressable
                hitSlop={8}
                onPress={() => changeMonth('prev')}
                style={styles.navButton}
              >
                <ChevronLeft color={Colors.text} size={20} />
              </Pressable>
              <Text style={styles.monthTitle}>
                {viewYear}년 {viewMonth}월
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => changeMonth('next')}
                style={styles.navButton}
              >
                <ChevronRight color={Colors.text} size={20} />
              </Pressable>
            </View>

            <Text style={styles.hintText}>{hintText}</Text>

            <View style={styles.weekRow}>
              {KOREAN_DAYS.map((dayLabel, index) => (
                <View
                  key={dayLabel}
                  style={[styles.weekCell, { width: cellSize }]}
                >
                  <Text
                    style={[
                      styles.weekLabel,
                      index === 0 && styles.sundayLabel,
                      index === 6 && styles.saturdayLabel,
                    ]}
                  >
                    {dayLabel}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((cell) => {
                const { day, key } = cell;

                if (!day) {
                  return (
                    <View
                      key={key}
                      style={{ height: cellSize + 8, width: cellSize }}
                    />
                  );
                }

                const dateString = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const selected =
                  dateString === localRange.start ||
                  dateString === localRange.end;
                const todayString = new Date().toISOString().slice(0, 10);
                const hasRecord = markedDates.has(dateString);

                return (
                  <View
                    key={dateString}
                    style={{ height: cellSize + 8, width: cellSize }}
                  >
                    {isInRange(dateString) ? (
                      <View
                        style={[styles.rangeBackground, { width: cellSize }]}
                      />
                    ) : null}
                    {dateString === localRange.start && isRangeMode ? (
                      <View
                        style={[
                          styles.rangeCapLeft,
                          { left: cellSize / 2, width: cellSize / 2 },
                        ]}
                      />
                    ) : null}
                    {dateString === localRange.end && isRangeMode ? (
                      <View
                        style={[
                          styles.rangeCapRight,
                          { right: cellSize / 2, width: cellSize / 2 },
                        ]}
                      />
                    ) : null}
                    <Pressable
                      onPress={() => selectDate(dateString)}
                      style={[
                        styles.dayCell,
                        {
                          borderRadius: cellSize / 2,
                          height: cellSize,
                          width: cellSize,
                        },
                        selected && styles.selectedDayCell,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayLabel,
                          selected && styles.selectedDayLabel,
                          !selected &&
                            isInRange(dateString) &&
                            styles.inRangeDayLabel,
                          !selected &&
                            dateString === todayString &&
                            styles.todayDayLabel,
                        ]}
                      >
                        {day}
                      </Text>
                      {hasRecord ? (
                        <View
                          style={[
                            styles.dot,
                            selected
                              ? styles.selectedDot
                              : dateString === todayString
                                ? styles.todayDot
                                : undefined,
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
  dayLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  dot: {
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
    bottom: 4,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hintText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  inRangeDayLabel: {
    color: Colors.accent,
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
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
  saturdayLabel: {
    color: Colors.info,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  selectedDayCell: {
    backgroundColor: Colors.accent,
  },
  selectedDayLabel: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
  },
  selectedDot: {
    backgroundColor: '#FFFFFF99',
  },
  sheet: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
  },
  sundayLabel: {
    color: Colors.danger,
  },
  todayDayLabel: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
  },
  todayDot: {
    backgroundColor: Colors.accent,
  },
  weekCell: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
});
