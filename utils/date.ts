/** Returns today as "YYYY-MM-DD" in local time */
export function getTodayString(): string {
  const d = new Date();
  return toDateString(d);
}

/** Returns the current day abbreviation, e.g. "Fri" */
export function getTodayDayOfWeek(): string {
  const keys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return keys[new Date().getDay()];
}

/** Returns "YYYY-MM-DD" for the Monday of the given date's week */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return toDateString(d);
}

/** Returns an array of { day, date } objects for all 7 days of the week */
export function getWeekDates(weekStart: string): Array<{ day: string; date: string }> {
  const start = parseLocalDate(weekStart);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return dayNames.map((day, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { day, date: toDateString(d) };
  });
}

/** Returns a human-readable week label, e.g. "Jun 23 – Jun 29, 2025" */
export function getWeekLabel(weekStart: string): string {
  const start = parseLocalDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

/** Returns "Mon Jun 23" style label for a day within a week */
export function getDayLabel(day: string, weekStart: string): string {
  const dates = getWeekDates(weekStart);
  const entry = dates.find((d) => d.day === day);
  if (!entry) return day;
  const d = parseLocalDate(entry.date);
  return `${day} · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

/** Returns "YYYY-MM-DD" for a Date in local time */
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parses "YYYY-MM-DD" as a local-time Date to avoid UTC midnight offset issues */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Returns "Monday, June 27" for today */
export function formatTodayFull(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
