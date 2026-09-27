import { getDatabaseDriver } from './adapter';
import {
  ActivityEntry,
  UserGoals,
  AggregatedStats,
  DayChartPoint,
  StreakInfo,
  WeekDayCheckmark,
  UserProfile,
  BiometricTelemetry,
  DEFAULT_TELEMETRY,
} from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  const today = getTodayDateString();
  if (dateStr === today) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yStr) return 'Yesterday';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return dateStr;
}

export function validateActivity(
  entry: Partial<ActivityEntry>
): { valid: boolean; error?: string } {
  if (!entry.type || entry.type.trim() === '') {
    return { valid: false, error: 'Activity type is required' };
  }

  const duration = Number(entry.duration);
  if (isNaN(duration) || duration <= 0) {
    return { valid: false, error: 'Duration must be greater than 0 minutes' };
  }

  const steps = Number(entry.steps ?? 0);
  if (isNaN(steps) || steps < 0) {
    return { valid: false, error: 'Steps cannot be a negative number' };
  }

  const calories = Number(entry.calories ?? 0);
  if (isNaN(calories) || calories < 0) {
    return { valid: false, error: 'Calories cannot be a negative number' };
  }

  if (!entry.date) {
    return { valid: false, error: 'Date is required' };
  }

  const today = getTodayDateString();
  if (entry.date > today) {
    return { valid: false, error: 'Cannot log activities for future dates' };
  }

  return { valid: true };
}

export async function initDatabase(): Promise<void> {
  const driver = await getDatabaseDriver();

  await driver.execAsync(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER NOT NULL,
      steps INTEGER NOT NULL,
      calories INTEGER NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);

  await driver.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      step_target INTEGER NOT NULL DEFAULT 10000,
      calorie_target INTEGER NOT NULL DEFAULT 600,
      active_minutes_target INTEGER NOT NULL DEFAULT 45
    );
  `);

  await driver.execAsync(`
    INSERT OR IGNORE INTO goals (id, step_target, calorie_target, active_minutes_target)
    VALUES (1, 10000, 600, 45);
  `);

  await driver.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT 'Alex Hunter',
      avatar_uri TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      weight_kg REAL NOT NULL DEFAULT 74.5,
      height_cm REAL NOT NULL DEFAULT 178,
      age INTEGER NOT NULL DEFAULT 26,
      gender TEXT NOT NULL DEFAULT 'Male',
      member_tier TEXT NOT NULL DEFAULT 'KINETIC PRO ATHLETE',
      joined_date TEXT NOT NULL DEFAULT 'Jan 2024'
    );
  `);

  await driver.execAsync(`
    INSERT OR IGNORE INTO profile (id, name, avatar_uri, weight_kg, height_cm, age, gender, member_tier, joined_date)
    VALUES (1, 'Alex Hunter', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop', 74.5, 178, 26, 'Male', 'KINETIC PRO ATHLETE', 'Jan 2024');
  `);

  await driver.execAsync(`
    CREATE TABLE IF NOT EXISTS telemetry (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      rest_heart_rate_bpm INTEGER NOT NULL DEFAULT 48,
      hrv_ms INTEGER NOT NULL DEFAULT 74,
      sleep_hours INTEGER NOT NULL DEFAULT 8,
      sleep_minutes INTEGER NOT NULL DEFAULT 15,
      sleep_rest_score_pct INTEGER NOT NULL DEFAULT 92,
      readiness_pct INTEGER NOT NULL DEFAULT 88,
      strain_score REAL NOT NULL DEFAULT 14.8,
      water_ml INTEGER NOT NULL DEFAULT 2250,
      water_target_ml INTEGER NOT NULL DEFAULT 3000,
      est_body_fat_pct REAL NOT NULL DEFAULT 14.2
    );
  `);

  await driver.execAsync(`
    INSERT OR IGNORE INTO telemetry (id, rest_heart_rate_bpm, hrv_ms, sleep_hours, sleep_minutes, sleep_rest_score_pct, readiness_pct, strain_score, water_ml, water_target_ml, est_body_fat_pct)
    VALUES (1, 48, 74, 8, 15, 92, 88, 14.8, 2250, 3000, 14.2);
  `);
}

