import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTodayLogs } from '../hooks/useTodayLogs';
import { CATEGORIES, CATEGORY_KEYS } from '../constants/Categories';
import { EXERCISE_LIBRARY } from '../constants/Exercises';
import { Exercise, Category } from '../types';

export default function LogScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const initialCategory = (params.category as Category | undefined) ?? 'cardio';

  const [category, setCategory] = useState<Category>(initialCategory);
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('');
  const [weight, setWeight] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [note, setNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [saving, setSaving] = useState(false);

  const { addExercise } = useTodayLogs();

  const suggestions = EXERCISE_LIBRARY[category].filter(
    (name) => !exerciseName || name.toLowerCase().includes(exerciseName.toLowerCase()),
  );

  function handleCategoryChange(cat: Category) {
    setCategory(cat);
    setExerciseName('');
    setShowSuggestions(true);
  }

  async function handleSave() {
    if (!exerciseName.trim()) {
      Alert.alert('Exercise name required', 'Please enter or pick an exercise name.');
      return;
    }

    setSaving(true);

    const base = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      category,
      note: note.trim(),
      timestamp: Date.now(),
    };

    const exercise: Exercise =
      category === 'strength'
        ? {
            ...base,
            weight: parseFloat(weight) || 0,
            sets: parseInt(sets, 10) || 0,
            reps: parseInt(reps, 10) || 0,
          }
        : {
            ...base,
            duration: parseFloat(duration) || 0,
          };

    await addExercise(exercise);
    setSaving(false);
    router.back();
  }

  const cat = CATEGORIES[category];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log exercise</Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Category Selector ─────────────────────────────────────── */}
          <View style={styles.catGrid}>
            {CATEGORY_KEYS.map((key) => {
              const c = CATEGORIES[key];
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.catBtn,
                    active
                      ? { backgroundColor: c.color, borderColor: c.color }
                      : styles.catBtnInactive,
                  ]}
                  onPress={() => handleCategoryChange(key as Category)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={c.icon as any}
                    size={16}
                    color={active ? 'rgba(255,255,255,0.88)' : c.color}
                  />
                  <Text style={[styles.catBtnText, active && styles.catBtnTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Exercise Name ─────────────────────────────────────────── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Exercise name</Text>
            <TextInput
              style={styles.input}
              value={exerciseName}
              onChangeText={(v) => {
                setExerciseName(v);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={`e.g. ${EXERCISE_LIBRARY[category][0]}`}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              returnKeyType="done"
            />
            {/* Autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggList}>
                {suggestions.slice(0, 6).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.suggItem}
                    onPress={() => {
                      setExerciseName(s);
                      setShowSuggestions(false);
                    }}
                  >
                    <Ionicons name="search-outline" size={13} color="#9CA3AF" />
                    <Text style={styles.suggText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ── Dynamic Fields ────────────────────────────────────────── */}
          {category === 'strength' ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Details</Text>
              <View style={styles.detailRow}>
                {(
                  [
                    { label: 'Weight (lb)', val: weight, setter: setWeight },
                    { label: 'Sets', val: sets, setter: setSets },
                    { label: 'Reps', val: reps, setter: setReps },
                  ] as const
                ).map(({ label, val, setter }) => (
                  <View key={label} style={styles.detailBox}>
                    <Text style={styles.detailLabel}>{label}</Text>
                    <TextInput
                      style={styles.detailInput}
                      value={val}
                      onChangeText={setter as (v: string) => void}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      textAlign="center"
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Duration</Text>
              <View style={styles.durationRow}>
                <TextInput
                  style={styles.durationInput}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="30"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                <Text style={styles.durationUnit}>min</Text>
              </View>
            </View>
          )}

          {/* ── Note ─────────────────────────────────────────────────── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Note{' '}
              <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="How did it feel? Any plan adjustments?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* ── Save ─────────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: cat.color }, saving && { opacity: 0.65 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save exercise'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111827' },
  header: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white' },

  content: { flex: 1, backgroundColor: '#F0F2F5' },
  contentInner: { padding: 16, paddingBottom: 50 },

  // Category buttons — 2-per-row grid
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  catBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  catBtnInactive: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
  },
  catBtnText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  catBtnTextActive: { color: 'white' },

  // Fields
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
    color: '#9CA3AF',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 13,
    fontSize: 15,
    color: '#111827',
  },
  noteInput: {
    minHeight: 84,
    paddingTop: 12,
  },

  // Autocomplete
  suggList: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    marginTop: 4,
    overflow: 'hidden',
  },
  suggItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  suggText: { fontSize: 14, color: '#111827' },

  // Strength detail boxes
  detailRow: { flexDirection: 'row', gap: 8 },
  detailBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 6,
    textAlign: 'center',
  },
  detailInput: {
    fontSize: 30,
    fontWeight: '600',
    color: '#111827',
    width: '100%',
  },

  // Duration
  durationRow: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  durationInput: {
    flex: 1,
    fontSize: 42,
    fontWeight: '600',
    color: '#111827',
  },
  durationUnit: { fontSize: 20, color: '#9CA3AF' },

  // Save
  saveBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: 'white' },
});
