import { Platform } from 'react-native';

export interface IDatabaseDriver {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
}

let activeDriver: IDatabaseDriver | null = null;

export async function getDatabaseDriver(): Promise<IDatabaseDriver> {
  if (activeDriver) return activeDriver;

  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

  if (isNative) {
    try {
      const { openDatabaseSync } = require('expo-sqlite');
      const nativeDb = openDatabaseSync('fitness.db');
      activeDriver = {
        async execAsync(sql: string) {
          return nativeDb.execAsync(sql);
        },
        async runAsync(sql: string, params: any[] = []) {
          return nativeDb.runAsync(sql, params);
        },
        async getAllAsync<T = any>(sql: string, params: any[] = []) {
          return nativeDb.getAllAsync(sql, params) as Promise<T[]>;
        },
        async getFirstAsync<T = any>(sql: string, params: any[] = []) {
          return nativeDb.getFirstAsync(sql, params) as Promise<T | null>;
        },
      };
      return activeDriver;
    } catch (err) {
      console.warn('Native SQLite fallback to storage:', err);
    }
  }

  // Web or Node environment
  activeDriver = createWebOrNodeDriver();
  return activeDriver;
}

function createWebOrNodeDriver(): IDatabaseDriver {
  // If running in browser, use persistent LocalStorage store directly
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    return createMemoryStorageDriver();
  }

  // If in Node.js (CLI / Unit testing), use native node:sqlite
  try {
    // @ts-ignore
    const { DatabaseSync } = require('node:sqlite');
    const path = require('path');
    const dbPath = path.join(process.cwd(), 'fitness_local.db');
    const nodeDb = new DatabaseSync(dbPath);

    return {
      async execAsync(sql: string) {
        nodeDb.exec(sql);
      },
      async runAsync(sql: string, params: any[] = []) {
        const stmt = nodeDb.prepare(sql);
        const result = stmt.run(...params);
        return {
          lastInsertRowId: Number(result.lastInsertRowid || 0),
          changes: Number(result.changes || 0),
        };
      },
      async getAllAsync<T = any>(sql: string, params: any[] = []) {
        const stmt = nodeDb.prepare(sql);
        return stmt.all(...params) as T[];
      },
      async getFirstAsync<T = any>(sql: string, params: any[] = []) {
        const stmt = nodeDb.prepare(sql);
        const res = stmt.get(...params);
        return (res as T) || null;
      },
    };
  } catch (e) {
    return createMemoryStorageDriver();
  }
}

