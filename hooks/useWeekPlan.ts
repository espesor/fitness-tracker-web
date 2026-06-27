import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Exercise, WeekPlan } from '../types';
import { getWeekPlan, saveWeekPlan, getLogsForWeek } from '../storage';
import { getWeekStart } from '../utils/date';
import { DAYS } from '../constants/Categories';

const EMPTY_DAYS = Object.fromEntries(DAYS.map((d) => [d, '']));

export function useWeekPlan() {
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [weekLogs, setWeekLogs] = useState<Record<string, Exercise[]>>({});
  const [loading, setLoading] = useState(true);

  const weekStart = getWeekStart();

  const load = useCallback(async () => {
    setLoading(true);
    const [savedPlan, logs] = await Promise.all([
      getWeekPlan(weekStart),
      getLogsForWeek(weekStart),
    ]);
    setPlan(
      savedPlan ?? {
        weekStart,
        days: { ...EMPTY_DAYS },
      },
    );
    setWeekLogs(logs);
    setLoading(false);
  }, [weekStart]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  /** Persist the full plan (called when the user finishes editing). */
  const savePlan = useCallback(
    async (days: Record<string, string>): Promise<void> => {
      const updated: WeekPlan = { weekStart, days };
      await saveWeekPlan(updated);
      setPlan(updated);
    },
    [weekStart],
  );

  return { plan, weekLogs, loading, savePlan, reload: load };
}
