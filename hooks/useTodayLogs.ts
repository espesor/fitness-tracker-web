import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Exercise } from '../types';
import { getLogsForDate, saveLogsForDate } from '../storage';
import { getTodayString } from '../utils/date';

export function useTodayLogs() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const logs = await getLogsForDate(getTodayString());
    setExercises(logs);
    setLoading(false);
  }, []);

  // Reload every time this screen gains focus (e.g. after returning from Log modal)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  /** Append a new exercise to today's log and persist it. */
  const addExercise = useCallback(async (exercise: Exercise): Promise<void> => {
    const today = getTodayString();
    // Always read fresh from storage to avoid stale state when called from modal
    const current = await getLogsForDate(today);
    const updated = [...current, exercise];
    await saveLogsForDate(today, updated);
    setExercises(updated);
  }, []);

  /** Remove a specific exercise by id from today's log. */
  const removeExercise = useCallback(
    async (id: string): Promise<void> => {
      const today = getTodayString();
      const updated = exercises.filter((e) => e.id !== id);
      await saveLogsForDate(today, updated);
      setExercises(updated);
    },
    [exercises],
  );

  return { exercises, loading, addExercise, removeExercise, reload: load };
}
