import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { AppModal } from '../components/AppModal';
import {
  ArrowLeft,
  Flame,
  Clock,
  Target,
  Zap,
  Play,
  CheckCircle2,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { WorkoutProgram } from '../types';
import { AnimatedCard } from '../components/AnimatedCard';

interface WorkoutDetailModalProps {
  visible: boolean;
  workout: WorkoutProgram | null;
  onClose: () => void;
  onStartSession: (workout: WorkoutProgram) => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  visible,
  workout,
  onClose,
  onStartSession,
}) => {
  if (!workout) return null;

  return (
    <AppModal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Full-Width Photo Hero Banner at the Top */}
        <View style={styles.heroBanner}>
          {workout.thumbnailUri ? (
            <Image
              source={{ uri: workout.thumbnailUri }}
              style={styles.heroImage}
            />
          ) : (
            <View style={styles.heroFallback} />
          )}

          {/* Dark Gradient / Scrim Overlay */}
          <View style={styles.heroScrim} />

          {/* Top Controls: Back Button & Badges on Top of Photo */}
          <View style={styles.heroTopControls}>
            <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.8}>
              <ArrowLeft size={22} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.heroBadgeRow}>
              <View style={styles.badge}>
                <Clock size={13} color={COLORS.primary} />
                <Text style={styles.badgeText}>{workout.durationMin} mins</Text>
              </View>
              <View style={styles.badge}>
                <Flame size={13} color={COLORS.primary} />
                <Text style={styles.badgeText}>{workout.estimatedCalories} kcal</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title & Description */}
          <Text style={styles.title}>{workout.title}</Text>
          <Text style={styles.description}>{workout.description}</Text>

          {/* Mini Stats Row */}
          <View style={styles.miniStatsRow}>
            <View style={styles.statBox}>
              <Zap size={18} color={COLORS.primary} />
              <Text style={styles.statBoxLabel}>LEVEL</Text>
              <Text style={styles.statBoxValue}>{workout.level}</Text>
            </View>

            <View style={styles.statBox}>
              <Flame size={18} color={COLORS.primary} />
              <Text style={styles.statBoxLabel}>INTENSITY</Text>
              <Text style={styles.statBoxValue}>{workout.intensity} / 5</Text>
            </View>

            <View style={styles.statBox}>
              <Target size={18} color={COLORS.primary} />
              <Text style={styles.statBoxLabel}>TARGET</Text>
              <Text style={styles.statBoxValue} numberOfLines={1}>
                {workout.targetZone.split(' ')[0]}
              </Text>
            </View>
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseSection}>
            <Text style={styles.sectionHeading}>
              EXERCISES IN THIS CIRCUIT ({workout.exercises.length})
            </Text>

            {workout.exercises.map((item, index) => (
              <View key={item.id} style={styles.exerciseRow}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseReps}>{item.durationOrReps}</Text>
                </View>
                <CheckCircle2 size={18} color={COLORS.textMuted} />
              </View>
            ))}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Start Workout Button Footer with spring animation */}
        <View style={styles.footerContainer}>
          <AnimatedCard
            style={styles.startButton}
            onPress={() => onStartSession(workout)}
          >
            <Play size={20} color={COLORS.text} fill={COLORS.text} style={{ marginRight: 6 }} />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </AnimatedCard>
        </View>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroBanner: {
    height: 230,
    backgroundColor: COLORS.surfaceHighlight,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surfaceHighlight,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 12, 0.45)',
  },
  heroTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 20,
    zIndex: 3,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(10, 10, 12, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 12, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 54, 0.35)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statBoxValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  exerciseSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  exerciseRow: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 42, 54, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  exerciseReps: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
});
