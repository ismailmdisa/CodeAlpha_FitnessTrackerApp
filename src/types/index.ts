export type ActivityType = 'walking' | 'running' | 'gym' | 'cycling' | 'custom';

export interface ActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: ActivityType;
  duration: number; // minutes
  steps: number;
  calories: number;
  timestamp: number; // epoch ms
}

export interface UserGoals {
  id?: number;
  step_target: number;
  calorie_target: number;
  active_minutes_target: number;
}

export interface AggregatedStats {
  totalSteps: number;
  totalCalories: number;
  totalDuration: number;
  workoutCount: number;
}

export interface DayChartPoint {
  date: string;
  dayLabel: string;
  steps: number;
  calories: number;
  duration: number;
  hasActivity: boolean;
}

export interface WeekDayCheckmark {
  day: string; // M, T, W, T, F, S, S
  date: string; // YYYY-MM-DD
  checked: boolean;
  isToday: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  weekGrid: WeekDayCheckmark[];
  extendedToday: boolean;
}

export type WorkoutCategory = 'All' | 'Cardio' | 'Strength' | 'Mobility';

export interface ExerciseItem {
  id: string;
  name: string;
  durationOrReps: string;
  targetSeconds: number;
  reps?: number;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  category: 'Cardio' | 'Strength' | 'Mobility';
  durationMin: number;
  estimatedCalories: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  targetZone: string;
  intensity: number; // 1 to 5
  thumbnailUri?: string;
  exercises: ExerciseItem[];
}

export interface UserProfile {
  name: string;
  avatarUri: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  memberTier: string;
  joinedDate: string;
}

export interface BiometricTelemetry {
  restHeartRateBpm: number;
  hrvMs: number;
  sleepHours: number;
  sleepMinutes: number;
  sleepRestScorePct: number;
  readinessPct: number;
  strainScore: number;
  waterMl: number;
  waterTargetMl: number;
  estBodyFatPct: number;
}

export const DEFAULT_TELEMETRY: BiometricTelemetry = {
  restHeartRateBpm: 48,
  hrvMs: 74,
  sleepHours: 8,
  sleepMinutes: 15,
  sleepRestScorePct: 92,
  readinessPct: 88,
  strainScore: 14.8,
  waterMl: 2250,
  waterTargetMl: 3000,
  estBodyFatPct: 14.2,
};

