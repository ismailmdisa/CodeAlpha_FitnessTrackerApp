import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Search,
  Bookmark,
  Flame,
  Clock,
  Dumbbell,
  Play,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Sparkles,
  Target,
  CheckCircle2,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { WORKOUT_PROGRAMS } from '../data/workouts';
import { WorkoutCategory, WorkoutProgram } from '../types';
import { AnimatedCard } from '../components/AnimatedCard';

interface WorkoutsScreenProps {
  onSelectWorkout: (workout: WorkoutProgram) => void;
  onStartWorkoutDirectly?: (workout: WorkoutProgram) => void;
}

const CATEGORIES: { label: string; value: WorkoutCategory; icon: string }[] = [
  { label: 'All', value: 'All', icon: '⚡' },
  { label: 'Cardio', value: 'Cardio', icon: '🔥' },
  { label: 'Strength', value: 'Strength', icon: '🏋️' },
  { label: 'Mobility', value: 'Mobility', icon: '🧘' },
];

const DURATION_FILTERS = ['All', '15m', '25m', '35m'];

export const WorkoutsScreen: React.FC<WorkoutsScreenProps> = ({
  onSelectWorkout,
  onStartWorkoutDirectly,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['prog_hiit_full_body']));

  const toggleBookmark = (id: string, e: any) => {
    e.stopPropagation?.();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string, e: any) => {
    e.stopPropagation?.();
    setExpandedWorkoutId((prev) => (prev === id ? null : id));
  };

  const filteredWorkouts = WORKOUT_PROGRAMS.filter((w) => {
    const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.targetZone.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDuration = true;
    if (selectedDuration === '15m') matchesDuration = w.durationMin <= 20;
    else if (selectedDuration === '25m') matchesDuration = w.durationMin >= 21 && w.durationMin <= 30;
    else if (selectedDuration === '35m') matchesDuration = w.durationMin >= 31;

    return matchesCategory && matchesQuery && matchesDuration;
  });

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Cardio':
        return { color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)', label: 'Cardio & HIIT' };
      case 'Strength':
        return { color: COLORS.secondary, bg: 'rgba(88, 98, 70, 0.14)', label: 'Muscle Strength' };
      case 'Mobility':
        return { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.14)', label: 'Mobility & Recovery' };
      default:
        return { color: COLORS.primary, bg: 'rgba(88, 100, 0, 0.12)', label: 'Circuit' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Clear Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTagRow}>
            <View style={styles.activeDot} />
            <Text style={styles.headerTag}>GUIDED WORKOUT LIBRARY</Text>
          </View>
          <Text style={styles.headerTitle}>Workout Programs</Text>
          <Text style={styles.headerSubtitle}>
            Choose a guided routine or tap 'Start Workout' to begin.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Interactive Quick Start Workout Hero Banner */}
        <View style={styles.quickStartCard}>
          <View style={styles.quickStartLeft}>
            <View style={styles.quickStartIcon}>
              <Zap size={20} color={COLORS.text} fill={COLORS.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickStartTitle}>Ready to sweat right now?</Text>
              <Text style={styles.quickStartDesc}>
                Jump straight into the 25-min Full Body Torch or pick a routine below.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.quickStartBtn}
            activeOpacity={0.88}
            onPress={() => {
              const defaultWorkout = WORKOUT_PROGRAMS[0];
              if (onStartWorkoutDirectly) onStartWorkoutDirectly(defaultWorkout);
              else onSelectWorkout(defaultWorkout);
            }}
          >
            <Play size={15} color={COLORS.text} fill={COLORS.text} />
            <Text style={styles.quickStartBtnText}>Quick Start</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises, abs, cardio, level..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 1. Category Switcher (Cardio, Strength, Mobility) */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>SELECT TRAINING GOAL</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2. Duration Filters */}
        <View style={styles.durationFilterRow}>
          <Text style={styles.durationFilterLabel}>Duration:</Text>
          {DURATION_FILTERS.map((dur) => {
            const isActive = selectedDuration === dur;
            return (
              <TouchableOpacity
                key={dur}
                style={[styles.durationChip, isActive && styles.durationChipActive]}
                onPress={() => setSelectedDuration(dur)}
              >
                <Text
                  style={[
                    styles.durationChipText,
                    isActive && styles.durationChipTextActive,
                  ]}
                >
                  {dur}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Routines Counter */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            Showing {filteredWorkouts.length} available {filteredWorkouts.length === 1 ? 'routine' : 'routines'}
          </Text>
        </View>

        {/* Clear & Interactive Workout Cards List */}
        <View style={styles.workoutList}>
          {filteredWorkouts.map((workout) => {
            const isBookmarked = bookmarkedIds.has(workout.id);
            const isExpanded = expandedWorkoutId === workout.id;
            const theme = getCategoryTheme(workout.category);

            return (
              <AnimatedCard
                key={workout.id}
                style={styles.card}
                onPress={() => onSelectWorkout(workout)}
              >
                {/* Card Header Row: Category Badge + Difficulty + Bookmark */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.badgeGroup}>
                    <View style={[styles.categoryBadge, { backgroundColor: theme.bg }]}>
                      <Text style={[styles.categoryBadgeText, { color: theme.color }]}>
                        {theme.label.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>{workout.level}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={(e) => toggleBookmark(workout.id, e)}
                  >
                    <Bookmark
                      size={18}
                      color={isBookmarked ? COLORS.primaryContainer : COLORS.textMuted}
                      fill={isBookmarked ? COLORS.primaryContainer : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Workout Title & Description */}
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <Text style={styles.workoutDesc} numberOfLines={2}>
                  {workout.description}
                </Text>

                {/* 3 Prominent Clear Metrics: Time, Calories, Exercises */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Clock size={14} color={COLORS.textSecondary} />
                    <Text style={styles.metricValue}>
                      {workout.durationMin} <Text style={styles.metricUnit}>min</Text>
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Flame size={14} color={COLORS.primary} />
                    <Text style={[styles.metricValue, { color: COLORS.primary }]}>
                      {workout.estimatedCalories} <Text style={styles.metricUnit}>kcal</Text>
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Dumbbell size={14} color={COLORS.textSecondary} />
                    <Text style={styles.metricValue}>
                      {workout.exercises.length} <Text style={styles.metricUnit}>moves</Text>
                    </Text>
                  </View>
                </View>

                {/* Target Anatomy Line */}
                <View style={styles.targetRow}>
                  <Target size={13} color={COLORS.textMuted} />
                  <Text style={styles.targetText}>
                    Focus: <Text style={styles.targetBold}>{workout.targetZone}</Text>
                  </Text>
                </View>

                {/* Interactive Inline Exercise Accordion Button */}
                <TouchableOpacity
                  style={styles.accordionToggle}
                  activeOpacity={0.7}
                  onPress={(e) => toggleExpand(workout.id, e)}
                >
                  <Text style={styles.accordionToggleText}>
                    {isExpanded ? 'Hide Exercise List' : `View ${workout.exercises.length} Exercises in Routine`}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={16} color={COLORS.textSecondary} />
                  ) : (
                    <ChevronDown size={16} color={COLORS.textSecondary} />
                  )}
                </TouchableOpacity>

                {/* Expanded Exercises List */}
                {isExpanded && (
                  <View style={styles.expandedExerciseList}>
                    {workout.exercises.map((ex, idx) => (
                      <View key={ex.id} style={styles.exerciseItemRow}>
                        <View style={styles.exerciseNumCircle}>
                          <Text style={styles.exerciseNumText}>{idx + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.exerciseNameText}>{ex.name}</Text>
                        </View>
                        <View style={styles.exerciseDurationBadge}>
                          <Text style={styles.exerciseDurationText}>{ex.durationOrReps}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons: START WORKOUT & DETAILS */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.startWorkoutBtn}
                    activeOpacity={0.88}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      if (onStartWorkoutDirectly) onStartWorkoutDirectly(workout);
                      else onSelectWorkout(workout);
                    }}
                  >
                    <Play size={16} color={COLORS.text} fill={COLORS.text} />
                    <Text style={styles.startWorkoutBtnText}>START WORKOUT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsBtn}
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      onSelectWorkout(workout);
                    }}
                  >
                    <Info size={15} color={COLORS.textSecondary} />
                    <Text style={styles.detailsBtnText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  activeDot: {
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
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  quickStartCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 224, 30, 0.4)',
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickStartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  quickStartIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  quickStartDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
    lineHeight: 15,
  },
  quickStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 5,
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStartBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  sectionHeadingRow: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  categoryRow: {
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  categoryIcon: {
    fontSize: 13,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  durationFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  durationFilterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  durationChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  durationChipActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  durationChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  resultsBar: {
    marginBottom: 10,
  },
  resultsCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  workoutList: {
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  levelBadge: {
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bookmarkButton: {
    padding: 4,
  },
  workoutTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  workoutDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  metricDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.borderLight,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  targetText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  targetBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  accordionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainer,
    marginBottom: 10,
  },
  accordionToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  expandedExerciseList: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  exerciseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  exerciseNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
  },
  exerciseNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  exerciseDurationBadge: {
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  exerciseDurationText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  startWorkoutBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 22,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  startWorkoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.8,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLow,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
