import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../types';
import { CategoryConfig } from '../constants/Categories';

interface ExerciseItemProps {
  exercise: Exercise;
  category: CategoryConfig;
  isLast: boolean;
  onRemove: () => void;
}

function formatMetrics(ex: Exercise): string {
  if (ex.category === 'strength') {
    return `${ex.sets ?? 0}×${ex.reps ?? 0} @ ${ex.weight ?? 0} lb`;
  }
  return `${ex.duration ?? 0} min`;
}

export function ExerciseItem({ exercise, category, isLast, onRemove }: ExerciseItemProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={[styles.iconBox, { backgroundColor: category.bgColor }]}>
        <Ionicons name={category.icon as any} size={16} color={category.color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.metrics}>{formatMetrics(exercise)}</Text>
        {exercise.note ? <Text style={styles.note}>{exercise.note}</Text> : null}
      </View>

      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash-outline" size={16} color="#D1D5DB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
    marginTop: 1,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  metrics: {
    fontSize: 12,
    color: '#6B7280',
  },
  note: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  removeBtn: {
    paddingLeft: 8,
    paddingTop: 4,
    flexShrink: 0,
  },
});
