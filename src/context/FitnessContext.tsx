import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActivityEntry,
  UserGoals,
  AggregatedStats,
  DayChartPoint,
  StreakInfo,
  UserProfile,
} from '../types';
import {
  initDatabase,
  addActivity,
  updateActivity,
  deleteActivity,
  getRecentActivities,
  getTodayStats,
  getWeekStats,
  getRangeChartData,
  getStreakInfo,
  getGoals,
  updateGoals,
  getProfile,
  updateProfileInDb,
} from '../database/db';

interface FitnessContextType {
  activities: ActivityEntry[];
  todayStats: AggregatedStats;
  weekStats: AggregatedStats;
  chartData: DayChartPoint[];
  chartPeriod: 'daily' | 'weekly' | 'monthly';
  streakInfo: StreakInfo;
  goals: UserGoals;
  userProfile: UserProfile;
  isLoading: boolean;
  streakCelebrationVisible: boolean;
  newStreakCount: number;
  setStreakCelebrationVisible: (visible: boolean) => void;
  setChartPeriod: (period: 'daily' | 'weekly' | 'monthly') => void;
  refreshData: () => Promise<void>;
  addNewActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => Promise<ActivityEntry>;
  modifyActivity: (id: string, entry: Partial<ActivityEntry>) => Promise<void>;
  deleteExistingActivity: (id: string) => Promise<void>;
  saveGoals: (newGoals: Partial<UserGoals>) => Promise<UserGoals>;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [todayStats, setTodayStats] = useState<AggregatedStats>({
    totalSteps: 0,
    totalCalories: 0,
    totalDuration: 0,
    workoutCount: 0,
  });
  const [weekStats, setWeekStats] = useState<AggregatedStats>({
    totalSteps: 0,
    totalCalories: 0,
    totalDuration: 0,
    workoutCount: 0,
  });
  const [chartData, setChartData] = useState<DayChartPoint[]>([]);
  const [chartPeriod, setChartPeriodState] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({
    currentStreak: 0,
    longestStreak: 0,
    weekGrid: [],
    extendedToday: false,
  });
  const [goals, setGoals] = useState<UserGoals>({
    step_target: 10000,
    calorie_target: 600,
    active_minutes_target: 45,
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const fallback: UserProfile = {
      name: 'Alex Hunter',
      avatarUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      weightKg: 74.5,
      heightCm: 178,
      age: 26,
      gender: 'Male',
      memberTier: 'KINETIC PRO ATHLETE',
      joinedDate: 'Jan 2024',
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('makefit_user_profile');
        if (saved) return { ...fallback, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Error reading profile from localStorage:', e);
      }
    }
    return fallback;
  });

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...profile };
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('makefit_user_profile', JSON.stringify(updated));
        } catch (e) {
          console.warn('Error saving profile to localStorage:', e);
        }
      }
      updateProfileInDb(updated).catch((err) =>
        console.warn('Error saving profile to SQLite:', err)
      );
      return updated;
    });
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [streakCelebrationVisible, setStreakCelebrationVisible] = useState<boolean>(false);
  const [newStreakCount, setNewStreakCount] = useState<number>(0);

  const refreshData = useCallback(async () => {
    try {
      const [
        fetchedActivities,
        fetchedToday,
        fetchedWeek,
        fetchedChart,
        fetchedStreak,
        fetchedGoals,
        fetchedProfile,
      ] = await Promise.all([
        getRecentActivities(30),
        getTodayStats(),
        getWeekStats(),
        getRangeChartData(chartPeriod),
        getStreakInfo(),
        getGoals(),
        getProfile(),
      ]);

      setActivities(fetchedActivities);
      setTodayStats(fetchedToday);
      setWeekStats(fetchedWeek);
      setChartData(fetchedChart);
      setStreakInfo(fetchedStreak);
      setGoals(fetchedGoals);
      if (fetchedProfile) {
        setUserProfile((prev) => ({ ...prev, ...fetchedProfile }));
      }
    } catch (err) {
      console.error('Failed to load fitness data from SQLite:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chartPeriod]);

  // Initial Boot
  useEffect(() => {
    const boot = async () => {
      try {
        await initDatabase();
        await refreshData();
      } catch (err) {
        console.error('Error initializing database:', err);
      }
    };
    boot();
  }, [refreshData]);

  const setChartPeriod = async (period: 'daily' | 'weekly' | 'monthly') => {
    setChartPeriodState(period);
    try {
      const data = await getRangeChartData(period);
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart data for period:', err);
    }
  };

  const addNewActivity = async (
    entry: Omit<ActivityEntry, 'id' | 'timestamp'>
  ): Promise<ActivityEntry> => {
    const prevStreak = streakInfo.currentStreak;
    const created = await addActivity(entry);

    // Refresh immediately
    await refreshData();

    // Check if streak increased
    const updatedStreak = await getStreakInfo();
    if (updatedStreak.currentStreak > prevStreak) {
      setNewStreakCount(updatedStreak.currentStreak);
      setStreakCelebrationVisible(true);
    }

    return created;
  };

  const modifyActivity = async (id: string, entry: Partial<ActivityEntry>): Promise<void> => {
    await updateActivity(id, entry);
    await refreshData();
  };

  const deleteExistingActivity = async (id: string): Promise<void> => {
    await deleteActivity(id);
    await refreshData();
  };

  const saveGoals = async (newGoals: Partial<UserGoals>): Promise<UserGoals> => {
    const updated = await updateGoals(newGoals);
    await refreshData();
    return updated;
  };

  return (
    <FitnessContext.Provider
      value={{
        activities,
        todayStats,
        weekStats,
        chartData,
        chartPeriod,
        streakInfo,
        goals,
        userProfile,
        isLoading,
        streakCelebrationVisible,
        newStreakCount,
        setStreakCelebrationVisible,
        setChartPeriod,
        refreshData,
        addNewActivity,
        modifyActivity,
        deleteExistingActivity,
        saveGoals,
        updateProfile,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export function useFitness(): FitnessContextType {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
}
