export function getTodayString() {
  return toDateString(new Date());
}

export function getTodayDayOfWeek() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return toDateString(d);
}

export function getWeekDates(weekStart) {
  const start = parseLocalDate(weekStart);
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { day, date: toDateString(d) };
  });
}

export function getWeekLabel(weekStart) {
  const start = parseLocalDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', fmt)} – ${end.toLocaleDateString('en-US', { ...fmt, year: 'numeric' })}`;
}

export function formatTodayFull() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatExercise(ex) {
  const parts = [];
  if (ex.category === 'strength') {
    if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
    if (ex.weight)           parts.push(`@ ${ex.weight} lb`);
    if (ex.duration)         parts.push(`${ex.duration} min`);
  } else if (ex.category === 'balance') {
    if (ex.sets && ex.reps)  parts.push(`${ex.sets}×${ex.reps}`);
    if (ex.duration)         parts.push(`${ex.duration} min`);
  } else {
    if (ex.duration)         parts.push(`${ex.duration} min`);
  }
  return parts.join('  ') || '—';
}

function toDateString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseLocalDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
