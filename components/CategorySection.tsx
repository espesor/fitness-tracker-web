import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ExerciseItem } from './ExerciseItem';
import { Exercise } from '../types';
import { CategoryConfig } from '../constants/Categories';

interface CategorySectionProps {
  category: CategoryConfig;
  exercises: Exercise[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function CategorySection({
  category,
  exercises,
  onAdd,
  onRemove,
}: CategorySectionProps) {
  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={[styles.header, exercises.length > 0 && styles.headerBorder]}>
        <View style={styles.headerLeft}>
          <View style={[styles.dot, { backgroundColor: category.color }]} />
          <Text style={styles.label}>{category.label.toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: category.bgColor }]}
          onPress={onAdd}
          activeOpacity={0.7}
        >
          <Text style={[styles.addBtnText, { color: category.color }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise list or empty state */}
      {exercises.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nothing logged yet</Text>
        </View>
      ) : (
        exercises.map((ex, i) => (
          <ExerciseItem
            key={ex.id}
            exercise={ex}
            category={category}
            isLast={i === exercises.length - 1}
            onRemove={() => onRemove(ex.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  headerBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