export async function addActivity(
  input: Omit<ActivityEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
): Promise<ActivityEntry> {
  const validation = validateActivity(input);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const driver = await getDatabaseDriver();
  const id = input.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = input.timestamp || Date.now();
  const steps = Math.round(Number(input.steps || 0));
  const calories = Math.round(Number(input.calories || 0));
  const duration = Math.round(Number(input.duration));

  await driver.runAsync(
    `INSERT INTO activities (id, date, type, duration, steps, calories, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [id, input.date, input.type, duration, steps, calories, timestamp]
  );

  return {
    id,
    date: input.date,
    type: input.type,
    duration,
    steps,
    calories,
    timestamp,
  };
}

export async function updateActivity(
  id: string,
  input: Partial<ActivityEntry>
): Promise<void> {
  const existing = await getActivityById(id);
  if (!existing) {
    throw new Error(`Activity with id ${id} not found`);
  }

  const merged = { ...existing, ...input };
  const validation = validateActivity(merged);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const driver = await getDatabaseDriver();
  await driver.runAsync(
    `UPDATE activities 
     SET date = ?, type = ?, duration = ?, steps = ?, calories = ?, timestamp = ?
     WHERE id = ?;`,
    [
      merged.date,
      merged.type,
      Math.round(Number(merged.duration)),
      Math.round(Number(merged.steps)),
      Math.round(Number(merged.calories)),
      merged.timestamp || Date.now(),
      id,
    ]
  );
}

export async function deleteActivity(id: string): Promise<void> {
  const driver = await getDatabaseDriver();
  await driver.runAsync(`DELETE FROM activities WHERE id = ?;`, [id]);
}

export async function getActivityById(id: string): Promise<ActivityEntry | null> {
  const driver = await getDatabaseDriver();
  return driver.getFirstAsync<ActivityEntry>(
    `SELECT id, date, type, duration, steps, calories, timestamp 
     FROM activities WHERE id = ?;`,
    [id]
  );
}

export async function getRecentActivities(limit: number = 20): Promise<ActivityEntry[]> {
  const driver = await getDatabaseDriver();
  const rows = await driver.getAllAsync<ActivityEntry>(
    `SELECT id, date, type, duration, steps, calories, timestamp 
     FROM activities 
     ORDER BY date DESC, timestamp DESC 
     LIMIT ?;`,
    [limit]
  );
  return rows || [];
}

export async function getTodayStats(): Promise<AggregatedStats> {
  const today = getTodayDateString();
  const driver = await getDatabaseDriver();
  const result = await driver.getFirstAsync<{
    totalSteps: number;
    totalCalories: number;
    totalDuration: number;
    workoutCount: number;
  }>(
    `SELECT 
       COALESCE(SUM(steps), 0) as totalSteps,
       COALESCE(SUM(calories), 0) as totalCalories,
       COALESCE(SUM(duration), 0) as totalDuration,
       COUNT(*) as workoutCount
     FROM activities 
     WHERE date = ?;`,
    [today]
  );

  return {
    totalSteps: Number(result?.totalSteps || 0),
    totalCalories: Number(result?.totalCalories || 0),
    totalDuration: Number(result?.totalDuration || 0),
    workoutCount: Number(result?.workoutCount || 0),
  };
}

export function getWeekDateRange(): { startOfWeek: string; endOfWeek: string; days: string[] } {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = (currentDay + 6) % 7; // Monday = 0, Sunday = 6

  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${dayStr}`);
  }

  return {
    startOfWeek: days[0],
    endOfWeek: days[6],
    days,
  };
}

