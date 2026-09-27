import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  G,
} from 'react-native-svg';
import { DayChartPoint } from '../types';
import { COLORS } from '../theme/colors';

interface InteractiveWaveChartProps {
  data: DayChartPoint[];
  metric: 'calories' | 'steps';
  goal?: number;
  periodLabel?: string;
}

export const InteractiveWaveChart: React.FC<InteractiveWaveChartProps> = ({
  data,
  metric = 'calories',
  goal = 600,
  periodLabel = 'This Week',
}) => {
  const [chartMode, setChartMode] = useState<'wave' | 'bars'>('wave');
  const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const animRef = useRef<number | null>(null);

  // Trigger smooth bloom animation on mount or when metric/data changes
  useEffect(() => {
    setSelectedIndex(data.length - 1);
    setAnimProgress(0);
    const startTime = Date.now();
    const duration = 750; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(ease);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [metric, data.length, chartMode]);

  const values = data.map((d) => (metric === 'calories' ? d.calories : d.steps));
  const rawMax = Math.max(...values, goal, 1);
  // Give 15% headroom above max
  const maxValue = rawMax * 1.15;

  // Selected item metrics
  const selectedItem = data[selectedIndex] || data[data.length - 1];
  const selectedValue = selectedItem
    ? (metric === 'calories' ? selectedItem.calories : selectedItem.steps)
    : 0;

  // Chart dimensions
  const chartWidth = 320;
  const chartHeight = 150;
  const padX = 22;
  const padBottom = 24;
  const padTop = 18;
  const usableWidth = chartWidth - padX * 2;
  const usableHeight = chartHeight - padTop - padBottom;

  // Calculate coordinates for points
  const points = data.map((item, i) => {
    const val = metric === 'calories' ? item.calories : item.steps;
    const x = padX + (i * usableWidth) / Math.max(data.length - 1, 1);
    // Animated y value
    const normalizedY = (val / maxValue) * animProgress;
    const y = chartHeight - padBottom - normalizedY * usableHeight;
    return { x, y, val, item, index: i };
  });

  // Calculate Goal Line Y
  const goalY = chartHeight - padBottom - ((goal / maxValue) * usableHeight);

  // Smooth Bézier Curve construction
  const buildSmoothPath = () => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath();
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padBottom} L ${points[0].x} ${chartHeight - padBottom} Z`
    : '';

  return (
    <View style={styles.cardContainer}>
      {/* Interactive Floating Inspection Header */}
      <View style={styles.inspectionHeader}>
        <View>
          <Text style={styles.inspectionDayLabel}>
            {selectedItem?.dayLabel} • {selectedItem?.date || periodLabel}
          </Text>
          <View style={styles.inspectionValueRow}>
            <Text style={styles.inspectionValue}>
              {selectedValue.toLocaleString()}{' '}
              <Text style={styles.inspectionUnit}>
                {metric === 'calories' ? 'kcal' : 'steps'}
              </Text>
            </Text>
            {selectedValue >= goal ? (
              <View style={styles.goalAchievedBadge}>
                <Text style={styles.goalAchievedText}>TARGET MET</Text>
              </View>
            ) : (
              <Text style={styles.goalPaceText}>
                {Math.round((selectedValue / Math.max(goal, 1)) * 100)}% of goal
              </Text>
            )}
          </View>
        </View>

        {/* Chart View Toggle: Real Wave Line vs Pillars */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, chartMode === 'wave' && styles.toggleBtnActive]}
            onPress={() => setChartMode('wave')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                chartMode === 'wave' && styles.toggleBtnTextActive,
              ]}
            >
              Wave 📈
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, chartMode === 'bars' && styles.toggleBtnActive]}
            onPress={() => setChartMode('bars')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                chartMode === 'bars' && styles.toggleBtnTextActive,
              ]}
            >
              Bars 📊
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SVG REAL GRAPH CONTAINER */}
      <View style={styles.svgWrapper}>
        {chartMode === 'wave' ? (
          <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <Defs>
              <LinearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={COLORS.primaryContainer} stopOpacity="0.45" />
                <Stop offset="70%" stopColor={COLORS.primaryContainer} stopOpacity="0.08" />
                <Stop offset="100%" stopColor={COLORS.surfaceCard} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Goal Dashed Line */}
            {goalY > padTop && (
              <G>
                <Line
                  x1={padX}
                  y1={goalY}
                  x2={chartWidth - padX}
                  y2={goalY}
                  stroke={COLORS.outline}
                  strokeWidth="1"
                  strokeDasharray="4, 4"
                  opacity={0.35}
                />
              </G>
            )}

            {/* Area Fill */}
            {areaPath !== '' && (
              <Path d={areaPath} fill="url(#waveGradient)" />
            )}

            {/* Smooth Bézier Stroke Line */}
            {linePath !== '' && (
              <Path
                d={linePath}
                stroke={COLORS.primary}
                strokeWidth="3.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Clickable Data Nodes */}
            {points.map((p) => {
              const isSelected = p.index === selectedIndex;
              const hasData = p.val > 0;

              return (
                <G key={`node-${p.index}`} onPress={() => setSelectedIndex(p.index)}>
                  {/* Invisible enlarged tap target */}
                  <Circle cx={p.x} cy={p.y} r={18} fill="transparent" />

                  {/* Halo ring for selected node */}
                  {isSelected && (
                    <Circle
                      cx={p.x}
                      cy={p.y}
                      r={9}
                      fill={COLORS.primaryContainer}
                      opacity={0.5}
                    />
                  )}

                  {/* Core node circle */}
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 5.5 : 4}
                    fill={isSelected ? COLORS.text : hasData ? COLORS.primary : COLORS.surfaceHighest}
                    stroke={COLORS.surfaceCard}
                    strokeWidth={2}
                  />
                </G>
              );
            })}
          </Svg>
        ) : (
          /* Animated Pillar Capsule Bars */
          <View style={styles.barsContainer}>
            {points.map((p) => {
              const isSelected = p.index === selectedIndex;
              const hasData = p.val > 0;
              const ratio = Math.min((p.val / maxValue) * animProgress, 1);
              const barHeightPct = Math.max(ratio * 100, hasData ? 14 : 6);

              return (
                <TouchableOpacity
                  key={`bar-${p.index}`}
                  style={styles.barCol}
                  activeOpacity={0.7}
                  onPress={() => setSelectedIndex(p.index)}
                >
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          backgroundColor: isSelected
                            ? COLORS.primaryContainer
                            : hasData
                            ? COLORS.primary
                            : COLORS.surfaceHighest,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Day Labels Row */}
        <View style={styles.daysLabelsRow}>
          {data.map((item, i) => {
            const isSelected = i === selectedIndex;
            return (
              <TouchableOpacity
                key={`lbl-${i}`}
                style={styles.dayLabelBtn}
                onPress={() => setSelectedIndex(i)}
              >
                <Text
                  style={[
                    styles.dayLabelText,
                    isSelected && styles.dayLabelTextSelected,
                  ]}
                >
                  {item.dayLabel}
                </Text>
                {isSelected && <View style={styles.selectedDayDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inspectionDayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  inspectionValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  inspectionValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  inspectionUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  goalAchievedBadge: {
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  goalAchievedText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.onSecondaryContainer,
    letterSpacing: 0.5,
  },
  goalPaceText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primaryContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  svgWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    marginTop: 4,
  },
  barsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 18,
    height: 110,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 9,
  },
  daysLabelsRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dayLabelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  dayLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  dayLabelTextSelected: {
    color: COLORS.text,
    fontWeight: '900',
  },
  selectedDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryContainer,
    marginTop: 2,
  },
});
