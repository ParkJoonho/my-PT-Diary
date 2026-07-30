import { Fragment, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { WorkoutReportSummaryDto } from 'shared/api/generated/models';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { useWorkoutReportStore } from '../stores/use-workout-report-store';
import {
  WORKOUT_REPORT_TABS,
  formatShortDate,
  getWorkoutReportInsight,
} from './report-format';

type TrendPoint = {
  date: string;
  label?: string;
  value: number;
};

type DualTrendPoint = {
  date: string;
  value1: number;
  value2: number;
};

export function WorkoutReportChartSection({
  summary,
}: {
  summary: WorkoutReportSummaryDto;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const activeTab = useWorkoutReportStore((state) => state.activeTab);
  const setActiveTab = useWorkoutReportStore((state) => state.setActiveTab);
  const chartWidth = Math.min(screenWidth - 40, 500);
  const chartHeight = 220;

  const bodyCompositionData = useMemo<DualTrendPoint[]>(
    () =>
      summary.bodyCompositionTrend.map((item) => ({
        date: item.date,
        value1: item.skeletalMuscleMassKg ?? 0,
        value2: item.bodyFatPercentage ?? 0,
      })),
    [summary.bodyCompositionTrend],
  );

  const frequencyData = useMemo<TrendPoint[]>(
    () =>
      summary.weeklyFrequency.map((item) => ({
        date: item.weekStartDate,
        label: formatShortDate(item.weekStartDate),
        value: item.workoutRecordCount,
      })),
    [summary.weeklyFrequency],
  );

  const insightText = getWorkoutReportInsight(summary, activeTab);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.tabContent}
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
      >
        {WORKOUT_REPORT_TABS.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <OriginalAppIcon
                color={active ? Colors.white : Colors.textSecondary}
                name={tab.icon}
                size={16}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  active && styles.tabButtonTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.chartCard}>
        {activeTab === 'volume' ? (
          <LineChart
            color={Colors.accent}
            data={summary.volumeTrend}
            height={chartHeight}
            label="운동 볼륨 추이 (kg)"
            unit="kg"
            width={chartWidth}
          />
        ) : null}

        {activeTab === 'weight' ? (
          <LineChart
            color={Colors.info}
            data={summary.weightTrend}
            height={chartHeight}
            label="체중 변화 (kg)"
            unit="kg"
            width={chartWidth}
          />
        ) : null}

        {activeTab === 'bodyComp' ? (
          <DualLineChart
            color1={Colors.success}
            color2={Colors.warning}
            data={bodyCompositionData}
            height={chartHeight}
            label="체성분 변화"
            legend1="골격근량 (kg)"
            legend2="체지방률 (%)"
            width={chartWidth}
          />
        ) : null}

        {activeTab === 'condition' ? (
          <LineChart
            color={Colors.score5}
            data={summary.conditionTrend}
            height={chartHeight}
            label="컨디션 점수 추이"
            unit="점"
            width={chartWidth}
          />
        ) : null}

        {activeTab === 'frequency' ? (
          <BarChart
            color={Colors.success}
            data={frequencyData}
            height={chartHeight}
            label="주간 운동 빈도 (회)"
            unit="회"
            width={chartWidth}
          />
        ) : null}
      </View>

      {insightText ? (
        <View style={styles.insightCard}>
          <OriginalAppIcon color="#D4AF37" name="lightbulbOutline" size={18} />
          <Text style={styles.insightText}>{insightText}</Text>
        </View>
      ) : null}
    </View>
  );
}

