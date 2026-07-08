// ─── Plan Exercises (persistent, not date-specific) ───────────────────
// Stored as { cardio: string[], strength: string[], stretch: string[], balance: string[] }

export function getPlanExercises() {
  try {
    return JSON.parse(localStorage.getItem('plan:exercises')) || {
      cardio: [], strength: [], stretch: [], balance: [],
    };
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
