import { DEFAULT_PLAN } from './constants';

// ─── Plan Exercises (persistent, not date-specific) ───────────────────
// Stored as { cardio: string[], strength: string[], stretch: string[], balance: string[] }

export function getPlanExercises() {
  const raw = localStorage.getItem('plan:exercises');
  if (raw === null) {
    // First run — seed with defaults so the user isn't starting from a blank plan
    savePlanExercises(DEFAULT_PLAN);
    return DEFAULT_PLAN;
  }
  try {
    return JSON.parse(raw) || { cardio: [], strength: [], stretch: [], balance: [] };
  } catch {
    return { cardio: [], strength: [], stretch: [], balance: [] };
  }
}

export function savePlanExercises(exercises) {
  localStorage.setItem('plan:exercises', JSON.stringify(exercises));
}

// ─── Today's Log ──────────────────────────────────────────────────────
// Each entry: { name, category, checked, note }

export function getLogsForDate(dateStr) {
  try { return JSON.parse(localStorage.getItem(`logs:${dateStr}`)) || []; }
  catch { return []; }
}

export function saveLogsForDate(dateStr, log) {
  localStorage.setItem(`logs:${dateStr}`, JSON.stringify(log));
}

export function deleteLogsForDate(dateStr) {
  localStorage.removeItem(`logs:${dateStr}`);
}

// ─── Exercise Name Hints (per-category autocomplete history) ──────────

export function getHints(category) {
  try { return JSON.parse(localStorage.getItem(`hints:${category}`)) || []; }
  catch { return []; }
}

export function addHint(category, name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const hints = getHints(category).filter((h) => h.toLowerCase() !== trimmed.toLowerCase());
  hints.unshift(trimmed);
  localStorage.setItem(`hints:${category}`, JSON.stringify(hints.slice(0, 30)));
}

export function deleteHint(category, name) {
  const hints = getHints(category).filter((h) => h !== name);
  localStorage.setItem(`hints:${category}`, JSON.stringify(hints));
}

// ─── Export / Import / Clear ──────────────────────────────────────────

export function exportAllData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key.startsWith('logs:') ||
      key.startsWith('plan:') ||
      key.startsWith('hints:') ||
      key === 'theme'
    ) {
      try { data[key] = JSON.parse(localStorage.getItem(key)); }
      catch { data[key] = localStorage.getItem(key); }
    }
  }
  return data;
}

export function importAllData(data) {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
}

export function getLoggedDates() {
  const dates = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('logs:')) dates.push(key.slice(5));
  }
  return dates;
}

export function clearAllData() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('logs:') || key.startsWith('plan:') || key.startsWith('hints:')) {
      keys.push(key);
    }
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
