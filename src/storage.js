// ─── Exercise Logs ────────────────────────────────────────────────────

export function getLogsForDate(dateStr) {
  try { return JSON.parse(localStorage.getItem(`logs:${dateStr}`)) || []; }
  catch { return []; }
}

export function saveLogsForDate(dateStr, exercises) {
  localStorage.setItem(`logs:${dateStr}`, JSON.stringify(exercises));
}

// ─── Weekly Plan ──────────────────────────────────────────────────────

export function getWeekPlan(weekStart) {
  try { return JSON.parse(localStorage.getItem(`plan:${weekStart}`)) || null; }
  catch { return null; }
}

export function saveWeekPlan(plan) {
  localStorage.setItem(`plan:${plan.weekStart}`, JSON.stringify(plan));
}

// ─── Exercise Name Hints (per-category user history) ─────────────────

export function getHints(category) {
  try { return JSON.parse(localStorage.getItem(`hints:${category}`)) || []; }
  catch { return []; }
}

/** Add a name to the front of this category's history (max 30 entries). */
export function addHint(category, name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const hints = getHints(category).filter((h) => h.toLowerCase() !== trimmed.toLowerCase());
  hints.unshift(trimmed);
  localStorage.setItem(`hints:${category}`, JSON.stringify(hints.slice(0, 30)));
}

/** Remove a single name from this category's history. */
export function deleteHint(category, name) {
  const hints = getHints(category).filter((h) => h !== name);
  localStorage.setItem(`hints:${category}`, JSON.stringify(hints));
}

// ─── Export / Import / Clear ──────────────────────────────────────────

export function exportAllData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('logs:') || key.startsWith('plan:') || key.startsWith('hints:')) {
      data[key] = JSON.parse(localStorage.getItem(key));
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
