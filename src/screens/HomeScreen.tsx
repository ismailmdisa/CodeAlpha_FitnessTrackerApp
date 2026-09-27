import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Flame,
  Zap,
  Trash2,
  Edit2,
  Activity as ActivityIcon,
  Dumbbell,
  Compass,
  Footprints,
  Sparkles,
  ChevronRight,
  Sun,
  Quote,
  Clock,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';
import { Header } from '../components/Header';
import { WeeklyMicroStrip } from '../components/WeeklyMicroStrip';
import { BiometricMatrix } from '../components/BiometricMatrix';
import { FeaturedHeroCard } from '../components/FeaturedHeroCard';
import { ConcentricRings } from '../components/ConcentricRings';
import { HydrationCapsule } from '../components/HydrationCapsule';
import { MetabolicStrainTelemetry } from '../components/MetabolicStrainTelemetry';
import { AnimatedCard } from '../components/AnimatedCard';
import { ActivityEntry } from '../types';
import { formatDateLabel } from '../database/db';

interface HomeScreenProps {
  onOpenStreak: () => void;
  onOpenAddEntry: () => void;
  onEditEntry: (entry: ActivityEntry) => void;
  onOpenWorkouts: () => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenStreak,
  onOpenAddEntry,
  onEditEntry,
  onOpenWorkouts,
  onOpenProfile,
}) => {
  const {
    todayStats,
    goals,
    activities,
    streakInfo,
    deleteExistingActivity,
  } = useFitness();

  const handleDelete = (entry: ActivityEntry) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`Delete this ${entry.type} entry?`)) {
        deleteExistingActivity(entry.id);
      }
    } else {
      Alert.alert(
        'Delete Activity',
        `Are you sure you want to delete this ${entry.type} entry?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteExistingActivity(entry.id),
          },
        ]
      );
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running':
        return <ActivityIcon size={20} color={COLORS.primary} />;
      case 'gym':
        return <Dumbbell size={20} color={COLORS.primary} />;
      case 'cycling':
        return <Compass size={20} color={COLORS.primary} />;
      default:
        return <Flame size={20} color={COLORS.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* KINETIC Top Bar */}
      <Header
        onPressNotification={onOpenStreak}
        onPressProfile={onOpenProfile}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtle Editorial Ambient Greeting & Readiness Badge */}
        <View style={styles.heroGreetingRow}>
          <View style={styles.greetingTextColumn}>
            <View style={styles.optimalStateBadge}>
              <View style={styles.optimalDot} />
              <Text style={styles.optimalText}>OPTIMAL STATE</Text>
            </View>
            <Text style={styles.greetingTitle}>Good morning, Alex</Text>
          </View>

          {/* Readiness Index Pill (code.html lines 16-23) */}
          <TouchableOpacity
            style={styles.readinessBadge}
            activeOpacity={0.8}
            onPress={onOpenStreak}
          >
            <Zap size={15} color={COLORS.primary} fill={COLORS.primary} />
            <View style={styles.readinessNumberGroup}>
              <Text style={styles.readinessNumber}>96</Text>
              <Text style={styles.readinessPercent}>%</Text>
            </View>
            <Text style={styles.readinessLabel}>READY</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Consistency Micro-Strip (code.html lines 26-73) */}
        <WeeklyMicroStrip
          weekGrid={streakInfo.weekGrid}
          onPressDay={() => onOpenStreak()}
        />

        {/* Key Biometric Telemetry Matrix (code.html lines 74-124) */}
        <BiometricMatrix />

        {/* Featured Session Hero Card (code.html lines 125-166) */}
        <FeaturedHeroCard onEngageWorkout={onOpenWorkouts} />

        {/* Daily Metabolic Concentric Rings (code.html lines 167-228) */}
        <ConcentricRings
          calories={todayStats.totalCalories}
          caloriesGoal={goals.calorie_target}
          activeMinutes={todayStats.totalDuration}
          activeMinutesGoal={goals.active_minutes_target}
          standHours={Math.min(todayStats.workoutCount > 0 ? 11 : 8, 12)}
          standHoursGoal={12}
        />

        {/* Interactive Hydration Equilibrium Tracker */}
        <HydrationCapsule />

        {/* Metabolic Strain & Cardiovascular HR Zones */}
        <MetabolicStrainTelemetry />

        {/* Quick Activity Shortcuts Speed Strip */}
        <View style={styles.speedStripContainer}>
          <Text style={styles.speedStripTitle}>INSTANT LOGGING</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.speedStripScroll}>
            <TouchableOpacity style={styles.speedChip} activeOpacity={0.8} onPress={onOpenAddEntry}>
              <View style={[styles.speedDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.speedText}>⚡ Interval Run</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.speedChip} activeOpacity={0.8} onPress={onOpenAddEntry}>
              <View style={[styles.speedDot, { backgroundColor: COLORS.secondary }]} />
              <Text style={styles.speedText}>🏋️ Strength Circuit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.speedChip} activeOpacity={0.8} onPress={onOpenAddEntry}>
              <View style={[styles.speedDot, { backgroundColor: '#0284c7' }]} />
              <Text style={styles.speedText}>🚴 Zone 2 Ride</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.speedChip} activeOpacity={0.8} onPress={onOpenAddEntry}>
              <View style={[styles.speedDot, { backgroundColor: COLORS.primaryContainer }]} />
              <Text style={styles.speedText}>🚶 20-Min Walk</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recent Activity Logs (code.html lines 229-294) */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <View style={styles.recentTitleGroup}>
              <Text style={styles.recentSectionTitle}>Recent Sessions</Text>
              <View style={styles.sessionCountPill}>
                <Text style={styles.sessionCountText}>
                  {activities.length} logged
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onOpenAddEntry}>
              <Text style={styles.addQuickButton}>+ ADD LOG</Text>
            </TouchableOpacity>
          </View>

          {activities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBadge}>
                <Dumbbell size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No sessions logged yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your morning run or workout to fuel your concentric rings.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                activeOpacity={0.85}
                onPress={onOpenAddEntry}
              >
                <Footprints size={15} color={COLORS.text} style={{ marginRight: 6 }} />
                <Text style={styles.emptyButtonText}>Log Activity Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            activities.slice(0, 5).map((item) => (
              <AnimatedCard
                key={item.id}
                style={styles.activityCard}
                onPress={() => onEditEntry(item)}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.activityIconCircle}>
                    {getActivityIcon(item.type)}
                  </View>
                  <View style={styles.activityInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.activityTitle}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Session
                      </Text>
                      <Text style={styles.activityDate}>
                        {formatDateLabel(item.date)}
                      </Text>
                    </View>
                    <View style={styles.metricsRow}>
                      <View style={styles.metricSnippet}>
                        <Clock size={12} color={COLORS.textSecondary} />
                        <Text style={styles.metricSnippetText}>{item.duration} min</Text>
                      </View>
                      <Text style={styles.dotSeparator}>•</Text>
                      <View style={styles.metricSnippet}>
                        <Flame size={12} color={COLORS.primary} />
                        <Text style={[styles.metricSnippetText, { color: COLORS.primary, fontWeight: '600' }]}>
                          {item.calories} kcal
                        </Text>
                      </View>
                      {item.steps > 0 && (
                        <>
                          <Text style={styles.dotSeparator}>•</Text>
                          <View style={styles.metricSnippet}>
                            <Footprints size={12} color={COLORS.textSecondary} />
                            <Text style={styles.metricSnippetText}>{item.steps} steps</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </View>

                {/* Edit & Delete Mini Actions */}
                <View style={styles.cardRight}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      onEditEntry(item);
                    }}
                  >
                    <Edit2 size={14} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleDelete(item);
                    }}
                  >
                    <Trash2 size={14} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            ))
          )}
        </View>

        {/* Editorial Motivational Note (code.html lines 295-308) */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteLeft}>
            <View style={styles.quoteIconBadge}>
              <Sun size={16} color={COLORS.text} />
            </View>
            <View style={styles.quoteTextContainer}>
              <Text style={styles.quoteBody}>
                "Form follows focus. Step softly into tempo."
              </Text>
              <Text style={styles.quoteAuthor}>COACH S. LAURENT</Text>
            </View>
          </View>
          <Quote size={18} color={COLORS.textMuted} />
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  heroGreetingRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  greetingTextColumn: {
    flex: 1,
  },
  optimalStateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  optimalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryContainer,
  },
  optimalText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  readinessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  readinessNumberGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  readinessNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  readinessPercent: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  readinessLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  recentSection: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  sessionCountPill: {
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sessionCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  addQuickButton: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  activityCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(200, 224, 30, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  activityDate: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricSnippetText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  dotSeparator: {
    fontSize: 10,
    color: COLORS.outlineVariant,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLow,
  },
  emptyContainer: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emptyIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(200, 224, 30, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  quoteCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quoteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  quoteIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteTextContainer: {
    flex: 1,
  },
  quoteBody: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  quoteAuthor: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1.1,
  },
  speedStripContainer: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  speedStripTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  speedStripScroll: {
    gap: 8,
  },
  speedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  speedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
});
