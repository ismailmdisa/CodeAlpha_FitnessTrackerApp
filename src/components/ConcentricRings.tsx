import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Flame } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

interface ConcentricRingsProps {
  calories: number;
  caloriesGoal: number;
  activeMinutes: number;
  activeMinutesGoal: number;
  standHours?: number;
  standHoursGoal?: number;
}

export const ConcentricRings: React.FC<ConcentricRingsProps> = ({
  calories,
  caloriesGoal = 600,
  activeMinutes,
  activeMinutesGoal = 45,
  standHours = 11,
  standHoursGoal = 12,
}) => {
  const calRatio = Math.min(Math.max(calories / Math.max(caloriesGoal, 1), 0), 1);
  const actRatio = Math.min(Math.max(activeMinutes / Math.max(activeMinutesGoal, 1), 0), 1);
  const stdRatio = Math.min(Math.max(standHours / Math.max(standHoursGoal, 1), 0), 1);

  // Animated ratios
  const [animCal, setAnimCal] = useState(0);
  const [animAct, setAnimAct] = useState(0);
  const [animStd, setAnimStd] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1000;
    const startCal = animCal;
    const startAct = animAct;
    const startStd = animStd;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

      setAnimCal(startCal + (calRatio - startCal) * ease);
      setAnimAct(startAct + (actRatio - startAct) * ease);
      setAnimStd(startStd + (stdRatio - startStd) * ease);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [calRatio, actRatio, stdRatio]);

  // Radii & Circumferences matching code.html
  // Outer (Move): r = 42
  const rMove = 42;
  const cMove = 2 * Math.PI * rMove; // 263.89
  const offsetMove = cMove * (1 - animCal);

  // Middle (Exercise): r = 32
  const rAct = 32;
  const cAct = 2 * Math.PI * rAct; // 201.06
  const offsetAct = cAct * (1 - animAct);

  // Inner (Stand): r = 22
  const rStd = 22;
  const cStd = 2 * Math.PI * rStd; // 138.23
  const offsetStd = cStd * (1 - animStd);

  // Percentage overall
  const overallPct = Math.round(
    ((calories / Math.max(caloriesGoal, 1) +
      activeMinutes / Math.max(activeMinutesGoal, 1)) /
      2) *
      100
  );

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.categoryLabel}>METABOLIC OUTPUT</Text>
          <Text style={styles.sectionTitle}>Today's Kinematics</Text>
        </View>
        <View style={styles.targetBadge}>
          <Text style={styles.targetBadgeText}>{overallPct}% of Daily Target</Text>
        </View>
      </View>

      {/* Rings & Breakdown Row */}
      <View style={styles.contentRow}>
        {/* SVG Concentric Rings */}
        <View style={styles.svgWrapper}>
          <Svg
            width={112}
            height={112}
            viewBox="0 0 100 100"
            style={styles.svg}
          >
            <G rotation="-90" origin="50, 50">
              {/* Outer: Move Track & Progress */}
              <Circle
                cx="50"
                cy="50"
                r={rMove}
                stroke={COLORS.surfaceHighest}
                strokeWidth={7}
                fill="transparent"
              />
              <Circle
                cx="50"
                cy="50"
                r={rMove}
                stroke={COLORS.ringMove}
                strokeWidth={7}
                strokeDasharray={`${cMove} ${cMove}`}
                strokeDashoffset={offsetMove}
                strokeLinecap="round"
                fill="transparent"
              />

              {/* Middle: Active Track & Progress */}
              <Circle
                cx="50"
                cy="50"
                r={rAct}
                stroke={COLORS.surfaceHighest}
                strokeWidth={6.5}
                fill="transparent"
              />
              <Circle
                cx="50"
                cy="50"
                r={rAct}
                stroke={COLORS.ringExercise}
                strokeWidth={6.5}
                strokeDasharray={`${cAct} ${cAct}`}
                strokeDashoffset={offsetAct}
                strokeLinecap="round"
                fill="transparent"
              />

              {/* Inner: Stand Track & Progress */}
              <Circle
                cx="50"
                cy="50"
                r={rStd}
                stroke={COLORS.surfaceHighest}
                strokeWidth={6}
                fill="transparent"
              />
              <Circle
                cx="50"
                cy="50"
                r={rStd}
                stroke={COLORS.ringStand}
                strokeWidth={6}
                strokeDasharray={`${cStd} ${cStd}`}
                strokeDashoffset={offsetStd}
                strokeLinecap="round"
                fill="transparent"
              />
            </G>
          </Svg>

          {/* Center Flame Icon */}
          <View style={styles.centerIcon}>
            <Flame size={20} color={COLORS.primary} fill={COLORS.primary} />
          </View>
        </View>

        {/* Ring Metric Details */}
        <View style={styles.metricsColumn}>
          {/* Move / Calories */}
          <View style={styles.metricRow}>
            <View style={styles.labelGroup}>
              <View style={[styles.colorDot, { backgroundColor: COLORS.ringMove }]} />
              <Text style={styles.metricName}>Move</Text>
            </View>
            <View style={styles.valueGroup}>
              <Text style={styles.metricValue}>{calories}</Text>
              <Text style={styles.metricTarget}> / {caloriesGoal} kcal</Text>
            </View>
          </View>

          {/* Exercise / Active Time */}
          <View style={styles.metricRow}>
            <View style={styles.labelGroup}>
              <View style={[styles.colorDot, { backgroundColor: COLORS.ringExercise }]} />
              <Text style={styles.metricName}>Exercise</Text>
            </View>
            <View style={styles.valueGroup}>
              <Text style={styles.metricValue}>{activeMinutes}</Text>
              <Text style={styles.metricTarget}> / {activeMinutesGoal} min</Text>
            </View>
          </View>

          {/* Stand / Activity Hours */}
          <View style={styles.metricRow}>
            <View style={styles.labelGroup}>
              <View style={[styles.colorDot, { backgroundColor: COLORS.ringStand }]} />
              <Text style={styles.metricName}>Stand</Text>
            </View>
            <View style={styles.valueGroup}>
              <Text style={styles.metricValue}>{standHours}</Text>
              <Text style={styles.metricTarget}> / {standHoursGoal} hrs</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  targetBadge: {
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSecondaryContainer,
    letterSpacing: 0.2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  svgWrapper: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  centerIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsColumn: {
    flex: 1,
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  metricName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  metricTarget: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
