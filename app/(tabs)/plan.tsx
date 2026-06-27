import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeekPlan } from '../../hooks/useWeekPlan';
import { DayCompareCard } from '../../components/DayCompareCard';
import { WeekGlance } from '../../components/WeekGlance';
import { DAYS } from '../../constants/Categories';
import { getWeekLabel, getDayLabel, getWeekDates, parseLocalDate } from '../../utils/date';

type PlanMode = 'compare' | 'edit';

export default function PlanScreen() {
  const [mode, setMode] = useState<PlanMode>('compare');
  const [editDays, setEditDays] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { plan, weekLogs, loading, savePlan } = useWeekPlan();

  // Sync edit buffer when plan data arrives (or on mode switch)
  useEffect(() => {
    if (plan) {
      setEditDays({ ...plan.days });
    }
  }, [plan]);

  async function handleFinishEdit() {
    setSaving(true);
    await savePlan(editDays);
    setSaving(false);
    setMode('compare');
  }

  if (loading || !plan) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </SafeAreaView>
    );
  }

  const weekLabel = getWeekLabel(plan.weekStart);
  const weekDates = getWeekDates(plan.weekStart);

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.weekText}>{weekLabel.toUpperCase()}</Text>
        <Text style={styles.title}>Weekly Plan</Text>

        {/* Mode toggle */}
        <View style={styles.toggleRow}>
          {(['compare', 'edit'] as PlanMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
              onPress={() => (m === 'edit' ? setMode('edit') : setMode('compare'))}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m === 'compare' ? 'Compare' : 'Edit plan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Compare View ─────────────────────────────────────────────── */}
      {mode === 'compare' && (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          <WeekGlance plan={plan} weekLogs={weekLogs} />

          {DAYS.map((day) => {
            const entry = weekDates.find((d) => d.day === day);
            const dateLabel = entry
              ? parseLocalDate(entry.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : '';
            return (
              <DayCompareCard
                key={day}
                day={day}
                dateLabel={dateLabel}
                planText={plan.days[day] ?? ''}
                exercises={weekLogs[day] ?? []}
              />
            );
          })}
        </ScrollView>
      )}

      {/* ── Edit View ────────────────────────────────────────────────── */}
      {mode === 'edit' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Hint */}
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.hintText}>
                Write each day's plan freely — e.g. "Bike 30 min, RDL 30 lb 3×7". Switch to
                Compare at the weekend to review adherence.
              </Text>
            </View>

            {/* One textarea per day */}
            {DAYS.map((day) => {
              const entry = weekDates.find((d) => d.day === day);
              const dateLabel = entry
                ? parseLocalDate(entry.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '';
              return (
                <View key={day} style={styles.editBlock}>
                  <Text style={styles.editDayLabel}>
                    {day}
                    <Text style={styles.editDateSub}> · {dateLabel}</Text>
                  </Text>
                  <TextInput
                    style={styles.editTextarea}
                    value={editDays[day] ?? ''}
                    onChangeText={(v) => setEditDays((prev) => ({ ...prev, [day]: v }))}
                    placeholder="e.g. Bike 30 min, RDL 30 lb 3×7"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    returnKeyType="default"
                  />
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.doneBtn, saving && { opacity: 0.65 }]}
              onPress={handleFinishEdit}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.doneBtnText}>
                {saving ? 'Saving…' : 'Done — view comparison'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111827' },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  weekText: {
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  toggleBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  toggleTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  contentInner: {
    padding: 14,
    paddingBottom: 50,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 14,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  editBlock: {
    marginBottom: 14,
  },
  editDayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  editDateSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    textTransform: 'none',
    letterSpacing: 0,
  },
  editTextarea: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 62,
    lineHeight: 20,
  },
  doneBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
