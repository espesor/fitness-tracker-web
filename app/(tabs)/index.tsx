import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProgressRing } from '../../components/ProgressRing';
import { CategorySection } from '../../components/CategorySection';
import { useTodayLogs } from '../../hooks/useTodayLogs';
import { CATEGORIES, CATEGORY_KEYS, TARGETS } from '../../constants/Categories';
import { Exercise } from '../../types';
import { formatTodayFull } from '../../utils/date';

function getProgress(exercises: Exercise[], categoryKey: string): number {
  const catExercises = exercises.filter((e) => e.category === categoryKey);
  if (catExercises.length === 0) return 0;

  const target = TARGETS[categoryKey as keyof typeof TARGETS];
  if (target.kind === 'sessions') {
    return Math.min(100, (catExercises.length / target.value) * 100);
  }
  // minutes-based
  const totalMin = catExercises.reduce((sum, e) => sum + (e.duration ?? 0), 0);
  return Math.min(100, (totalMin / target.value) * 100);
}

export default function TodayScreen() {
  const { exercises, loading, removeExercise } = useTodayLogs();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Dark Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{formatTodayFull().toUpperCase()}</Text>
        <Text style={styles.title}>Today</Text>

        {/* Progress rings — one per category */}
        <View style={styles.ringsRow}>
          {CATEGORY_KEYS.map((key) => {
            const cat = CATEGORIES[key];
            const pct = getProgress(exercises, key);
            return (
              <View key={key} style={styles.ringItem}>
                <View style={styles.ringWrapper}>
                  <ProgressRing progress={pct} color={cat.color} size={54} strokeWidth={5} />
                  <View style={styles.ringCenter}>
                    <Text
                      style={[
                        styles.ringPct,
                        { color: pct > 0 ? cat.color : 'rgba(255,255,255,0.3)' },
                      ]}
                    >
                      {Math.round(pct)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.ringLabel}>{cat.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Exercise Sections ────────────────────────────────────────── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORY_KEYS.map((key) => (
          <CategorySection
            key={key}
            category={CATEGORIES[key]}
            exercises={exercises.filter((e) => e.category === key)}
            onAdd={() =>
              router.push({
                pathname: '/log',
                params: { category: key },
              })
            }
            onRemove={removeExercise}
          />
        ))}
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/log')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#111827',
  },
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
    paddingBottom: 20,
  },
  dateText: {
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ringItem: {
    alignItems: 'center',
    gap: 6,
  },
  ringWrapper: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringPct: {
    fontSize: 10,
    fontWeight: '700',
  },
  ringLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  contentInner: {
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 76,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
  },
});