export async function getWeekStats(): Promise<AggregatedStats> {
  const { startOfWeek, endOfWeek } = getWeekDateRange();
  const driver = await getDatabaseDriver();
  const result = await driver.getFirstAsync<{
    totalSteps: number;
    totalCalories: number;
    totalDuration: number;
    workoutCount: number;
  }>(
    `SELECT 
       COALESCE(SUM(steps), 0) as totalSteps,
       COALESCE(SUM(calories), 0) as totalCalories,
       COALESCE(SUM(duration), 0) as totalDuration,
       COUNT(*) as workoutCount
     FROM activities 
     WHERE date >= ? AND date <= ?;`,
    [startOfWeek, endOfWeek]
  );

  return {
    totalSteps: Number(result?.totalSteps || 0),
    totalCalories: Number(result?.totalCalories || 0),
    totalDuration: Number(result?.totalDuration || 0),
    workoutCount: Number(result?.workoutCount || 0),
  };
}

export async function getRangeChartData(
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<DayChartPoint[]> {
  const driver = await getDatabaseDriver();
  const today = getTodayDateString();

  if (period === 'daily') {
    // Current Week Monday to Sunday
    const { days } = getWeekDateRange();
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const rows = await driver.getAllAsync<{
      date: string;
      steps: number;
      calories: number;
      duration: number;
    }>(
      `SELECT date, 
              COALESCE(SUM(steps), 0) as steps, 
              COALESCE(SUM(calories), 0) as calories, 
              COALESCE(SUM(duration), 0) as duration
       FROM activities 
       WHERE date >= ? AND date <= ?
       GROUP BY date;`,
      [days[0], days[6]]
    );

    const dataMap = new Map<string, { steps: number; calories: number; duration: number }>();
    rows.forEach((r) => {
      dataMap.set(r.date, {
        steps: Number(r.steps || 0),
        calories: Number(r.calories || 0),
        duration: Number(r.duration || 0),
      });
    });

    return days.map((d, index) => {
      const match = dataMap.get(d);
      return {
        date: d,
        dayLabel: dayNames[index],
        steps: match ? match.steps : 0,
        calories: match ? match.calories : 0,
        duration: match ? match.duration : 0,
        hasActivity: match ? match.steps > 0 || match.calories > 0 : false,
      };
    });
  }

  if (period === 'weekly') {
    // Past 4 weeks (W-3, W-2, W-1, This Week)
    const points: DayChartPoint[] = [];
    for (let w = 3; w >= 0; w--) {
      const start = new Date();
      start.setDate(start.getDate() - (w * 7 + 6));
      const end = new Date();
      end.setDate(end.getDate() - w * 7);

      const sStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const eStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      const res = await driver.getFirstAsync<{
        steps: number;
        calories: number;
        duration: number;
      }>(
        `SELECT 
           COALESCE(SUM(steps), 0) as steps,
           COALESCE(SUM(calories), 0) as calories,
           COALESCE(SUM(duration), 0) as duration
         FROM activities
         WHERE date >= ? AND date <= ?;`,
        [sStr, eStr]
      );

      points.push({
        date: sStr,
        dayLabel: w === 0 ? 'This Wk' : `Wk -${w}`,
        steps: Number(res?.steps || 0),
        calories: Number(res?.calories || 0),
        duration: Number(res?.duration || 0),
        hasActivity: Number(res?.steps || 0) > 0 || Number(res?.calories || 0) > 0,
      });
    }
    return points;
  }

  // Monthly: Last 6 months
  const points: DayChartPoint[] = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);

    const sStr = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}-01`;
    const eStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;

    const res = await driver.getFirstAsync<{
      steps: number;
      calories: number;
      duration: number;
    }>(
      `SELECT 
         COALESCE(SUM(steps), 0) as steps,
         COALESCE(SUM(calories), 0) as calories,
         COALESCE(SUM(duration), 0) as duration
       FROM activities
       WHERE date >= ? AND date <= ?;`,
      [sStr, eStr]
    );

    const monthLabel = targetMonth.toLocaleDateString('en-US', { month: 'short' });
    points.push({
      date: sStr,
      dayLabel: monthLabel,
      steps: Number(res?.steps || 0),
      calories: Number(res?.calories || 0),
      duration: Number(res?.duration || 0),
      hasActivity: Number(res?.steps || 0) > 0 || Number(res?.calories || 0) > 0,
    });
  }

  return points;
}

export async function getStreakInfo(): Promise<StreakInfo> {
  const driver = await getDatabaseDriver();
  const today = getTodayDateString();

  const rows = await driver.getAllAsync<{ date: string }>(
    `SELECT DISTINCT date FROM activities ORDER BY date DESC;`
  );

  const datesWithActivity = new Set(rows.map((r) => r.date));
  const hasActivityToday = datesWithActivity.has(today);

  // Consecutive streak calculation
  let currentStreak = 0;
  let checkDate = new Date();

  // If no activity today, check if yesterday had activity (streak is maintained until end of today)
  if (!hasActivityToday) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (!datesWithActivity.has(yStr)) {
      currentStreak = 0;
    } else {
      while (true) {
        const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (datesWithActivity.has(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  } else {
    // Activity today! Count backwards
    while (true) {
      const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (datesWithActivity.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Week Grid (M T W T F S S)
  const { days } = getWeekDateRange();
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekGrid: WeekDayCheckmark[] = days.map((dateStr, i) => ({
    day: dayNames[i],
    date: dateStr,
    checked: datesWithActivity.has(dateStr),
    isToday: dateStr === today,
  }));

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, datesWithActivity.size > 0 ? 1 : 0),
    weekGrid,
    extendedToday: hasActivityToday,
  };
}

export async function getGoals(): Promise<UserGoals> {
  const driver = await getDatabaseDriver();
  const row = await driver.getFirstAsync<UserGoals>(
    `SELECT step_target, calorie_target, active_minutes_target FROM goals WHERE id = 1;`
  );
  if (!row) {
    return { step_target: 10000, calorie_target: 600, active_minutes_target: 45 };
  }
  return {
    step_target: Number(row.step_target || 10000),
    calorie_target: Number(row.calorie_target || 600),
    active_minutes_target: Number(row.active_minutes_target || 45),
  };
}

export async function updateGoals(goals: Partial<UserGoals>): Promise<UserGoals> {
  const current = await getGoals();
  const stepTarget = Math.max(100, Math.round(Number(goals.step_target ?? current.step_target)));
  const calorieTarget = Math.max(50, Math.round(Number(goals.calorie_target ?? current.calorie_target)));
  const minutesTarget = Math.max(5, Math.round(Number(goals.active_minutes_target ?? current.active_minutes_target)));

  const driver = await getDatabaseDriver();
  await driver.runAsync(
    `UPDATE goals 
     SET step_target = ?, calorie_target = ?, active_minutes_target = ? 
     WHERE id = 1;`,
    [stepTarget, calorieTarget, minutesTarget]
  );

  return {
    step_target: stepTarget,
    calorie_target: calorieTarget,
    active_minutes_target: minutesTarget,
  };
}

export async function getProfile(): Promise<UserProfile> {
  const driver = await getDatabaseDriver();
  const row = await driver.getFirstAsync<any>('SELECT * FROM profile WHERE id = 1;');
  if (!row) {
    return {
      name: 'Alex Hunter',
      avatarUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      weightKg: 74.5,
      heightCm: 178,
      age: 26,
      gender: 'Male',
      memberTier: 'KINETIC PRO ATHLETE',
      joinedDate: 'Jan 2024',
    };
  }
  return {
    name: row.name || 'Alex Hunter',
    avatarUri: row.avatar_uri || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    weightKg: Number(row.weight_kg) || 74.5,
    heightCm: Number(row.height_cm) || 178,
    age: Number(row.age) || 26,
    gender: row.gender || 'Male',
    memberTier: row.member_tier || 'KINETIC PRO ATHLETE',
    joinedDate: row.joined_date || 'Jan 2024',
  };
}

export async function updateProfileInDb(newProfile: Partial<UserProfile>): Promise<UserProfile> {
  const driver = await getDatabaseDriver();
  const current = await getProfile();
  const updated: UserProfile = {
    name: newProfile.name ?? current.name,
    avatarUri: newProfile.avatarUri ?? current.avatarUri,
    weightKg: newProfile.weightKg ?? current.weightKg,
    heightCm: newProfile.heightCm ?? current.heightCm,
    age: newProfile.age ?? current.age,
    gender: newProfile.gender ?? current.gender,
    memberTier: newProfile.memberTier ?? current.memberTier,
    joinedDate: newProfile.joinedDate ?? current.joinedDate,
  };

  await driver.runAsync(
    `UPDATE profile 
     SET name = ?, avatar_uri = ?, weight_kg = ?, height_cm = ?, age = ?, gender = ?, member_tier = ?, joined_date = ? 
     WHERE id = 1;`,
    [
      updated.name,
      updated.avatarUri,
      updated.weightKg,
      updated.heightCm,
      updated.age,
      updated.gender,
      updated.memberTier,
      updated.joinedDate,
    ]
  );

  return updated;
}

export async function getTelemetry(): Promise<BiometricTelemetry> {
  const driver = await getDatabaseDriver();
  const row = await driver.getFirstAsync<any>('SELECT * FROM telemetry WHERE id = 1;');
  if (!row) {
    return DEFAULT_TELEMETRY;
  }
  return {
    restHeartRateBpm: Number(row.rest_heart_rate_bpm ?? 48),
    hrvMs: Number(row.hrv_ms ?? 74),
    sleepHours: Number(row.sleep_hours ?? 8),
    sleepMinutes: Number(row.sleep_minutes ?? 15),
    sleepRestScorePct: Number(row.sleep_rest_score_pct ?? 92),
    readinessPct: Number(row.readiness_pct ?? 88),
    strainScore: Number(row.strain_score ?? 14.8),
    waterMl: Number(row.water_ml ?? 2250),
    waterTargetMl: Number(row.water_target_ml ?? 3000),
    estBodyFatPct: Number(row.est_body_fat_pct ?? 14.2),
  };
}

export async function updateTelemetryInDb(
  newTelemetry: Partial<BiometricTelemetry>
): Promise<BiometricTelemetry> {
  const driver = await getDatabaseDriver();
  const current = await getTelemetry();
  const updated: BiometricTelemetry = {
    restHeartRateBpm: newTelemetry.restHeartRateBpm ?? current.restHeartRateBpm,
    hrvMs: newTelemetry.hrvMs ?? current.hrvMs,
    sleepHours: newTelemetry.sleepHours ?? current.sleepHours,
    sleepMinutes: newTelemetry.sleepMinutes ?? current.sleepMinutes,
    sleepRestScorePct: newTelemetry.sleepRestScorePct ?? current.sleepRestScorePct,
    readinessPct: newTelemetry.readinessPct ?? current.readinessPct,
    strainScore: newTelemetry.strainScore ?? current.strainScore,
    waterMl: newTelemetry.waterMl ?? current.waterMl,
    waterTargetMl: newTelemetry.waterTargetMl ?? current.waterTargetMl,
    estBodyFatPct: newTelemetry.estBodyFatPct ?? current.estBodyFatPct,
  };

  await driver.runAsync(
    `UPDATE telemetry 
     SET rest_heart_rate_bpm = ?, hrv_ms = ?, sleep_hours = ?, sleep_minutes = ?, sleep_rest_score_pct = ?, readiness_pct = ?, strain_score = ?, water_ml = ?, water_target_ml = ?, est_body_fat_pct = ? 
     WHERE id = 1;`,
    [
      updated.restHeartRateBpm,
      updated.hrvMs,
      updated.sleepHours,
      updated.sleepMinutes,
      updated.sleepRestScorePct,
      updated.readinessPct,
      updated.strainScore,
      updated.waterMl,
      updated.waterTargetMl,
      updated.estBodyFatPct,
    ]
  );

  return updated;
}

