import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Flame,
  Clock,
  Compass,
  Check,
  TrendingUp,
  Activity as ActivityIcon,
  Zap,
  Target,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';
import { InteractiveWaveChart } from '../components/InteractiveWaveChart';

interface ProgressScreenProps {
  onOpenStreak: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ onOpenStreak }) => {
  const {
    chartData,
    chartPeriod,
    setChartPeriod,
    weekStats,
    todayStats,
    goals,
    streakInfo,
  } = useFitness();

  const [activeMetric, setActiveMetric] = useState<'calories' | 'steps'>('calories');

  // Smooth Entry Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  const [animatedCal, setAnimatedCal] = useState<number>(0);
  const [animatedDist, setAnimatedDist] = useState<number>(0);

  const targetDist = parseFloat((weekStats.totalSteps * 0.00078).toFixed(1)) || 0;
  const targetCal = weekStats.totalCalories || 0;

  useEffect(() => {
    // Fade and slide in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth counter animation
    const startTime = Date.now();
    const duration = 800; // ms

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedCal(Math.round(targetCal * ease));
      setAnimatedDist(parseFloat((targetDist * ease).toFixed(1)));

      if (progress >= 1) clearInterval(timer);
    }, 20);

    return () => clearInterval(timer);
  }, [weekStats.totalCalories, weekStats.totalSteps, chartPeriod]);

  // Daily average
  const daysWithData = chartData.filter((d) => (d.calories > 0 || d.steps > 0)).length || 1;
  const avgCalPerDay = Math.round(weekStats.totalCalories / Math.max(daysWithData, 1));

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTagRow}>
            <View style={styles.livePulse} />
            <Text style={styles.headerTag}>ANALYTICS & METRICS</Text>
          </View>
          <Text style={styles.headerTitle}>Progress Intelligence</Text>
        </View>

        <TouchableOpacity style={styles.streakBadge} onPress={onOpenStreak} activeOpacity={0.8}>
          <Flame size={15} color={COLORS.primary} fill={COLORS.primary} />
          <Text style={styles.streakBadgeText}>{streakInfo.currentStreak}d Streak</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector Tabs (Daily / Weekly / Monthly) */}
        <View style={styles.periodRow}>
          {(['daily', 'weekly', 'monthly'] as const).map((period) => {
            const isActive = chartPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                style={[styles.periodBtn, isActive && styles.periodBtnActive]}
                activeOpacity={0.8}
                onPress={() => setChartPeriod(period)}
              >
                <Text
                  style={[styles.periodBtnText, isActive && styles.periodBtnTextActive]}
                >
                  {period === 'daily' ? '7 Days' : period === 'weekly' ? '4 Weeks' : '6 Months'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Metric Selector Pills: Calories vs Steps */}
        <View style={styles.metricSelectRow}>
          <Text style={styles.metricSelectHeading}>DATA STREAM:</Text>
          <View style={styles.metricPillGroup}>
            <TouchableOpacity
              style={[
                styles.metricPill,
                activeMetric === 'calories' && styles.metricPillActive,
              ]}
              onPress={() => setActiveMetric('calories')}
            >
              <Flame size={12} color={activeMetric === 'calories' ? COLORS.text : COLORS.textMuted} />
              <Text
                style={[
                  styles.metricPillText,
                  activeMetric === 'calories' && styles.metricPillTextActive,
                ]}
              >
                Active Calories
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.metricPill,
                activeMetric === 'steps' && styles.metricPillActive,
              ]}
              onPress={() => setActiveMetric('steps')}
            >
              <TrendingUp size={12} color={activeMetric === 'steps' ? COLORS.text : COLORS.textMuted} />
              <Text
                style={[
                  styles.metricPillText,
                  activeMetric === 'steps' && styles.metricPillTextActive,
                ]}
              >
                Daily Steps
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. REAL GRAPH: Interactive SVG Bézier Curve & Area Wave Chart */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <InteractiveWaveChart
            data={chartData}
            metric={activeMetric}
            goal={activeMetric === 'calories' ? goals.calorie_target : goals.step_target}
            periodLabel={chartPeriod === 'daily' ? 'This Week' : chartPeriod === 'weekly' ? 'Last 4 Weeks' : 'Last 6 Months'}
          />
        </Animated.View>

        {/* 2. COMPACT, TIGHT TELEMETRY STATISTICS MATRIX ("statistics gula r o kache ashte pare") */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>PERFORMANCE AGGREGATION</Text>
          <Text style={styles.sectionPace}>{daysWithData} active {daysWithData === 1 ? 'day' : 'days'}</Text>
        </View>

        <View style={styles.compactStatsMatrix}>
          {/* Tile 1: Energy Output */}
          <View style={styles.statCell}>
            <View style={styles.statCellHeader}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(200, 224, 30, 0.25)' }]}>
                <Flame size={14} color={COLORS.primary} fill={COLORS.primary} />
              </View>
              <Text style={styles.statCellLabel}>ENERGY BURN</Text>
            </View>
            <Text style={styles.statCellValue}>
              {animatedCal.toLocaleString()}{' '}
              <Text style={styles.statCellUnit}>kcal</Text>
            </Text>
            <Text style={styles.statCellSub}>Avg {avgCalPerDay} kcal/day</Text>
          </View>

          <View style={styles.statCellDividerV} />

          {/* Tile 2: Total Distance */}
          <View style={styles.statCell}>
            <View style={styles.statCellHeader}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(2, 132, 199, 0.14)' }]}>
                <Compass size={14} color="#0284c7" />
              </View>
              <Text style={styles.statCellLabel}>TOTAL DISTANCE</Text>
            </View>
            <Text style={styles.statCellValue}>
              {animatedDist}{' '}
              <Text style={styles.statCellUnit}>km</Text>
            </Text>
            <Text style={styles.statCellSub}>{weekStats.totalSteps.toLocaleString()} steps</Text>
          </View>

          <View style={styles.statRowDividerH} />

          {/* Tile 3: Workout Duration */}
          <View style={styles.statCell}>
            <View style={styles.statCellHeader}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(88, 100, 0, 0.14)' }]}>
                <Clock size={14} color={COLORS.primary} />
              </View>
              <Text style={styles.statCellLabel}>ACTIVE TIME</Text>
            </View>
            <Text style={styles.statCellValue}>
              {weekStats.totalDuration}{' '}
              <Text style={styles.statCellUnit}>min</Text>
            </Text>
            <Text style={styles.statCellSub}>
              {Math.floor(weekStats.totalDuration / 60)}h {weekStats.totalDuration % 60}m logged
            </Text>
          </View>

          <View style={styles.statCellDividerV} />

          {/* Tile 4: Sessions Logged */}
          <View style={styles.statCell}>
            <View style={styles.statCellHeader}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(234, 88, 12, 0.14)' }]}>
                <ActivityIcon size={14} color="#ea580c" />
              </View>
              <Text style={styles.statCellLabel}>WORKOUT SESSIONS</Text>
            </View>
            <Text style={styles.statCellValue}>
              {weekStats.workoutCount}{' '}
              <Text style={styles.statCellUnit}>completed</Text>
            </Text>
            <Text style={styles.statCellSub}>100% recorded</Text>
          </View>
        </View>

        {/* 3. TRAINING LOAD DISTRIBUTION MINI-BAR */}
        <View style={styles.distributionCard}>
          <View style={styles.distHeader}>
            <Text style={styles.distTitle}>TRAINING SPLIT VOLUME</Text>
            <Text style={styles.distSubtitle}>Aerobic Dominant</Text>
          </View>
          <View style={styles.distBarTrack}>
            <View style={[styles.distBarSegment, { flex: 55, backgroundColor: COLORS.primaryContainer }]} />
            <View style={[styles.distBarSegment, { flex: 30, backgroundColor: COLORS.primary }]} />
            <View style={[styles.distBarSegment, { flex: 15, backgroundColor: '#0284c7' }]} />
          </View>
          <View style={styles.distLegendRow}>
            <View style={styles.distLegendItem}>
              <View style={[styles.distDot, { backgroundColor: COLORS.primaryContainer }]} />
              <Text style={styles.distLegendText}>Cardio (55%)</Text>
            </View>
            <View style={styles.distLegendItem}>
              <View style={[styles.distDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.distLegendText}>Strength (30%)</Text>
            </View>
            <View style={styles.distLegendItem}>
              <View style={[styles.distDot, { backgroundColor: '#0284c7' }]} />
              <Text style={styles.distLegendText}>Mobility (15%)</Text>
            </View>
          </View>
        </View>

        {/* 4. WEEKLY CONSISTENCY & STREAK HALL */}
        <TouchableOpacity
          style={styles.streakBlock}
          activeOpacity={0.88}
          onPress={onOpenStreak}
        >
          <View style={styles.streakBlockHeader}>
            <View style={styles.streakLeft}>
              <View style={styles.flameCircle}>
                <Flame size={20} color={COLORS.text} fill={COLORS.text} />
              </View>
              <View>
                <Text style={styles.streakBlockCount}>
                  {streakInfo.currentStreak} Day Consistency Streak
                </Text>
                <Text style={styles.streakBlockSub}>Longest record: {streakInfo.longestStreak} days</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </View>

          {/* Week Grid (M T W T F S S) */}
          <View style={styles.weekGridBox}>
            {streakInfo.weekGrid.map((item, idx) => (
              <View key={`prog-streak-${item.date}-${idx}`} style={styles.gridDayCol}>
                <Text style={[styles.gridDayLabel, item.isToday && styles.gridDayLabelToday]}>
                  {item.day}
                </Text>
                <View
                  style={[
                    styles.gridCheckCircle,
                    item.checked && styles.gridCheckCircleChecked,
                    item.isToday && !item.checked && styles.gridCheckCircleToday,
                  ]}
                >
                  {item.checked ? (
                    <Check size={11} color={COLORS.text} strokeWidth={3} />
                  ) : (
                    <View style={styles.gridEmptyDot} />
                  )}
                </View>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryContainer,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 224, 30, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 14,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 11,
  },
  periodBtnActive: {
    backgroundColor: COLORS.primaryContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  periodBtnTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  metricSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricSelectHeading: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  metricPillGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  metricPillActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  metricPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  metricPillTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  sectionPace: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  compactStatsMatrix: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCell: {
    width: '49%',
    padding: 8,
  },
  statCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCellLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  statCellValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  statCellUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statCellSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  statCellDividerV: {
    width: 1,
    height: '42%',
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
  },
  statRowDividerH: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  distributionCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  distHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  distSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  distBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
    marginBottom: 8,
  },
  distBarSegment: {
    height: '100%',
    borderRadius: 2,
  },
  distLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  distLegendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  streakBlock: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  streakBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flameCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBlockCount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  streakBlockSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  weekGridBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    padding: 8,
  },
  gridDayCol: {
    alignItems: 'center',
    gap: 4,
  },
  gridDayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  gridDayLabelToday: {
    color: COLORS.text,
    fontWeight: '900',
  },
  gridCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCheckCircleChecked: {
    backgroundColor: COLORS.primaryContainer,
  },
  gridCheckCircleToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primaryContainer,
  },
  gridEmptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    opacity: 0.3,
  },
});
