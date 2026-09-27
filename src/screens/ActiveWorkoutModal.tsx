import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Dumbbell,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { WorkoutProgram } from '../types';
import { useFitness } from '../context/FitnessContext';
import { getTodayDateString } from '../database/db';

interface ActiveWorkoutModalProps {
  visible: boolean;
  workout: WorkoutProgram | null;
  onClose: () => void;
  onFinishSession: (stats: { durationMin: number; caloriesBurned: number }) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  visible,
  workout,
  onClose,
  onFinishSession,
}) => {
  const { addNewActivity } = useFitness();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [exerciseCountdown, setExerciseCountdown] = useState<number>(45);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (visible && workout) {
      setCurrentExerciseIndex(0);
      setSecondsElapsed(0);
      const firstEx = workout.exercises[0];
      setExerciseCountdown(firstEx?.targetSeconds || 45);

      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
        setExerciseCountdown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, workout]);

  if (!workout) return null;

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const progressRatio = (currentExerciseIndex + 1) / totalExercises;

  const handleNext = async () => {
    if (currentExerciseIndex < totalExercises - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      const nextEx = workout.exercises[nextIndex];
      setExerciseCountdown(nextEx?.targetSeconds || 45);
    } else {
      // Finished all exercises!
      await finalizeWorkout();
    }
  };

  const handlePrev = () => {
    if (currentExerciseIndex > 0) {
      const prevIndex = currentExerciseIndex - 1;
      setCurrentExerciseIndex(prevIndex);
      const prevEx = workout.exercises[prevIndex];
      setExerciseCountdown(prevEx?.targetSeconds || 45);
    }
  };

  const finalizeWorkout = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Compute REAL session time and calories
    const durationMin = Math.max(1, Math.round(secondsElapsed / 60));
    const rate = workout.estimatedCalories / Math.max(workout.durationMin, 1);
    const caloriesBurned = Math.max(20, Math.round(durationMin * rate));
    const sessionSteps = Math.round(durationMin * 50);

    // Save directly to SQLite
    try {
      await addNewActivity({
        type: workout.category === 'Cardio' ? 'running' : 'gym',
        duration: durationMin,
        steps: sessionSteps,
        calories: caloriesBurned,
        date: getTodayDateString(),
      });
    } catch (err) {
      console.error('Failed to log workout session to database:', err);
    }

    onFinishSession({ durationMin, caloriesBurned });
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <View style={styles.sessionHeaderCenter}>
              <Text style={styles.workoutTitleHeader}>{workout.title}</Text>
              <Text style={styles.counterText}>
                Exercise {currentExerciseIndex + 1} of {totalExercises}
              </Text>
            </View>
            <TouchableOpacity onPress={finalizeWorkout}>
              <Text style={styles.finishLink}>FINISH</Text>
            </TouchableOpacity>
          </View>

          {/* Exercise Hero Card */}
          <View style={styles.exerciseCard}>
            <View style={styles.iconCircle}>
              <Dumbbell size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.exerciseName}>{currentExercise?.name}</Text>
            <Text style={styles.exerciseTarget}>{currentExercise?.durationOrReps}</Text>

            {/* Big Countdown / Rep Counter (Image 3 style) */}
            <View style={styles.bigCounterContainer}>
              <Text style={styles.bigCounterNumber}>
                {currentExercise?.reps ? currentExercise.reps : exerciseCountdown}
              </Text>
              <Text style={styles.counterUnit}>
                {currentExercise?.reps ? 'REPETITIONS' : 'SECONDS LEFT'}
              </Text>
            </View>

            {/* Total Elapsed & Calories Row */}
            <View style={styles.liveStatsRow}>
              <View style={styles.liveStat}>
                <Clock size={16} color={COLORS.primary} />
                <Text style={styles.liveStatText}>{formatTimer(secondsElapsed)}</Text>
              </View>
              <View style={styles.liveStat}>
                <Flame size={16} color={COLORS.primary} />
                <Text style={styles.liveStatText}>
                  {Math.round((secondsElapsed / 60) * (workout.estimatedCalories / workout.durationMin))} kcal
                </Text>
              </View>
            </View>
          </View>

          {/* Controls Footer */}
          <View style={styles.controlsFooter}>
            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.prevButton, currentExerciseIndex === 0 && styles.disabledButton]}
                disabled={currentExerciseIndex === 0}
                onPress={handlePrev}
              >
                <ChevronLeft size={20} color={COLORS.text} />
                <Text style={styles.prevText}>Prev</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextText}>
                  {currentExerciseIndex === totalExercises - 1 ? 'Complete' : 'Next'}
                </Text>
                <ChevronRight size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipBtn} onPress={handleNext}>
              <Text style={styles.skipText}>Skip Exercise</Text>
            </TouchableOpacity>

            {/* Bottom Progress Bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionHeaderCenter: {
    alignItems: 'center',
  },
  workoutTitleHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  counterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  finishLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  exerciseCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 42, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 42, 54, 0.3)',
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  exerciseTarget: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 24,
  },
  bigCounterContainer: {
    backgroundColor: COLORS.surfaceCard,
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 220,
    marginBottom: 24,
  },
  bigCounterNumber: {
    fontSize: 68,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  counterUnit: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
  liveStatsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  liveStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  liveStatText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  controlsFooter: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  prevButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceHighlight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  disabledButton: {
    opacity: 0.4,
  },
  prevText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  nextButton: {
    flex: 2,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