function LineChart({
  color,
  data,
  height,
  label,
  unit,
  width,
}: {
  color: string;
  data: TrendPoint[];
  height: number;
  label: string;
  unit: string;
  width: number;
}) {
  if (!data.length) {
    return <EmptyChart height={height} width={width} />;
  }

  const padding = { top: 20, right: 16, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const yMin = minValue - range * 0.1;
  const yMax = maxValue + range * 0.1;
  const yRange = yMax - yMin || 1;
  const points = data.map((item, index) => ({
    ...item,
    x:
      padding.left +
      (data.length === 1
        ? chartWidth / 2
        : (index / (data.length - 1)) * chartWidth),
    y: padding.top + chartHeight - ((item.value - yMin) / yRange) * chartHeight,
  }));
  const pathD =
    points.length < 2
      ? ''
      : points
          .map((point, index) =>
            index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`,
          )
          .join(' ');
  const areaD = pathD
    ? `${pathD} L${points.at(-1)?.x ?? 0},${padding.top + chartHeight} L${
        points[0]?.x ?? 0
      },${padding.top + chartHeight} Z`
    : '';
  const yTicks = Array.from(
    { length: 5 },
    (_, index) => yMin + (yRange / 4) * index,
  );
  const step = Math.max(1, Math.floor(data.length / Math.min(data.length, 6)));
  const average =
    values.reduce((total, value) => total + value, 0) / values.length;

  return (
    <View>
      <Text style={chartStyles.chartLabel}>{label}</Text>
      <Svg height={height} width={width}>
        <Defs>
          <LinearGradient id={`line-${label}`} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {yTicks.map((value, index) => {
          const y =
            padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;

          return (
            <Fragment key={String(index)}>
              <Line
                stroke={Colors.divider}
                strokeWidth={1}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <SvgText
                fill={Colors.textMuted}
                fontSize={10}
                textAnchor="end"
                x={padding.left - 6}
                y={y + 4}
              >
                {formatAxisValue(value)}
              </SvgText>
            </Fragment>
          );
        })}

        {areaD ? <Path d={areaD} fill={`url(#line-${label})`} /> : null}
        {pathD ? (
          <Path
            d={pathD}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
          />
        ) : null}

        {points.map((point) => (
          <Circle
            cx={point.x}
            cy={point.y}
            fill={Colors.white}
            key={`${point.date}-${point.value}`}
            r={4}
            stroke={color}
            strokeWidth={2}
          />
        ))}

        {data.map((item, index) => {
          if (index % step !== 0 && index !== data.length - 1) {
            return null;
          }

          const x =
            padding.left +
            (data.length === 1
              ? chartWidth / 2
              : (index / (data.length - 1)) * chartWidth);

          return (
            <SvgText
              fill={Colors.textMuted}
              fontSize={9}
              key={`${item.date}-${index}`}
              textAnchor="middle"
              x={x}
              y={height - 8}
            >
              {formatShortDate(item.date)}
            </SvgText>
          );
        })}
      </Svg>

      <View style={chartStyles.statRow}>
        <StatItem
          color={color}
          label="최근"
          value={formatStatValue(values.at(-1) ?? 0, unit)}
        />
        <StatItem label="최고" value={formatStatValue(maxValue, unit)} />
        <StatItem label="최저" value={formatStatValue(minValue, unit)} />
        <StatItem label="평균" value={formatStatValue(average, unit)} />
      </View>
    </View>
  );
}

function DualLineChart({
  color1,
  color2,
  data,
  height,
  label,
  legend1,
  legend2,
  width,
}: {
  color1: string;
  color2: string;
  data: DualTrendPoint[];
  height: number;
  label: string;
  legend1: string;
  legend2: string;
  width: number;
}) {
  if (!data.length) {
    return <EmptyChart height={height} width={width} />;
  }

  const padding = { top: 20, right: 16, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = [
    ...data.map((item) => item.value1),
    ...data.map((item) => item.value2),
  ].filter((value) => value > 0);

  if (!values.length) {
    return <EmptyChart height={height} width={width} />;
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const yMin = minValue - range * 0.1;
  const yMax = maxValue + range * 0.1;
  const yRange = yMax - yMin || 1;
  const toPoint = (value: number, index: number) => ({
    x:
      padding.left +
      (data.length === 1
        ? chartWidth / 2
        : (index / (data.length - 1)) * chartWidth),
    y: padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight,
  });
  const points1 = data
    .map((item, index) => ({ index, value: item.value1 }))
    .filter((item) => item.value > 0)
    .map((item) => toPoint(item.value, item.index));
  const points2 = data
    .map((item, index) => ({ index, value: item.value2 }))
    .filter((item) => item.value > 0)
    .map((item) => toPoint(item.value, item.index));
  const toPath = (points: Array<{ x: number; y: number }>) =>
    points
      .map((point, index) =>
        index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`,
      )
      .join(' ');
  const yTicks = Array.from(
    { length: 5 },
    (_, index) => yMin + (yRange / 4) * index,
  );
  const step = Math.max(1, Math.floor(data.length / Math.min(data.length, 6)));

  return (
    <View>
      <Text style={chartStyles.chartLabel}>{label}</Text>
      <View style={chartStyles.legendRow}>
        <LegendItem color={color1} label={legend1} />
        <LegendItem color={color2} label={legend2} />
      </View>

      <Svg height={height} width={width}>
        {yTicks.map((value, index) => {
          const y =
            padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;

          return (
            <Fragment key={String(index)}>
              <Line
                stroke={Colors.divider}
                strokeWidth={1}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <SvgText
                fill={Colors.textMuted}
                fontSize={10}
                textAnchor="end"
                x={padding.left - 6}
                y={y + 4}
              >
                {value.toFixed(1)}
              </SvgText>
            </Fragment>
          );
        })}

        {points1.length > 1 ? (
          <Path
            d={toPath(points1)}
            fill="none"
            stroke={color1}
            strokeLinecap="round"
            strokeWidth={2.5}
          />
        ) : null}
        {points2.length > 1 ? (
          <Path
            d={toPath(points2)}
            fill="none"
            stroke={color2}
            strokeLinecap="round"
            strokeWidth={2.5}
          />
        ) : null}

        {points1.map((point, index) => (
          <Circle
            cx={point.x}
            cy={point.y}
            fill={Colors.white}
            key={`point-1-${String(index)}`}
            r={3.5}
            stroke={color1}
            strokeWidth={2}
          />
        ))}
        {points2.map((point, index) => (
          <Circle
            cx={point.x}
            cy={point.y}
            fill={Colors.white}
            key={`point-2-${String(index)}`}
            r={3.5}
            stroke={color2}
            strokeWidth={2}
          />
        ))}

        {data.map((item, index) => {
          if (index % step !== 0 && index !== data.length - 1) {
            return null;
          }

          const x =
            padding.left +
            (data.length === 1
              ? chartWidth / 2
              : (index / (data.length - 1)) * chartWidth);

          return (
            <SvgText
              fill={Colors.textMuted}
              fontSize={9}
              key={`${item.date}-${index}`}
              textAnchor="middle"
              x={x}
              y={height - 8}
            >
              {formatShortDate(item.date)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

function BarChart({
  color,
  data,
  height,
  label,
  unit,
  width,
}: {
  color: string;
  data: TrendPoint[];
  height: number;
  label: string;
  unit: string;
  width: number;
}) {
  if (!data.length) {
    return <EmptyChart height={height} width={width} />;
  }

  const padding = { top: 20, right: 16, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.map((item) => item.value);
  const maxValue = Math.max(...values, 1);
  const barGap = 4;
  const barWidth = Math.min(
    32,
    (chartWidth - barGap * (data.length - 1)) / data.length,
  );
  const totalWidth = data.length * barWidth + (data.length - 1) * barGap;
  const offsetX = padding.left + (chartWidth - totalWidth) / 2;
  const yTicks = Array.from(
    { length: 5 },
    (_, index) => (maxValue / 4) * index,
  );
  const average =
    values.reduce((total, value) => total + value, 0) / values.length;

  return (
    <View>
      <Text style={chartStyles.chartLabel}>{label}</Text>
      <Svg height={height} width={width}>
        <Defs>
          <LinearGradient id={`bar-${label}`} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.9" />
            <Stop offset="1" stopColor={color} stopOpacity="0.5" />
          </LinearGradient>
        </Defs>

        {yTicks.map((value, index) => {
          const y =
            padding.top + chartHeight - (value / maxValue) * chartHeight;

          return (
            <Fragment key={String(index)}>
              <Line
                stroke={Colors.divider}
                strokeWidth={1}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <SvgText
                fill={Colors.textMuted}
                fontSize={10}
                textAnchor="end"
                x={padding.left - 6}
                y={y + 4}
              >
                {Number.isInteger(value) ? value.toString() : value.toFixed(1)}
              </SvgText>
            </Fragment>
          );
        })}

        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = offsetX + index * (barWidth + barGap);
          const y = padding.top + chartHeight - barHeight;

          return (
            <Fragment key={`${item.date}-${index}`}>
              <Rect
                fill={`url(#bar-${label})`}
                height={barHeight}
                rx={3}
                width={barWidth}
                x={x}
                y={y}
              />
              <SvgText
                fill={Colors.textMuted}
                fontSize={9}
                textAnchor="middle"
                x={x + barWidth / 2}
                y={height - 8}
              >
                {item.label ?? formatShortDate(item.date)}
              </SvgText>
            </Fragment>
          );
        })}
      </Svg>

      <View style={chartStyles.statRow}>
        <StatItem
          color={color}
          label="총합"
          value={formatStatValue(
            values.reduce((total, value) => total + value, 0),
            unit,
          )}
        />
        <StatItem label="평균" value={formatStatValue(average, unit)} />
      </View>
    </View>
  );
}

function EmptyChart({ height, width }: { height: number; width: number }) {
  return (
    <View style={[chartStyles.emptyChart, { height, width }]}>
      <OriginalAppIcon
        color={Colors.textMuted}
        name="analyticsOutline"
        size={28}
      />
      <Text style={chartStyles.emptyText}>데이터가 없어요</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={chartStyles.legendItem}>
      <View style={[chartStyles.legendDot, { backgroundColor: color }]} />
      <Text style={chartStyles.legendText}>{label}</Text>
    </View>
  );
}

function StatItem({
  color,
  label,
  value,
}: {
  color?: string;
  label: string;
  value: string;
}) {
  return (
    <View style={chartStyles.statItem}>
      <Text style={chartStyles.statLabel}>{label}</Text>
      <Text style={[chartStyles.statValue, color ? { color } : null]}>
        {value}
      </Text>
    </View>
  );
}

function formatAxisValue(value: number) {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function formatStatValue(value: number, unit: string) {
  return `${value.toFixed(1)}${unit}`;
}

const chartStyles = StyleSheet.create({
  chartLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyChart: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  legendDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  statRow: {
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
  },
  statValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 16,
  },
  insightCard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFDF5',
    borderColor: '#F0E6C8',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 14,
  },
  insightText: {
    color: Colors.text,
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  tabButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabButtonText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: Colors.white,
  },
  tabContent: {
    gap: 8,
    paddingHorizontal: 20,
  },
  tabScroll: {
    marginBottom: 16,
  },
  wrap: {},
});
