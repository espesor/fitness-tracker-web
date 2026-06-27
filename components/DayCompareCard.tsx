import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../types';
import { CATEGORIES } from '../constants/Categories';
import { getTodayDayOfWeek } from '../utils/date';

interface DayCompareCardProps {
  day: string;
  dateLabel: string;
  planText: string;
  exercises: Exercise[];
}

type Status = 'done' | 'partial' | 'today' | 'upcoming' | 'missed';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getStatus(day: string, exercises: Exercise[], planText: string): Status {
  const todayDay = getTodayDayOfWeek();
  const todayIdx = DAY_ORDER.indexOf(todayDay);
  const dayIdx = DAY_ORDER.indexOf(day);
  const hasPlan = planText.trim().length > 0;

  if (day === todayDay) return 'today';
  if (dayIdx > todayIdx) return 'upcoming';
  if (!hasPlan) return 'upcoming';
  if (exercises.length === 0) return 'missed';
  return exercises.length >= 2 ? 'done' : 'partial';
}

const STATUS_CFG: Record<Status, { label: string; color: string }> = {
  done:     { label: 'Done',     color: '#059669' },
  partial:  { label: 'Partial',  color: '#D97706' },
  today:    { label: 'Today',    color: '#2563EB' },
  upcoming: { label: 'Upcoming', color: '#9CA3AF' },
  missed:   { label: 'Missed',   color: '#DC2626' },
};

function formatExercise(ex: Exercise): string {
  return ex.category === 'strength'
    ? `${ex.sets ?? 0}×${ex.reps ?? 0} @ ${ex.weight ?? 0} lb`
    : `${ex.duration ?? 0} min`;
}

export function DayCompareCard({ day, dateLabel, planText, exercises }: DayCompareCardProps) {
  const status = getStatus(day, exercises, planText);
  const cfg = STATUS_CFG[status];
  const isFuture = status === 'upcoming';

  return (
    <View style={styles.card}>
      {/* Day header */}
      <View style={[styles.dayHeader, styles.border]}>
        <View style={styles.dayLeft}>
          <Text style={styles.dayName}>{day}</Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>
        <View style={styles.badge}>
          <View style={[styles.badgeDot, { backgroundColor: cfg.color }]} />
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Plan section */}
      <View style={[styles.section, styles.planBg, styles.border]}>
        <View style={styles.sectionLabelRow}>
          <Ionicons name="clipboard-outline" size={11} color="#9CA3AF" />
          <Text style={styles.sectionLabel}>  PLAN</Text>
        </View>
        <Text style={styles.planText}>{planText.trim() || 'Rest day'}</Text>
      </View>

      {/* Actual section */}
      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <Ionicons name="checkmark" size={11} color="#9CA3AF" />
          <Text style={styles.sectionLabel}>  ACTUAL</Text>
        </View>
        {exercises.length === 0 ? (
          <Text style={styles.emptyActual}>
            {isFuture ? 'Not yet logged' : 'Nothing logged'}
          </Text>
        ) : (
          <View style={styles.exList}>
            {exercises.map((ex) => {
              const catColor = CATEGORIES[ex.category]?.color ?? '#9CA3AF';
              return (
                <View key={ex.id} style={styles.exRow}>
                  <View style={[styles.exDot, { backgroundColor: catColor }]} />
                  <View style={styles.exInfo}>
                    <View style={styles.exNameRow}>
                      <Text style={styles.exName}>{ex.name}</Text>
                      <Text style={styles.exMetrics}> · {formatExercise(ex)}</Text>
                    </View>
                    {ex.note ? <Text style={styles.exNote}>{ex.note}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  border: { borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  dateLabel: { fontSize: 12, color: '#9CA3AF' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeDot: { width: 7, height: 7, borderRadius: 3.5 },
  badgeText: { fontSize: 12, fontWeight: '500' },
  section: { paddingVertical: 9, paddingHorizontal: 14 },
  planBg: { backgroundColor: '#F9FAFB' },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  sectionLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.8 },
  planText: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  emptyActual: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  exList: { gap: 6 },
  exRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  exDot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 5, flexShrink: 0 },
  exInfo: { flex: 1 },
  exNameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  exName: { fontSize: 13, fontWeight: '500', color: '#111827' },
  exMetrics: { fontSize: 12, color: '#6B7280' },
  exNote: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 1 },
});