function createMemoryStorageDriver(): IDatabaseDriver {
  let activities: any[] = [];
  let goals: any = { id: 1, step_target: 10000, calorie_target: 600, active_minutes_target: 45 };
  let profile: any = {
    id: 1,
    name: 'Alex Hunter',
    avatar_uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    weight_kg: 74.5,
    height_cm: 178,
    age: 26,
    gender: 'Male',
    member_tier: 'KINETIC PRO ATHLETE',
    joined_date: 'Jan 2024',
  };
  let telemetry: any = {
    id: 1,
    rest_heart_rate_bpm: 48,
    hrv_ms: 74,
    sleep_hours: 8,
    sleep_minutes: 15,
    sleep_rest_score_pct: 92,
    readiness_pct: 88,
    strain_score: 14.8,
    water_ml: 2250,
    water_target_ml: 3000,
    est_body_fat_pct: 14.2,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedActs = window.localStorage.getItem('makefit_activities');
      if (savedActs) activities = JSON.parse(savedActs);
      const savedGoals = window.localStorage.getItem('makefit_goals');
      if (savedGoals) goals = JSON.parse(savedGoals);
      const savedProfile = window.localStorage.getItem('makefit_user_profile');
      if (savedProfile) profile = JSON.parse(savedProfile);
      const savedTelemetry = window.localStorage.getItem('makefit_biometric_telemetry');
      if (savedTelemetry) telemetry = JSON.parse(savedTelemetry);
    } catch (err) {
      console.warn('LocalStorage load error:', err);
    }
  }

  const persist = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('makefit_activities', JSON.stringify(activities));
        window.localStorage.setItem('makefit_goals', JSON.stringify(goals));
        window.localStorage.setItem('makefit_user_profile', JSON.stringify(profile));
        window.localStorage.setItem('makefit_biometric_telemetry', JSON.stringify(telemetry));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
    }
  };

  return {
    async execAsync(sql: string) {
      // DDL operations in memory store
    },
    async runAsync(sql: string, params: any[] = []) {
      const lower = sql.toLowerCase().trim();
      if (lower.startsWith('insert into activities')) {
        const [id, date, type, duration, steps, calories, timestamp] = params;
        activities.unshift({ id, date, type, duration, steps, calories, timestamp });
        persist();
        return { lastInsertRowId: 1, changes: 1 };
      }
      if (lower.startsWith('update activities')) {
        const [date, type, duration, steps, calories, timestamp, id] = params;
        const idx = activities.findIndex((a) => a.id === id);
        if (idx !== -1) {
          activities[idx] = { id, date, type, duration, steps, calories, timestamp };
          persist();
          return { lastInsertRowId: 1, changes: 1 };
        }
        return { lastInsertRowId: 0, changes: 0 };
      }
      if (lower.startsWith('delete from activities')) {
        const [id] = params;
        const initial = activities.length;
        activities = activities.filter((a) => a.id !== id);
        persist();
        return { lastInsertRowId: 0, changes: initial - activities.length };
      }
      if (lower.startsWith('update goals') || lower.startsWith('insert or replace into goals')) {
        if (params.length >= 3) {
          goals = { id: 1, step_target: params[0], calorie_target: params[1], active_minutes_target: params[2] };
          persist();
        }
        return { lastInsertRowId: 1, changes: 1 };
      }
      if (lower.startsWith('update profile') || lower.startsWith('insert or replace into profile')) {
        if (params.length >= 8) {
          profile = {
            id: 1,
            name: params[0],
            avatar_uri: params[1],
            weight_kg: Number(params[2]),
            height_cm: Number(params[3]),
            age: Number(params[4]),
            gender: params[5],
            member_tier: params[6],
            joined_date: params[7],
          };
          persist();
        }
        return { lastInsertRowId: 1, changes: 1 };
      }
      if (lower.startsWith('update telemetry') || lower.startsWith('insert or replace into telemetry')) {
        if (params.length >= 10) {
          telemetry = {
            id: 1,
            rest_heart_rate_bpm: Number(params[0]),
            hrv_ms: Number(params[1]),
            sleep_hours: Number(params[2]),
            sleep_minutes: Number(params[3]),
            sleep_rest_score_pct: Number(params[4]),
            readiness_pct: Number(params[5]),
            strain_score: Number(params[6]),
            water_ml: Number(params[7]),
            water_target_ml: Number(params[8]),
            est_body_fat_pct: Number(params[9]),
          };
          persist();
        }
        return { lastInsertRowId: 1, changes: 1 };
      }
      return { lastInsertRowId: 0, changes: 0 };
    },
    async getAllAsync<T = any>(sql: string, params: any[] = []) {
      const lower = sql.toLowerCase().trim();
      if (lower.includes('from activities') && lower.includes('order by')) {
        return [...activities].sort((a, b) => b.timestamp - a.timestamp) as T[];
      }
      if (lower.includes('distinct date from activities')) {
        const dates = Array.from(new Set(activities.map((a) => a.date))).sort().reverse();
        return dates.map((d) => ({ date: d })) as T[];
      }
      if (lower.includes('group by date')) {
        const [start, end] = params;
        const filtered = activities.filter((a) => a.date >= start && a.date <= end);
        const map: { [key: string]: { steps: number; calories: number; duration: number } } = {};
        for (const item of filtered) {
          if (!map[item.date]) map[item.date] = { steps: 0, calories: 0, duration: 0 };
          map[item.date].steps += Number(item.steps || 0);
          map[item.date].calories += Number(item.calories || 0);
          map[item.date].duration += Number(item.duration || 0);
        }
        return Object.keys(map).map((k) => ({
          date: k,
          steps: map[k].steps,
          calories: map[k].calories,
          duration: map[k].duration,
        })) as T[];
      }
      return activities as T[];
    },
    async getFirstAsync<T = any>(sql: string, params: any[] = []) {
      const lower = sql.toLowerCase().trim();
      if (lower.includes('from goals')) {
        return { ...goals } as T;
      }
      if (lower.includes('from profile')) {
        return { ...profile } as T;
      }
      if (lower.includes('from telemetry')) {
        return { ...telemetry } as T;
      }
      if (lower.includes('from activities where id =')) {
        const [id] = params;
        const found = activities.find((a) => a.id === id);
        return (found || null) as T | null;
      }
      if (lower.includes('coalesce(sum(steps)') && lower.includes('where date = ?')) {
        const [d] = params;
        const match = activities.filter((a) => a.date === d);
        const totalSteps = match.reduce((acc, curr) => acc + (Number(curr.steps) || 0), 0);
        const totalCalories = match.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
        const totalDuration = match.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
        return {
          totalSteps,
          totalCalories,
          totalDuration,
          steps: totalSteps,
          calories: totalCalories,
          duration: totalDuration,
          workoutCount: match.length,
        } as T;
      }
      if (lower.includes('coalesce(sum(steps)') && lower.includes('where date >=')) {
        const [start, end] = params;
        const match = activities.filter((a) => a.date >= start && a.date <= end);
        const totalSteps = match.reduce((acc, curr) => acc + (Number(curr.steps) || 0), 0);
        const totalCalories = match.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
        const totalDuration = match.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
        return {
          totalSteps,
          totalCalories,
          totalDuration,
          steps: totalSteps,
          calories: totalCalories,
          duration: totalDuration,
          workoutCount: match.length,
        } as T;
      }
      return null;
    },
  };
}
