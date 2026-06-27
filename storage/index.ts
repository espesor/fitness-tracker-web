import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, WeekPlan } from '../types';
import { getWeekDates } from '../utils/date';

// ─── Exercise Logs ────────────────────────────────────────────────────────────

/** Load exercises logged on a specific date (YYYY-MM-DD). */
export async function getLogsForDate(date: string): Promise<Exercise[]> {
  try {
    const raw = await AsyncStorage.getItem(`logs:${date}`);
    return raw ? (JSON.parse(raw) as Exercise[]) : [];
  } catch {
    return [];
  }
}

/** Persist exercise array for a specific date. */
export async function saveLogsForDate(date: string, exercises: Exercise[]): Promise<void> {
  await AsyncStorage.setItem(`logs:${date}`, JSON.stringify(exercises));
}

/** Load all logs for every day of a given week. weekStart must be a Monday date string. */
export async function getLogsForWeek(
  weekStart: string,
): Promise<Record<string, Exercise[]>> {
  const weekDates = getWeekDates(weekStart);
  const entries = await Promise.all(
    weekDates.map(async ({ day, date }) => ({
      day,
      exercises: await getLogsForDate(date),
    })),
  );
  return Object.fromEntries(entries.map(({ day, exercises }) => [day, exercises]));
}

// ─── Weekly Plan ──────────────────────────────────────────────────────────────

/** Load the saved plan for the given week. Returns null if none exists yet. */
export async function getWeekPlan(weekStart: string): Promise<WeekPlan | null> {
  try {
    const raw = await AsyncStorage.getItem(`plan:${weekStart}`);
    return raw ? (JSON.parse(raw) as WeekPlan) : null;
  } catch {
    return null;
  }
}

/** Persist a weekly plan. */
export async function saveWeekPlan(plan: WeekPlan): Promise<void> {
  await AsyncStorage.setItem(`plan:${plan.weekStart}`, JSON.stringify(plan));
}
