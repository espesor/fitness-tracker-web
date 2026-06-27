import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise, WeekPlan } from '../types';
import { DAYS } from '../constants/Categories';
import { getTodayDayOfWeek } from '../utils/date';

interface WeekGlanceProps {
  plan: WeekPlan;
  weekLogs: Record<string, Exercise[]>;
}

type DotStatus = 'done' | 'partial' | 'today' | 'upcoming';
const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDotStatus(day: string, exercises: Exercise[]): DotStatus {
  const todayDay = getTodayDayOfWeek();
  const todayIdx = DAY_ORDER.indexOf(todayDay);
  const dayIdx = DAY_ORDER.indexOf(day);
  if (day === todayDay) return 'today';
  if (dayIdx > todayIdx) return 'upcoming';
  if (exercises.length === 0) return 'upcoming';
  return exercises.length >= 2 ? 'done' : 'partial';
}

const DOT_CFG: Record<DotStatus, { bg: string; border: string; icon: string; iconColor: string; labelColor: string }> = {
  done:     { bg: '#ECFDF5', border: '#A7F3D0', icon: 'checkmark',    iconColor: '#059669', labelColor: '#059669' },
  partial:  { bg: '#FFFBEB', border: '#FDE68A', icon: 'remove',       iconColor: '#D97706', labelColor: '#D97706' },
  today:    { bg: '#EFF6FF', border: '#BFDBFE', icon: 'ellipse',      iconColor: '#2563EB', labelColor: '#2563EB' },
  upcoming: { bg: '#F9FAFB', border: '#E5E7EB', icon: 'time-outline', iconColor: '#9CA3AF', labelColor: '#9CA3AF' },
};

export function WeekGlance({ plan, weekLogs }: WeekGlanceProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Week at a glance</Text>
      <View style={styles.dotRow}>
        {DAYS.map((day) => {
          const exercises = weekLogs[day] ?? [];
          const status = getDotStatus(day, exercises);
          const cfg = DOT_CFG[status];
          return (
            <View key={day} style={styles.dotItem}>
              <View style={[styles.dotBox, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                <Ionicons name={cfg.icon as any} size={14} color={cfg.iconColor} />
              </View>
              <Text style={[styles.dotLabel, { color: cfg.labelColor }]}>{day}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        {[
          { label: 'Done',     color: '#059669' },
          { label: 'Partial',  color: '#D97706' },
          { label: 'Today',    color: '#2563EB' },
          { label: 'Upcoming', color: '#9CA3AF' },
        ].map(({ label, color }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
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
    padding: 14,
    marginBottom: 12,
  },
  title: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  dotRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dotItem: { alignItems: 'center', gap: 4 },
  dotBox: { width: 34, height: 34, borderRadius: 9, borderWidth: 0.5, justifyContent: 'center', alignItems: 'center' },
  dotLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#F3F4F6' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11, color: '#6B7280' },
});
