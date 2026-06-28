import { useState, useEffect } from 'react';
import { CATEGORIES, DAYS } from '../constants';
import { getWeekPlan, saveWeekPlan, getLogsForDate } from '../storage';
import { getWeekStart, getWeekLabel, getWeekDates, getTodayDayOfWeek, formatExercise, parseLocalDate } from '../utils';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EMPTY_DAYS = Object.fromEntries(DAYS.map((d) => [d, '']));

function getDotStatus(day, exercises) {
  const todayDay = getTodayDayOfWeek();
  const todayIdx = DAY_ORDER.indexOf(todayDay);
  const dayIdx   = DAY_ORDER.indexOf(day);
  if (day === todayDay)   return 'today';
  if (dayIdx > todayIdx)  return 'upcoming';
  if (!exercises.length)  return 'upcoming';
  return exercises.length >= 2 ? 'done' : 'partial';
}

function getCompareStatus(day, exercises, planText) {
  const todayDay = getTodayDayOfWeek();
  const todayIdx = DAY_ORDER.indexOf(todayDay);
  const dayIdx   = DAY_ORDER.indexOf(day);
  if (day === todayDay)   return { label: 'Today',    color: '#2563EB' };
  if (dayIdx > todayIdx)  return { label: 'Upcoming', color: '#8C9BAD' };
  if (!planText.trim())   return { label: 'Rest',     color: '#8C9BAD' };
  if (!exercises.length)  return { label: 'Missed',   color: '#DC2626' };
  return exercises.length >= 2 ? { label: 'Done', color: '#059669' } : { label: 'Partial', color: '#D97706' };
}

const DOT_STYLES = {
  done:     { dot: '✓', bg: 'bg-emerald-50 dark:bg-emerald-950/30',  border: 'border-emerald-200 dark:border-emerald-800', ic: 'text-emerald-600 dark:text-emerald-400', lc: 'text-emerald-600 dark:text-emerald-400' },
  partial:  { dot: '—', bg: 'bg-amber-50 dark:bg-amber-950/30',      border: 'border-amber-200 dark:border-amber-800',     ic: 'text-amber-600 dark:text-amber-400',     lc: 'text-amber-600 dark:text-amber-400' },
  today:    { dot: '●', bg: 'bg-blue-50 dark:bg-blue-950/30',        border: 'border-blue-200 dark:border-blue-800',       ic: 'text-blue-600 dark:text-blue-400',       lc: 'text-blue-600 dark:text-blue-400' },
  upcoming: { dot: '○', bg: 'bg-[#F6F8FB] dark:bg-[#1E2840]',        border: 'border-[#DDE3EC] dark:border-[#2A3547]',     ic: 'text-[#8C9BAD] dark:text-[#4E6080]',     lc: 'text-[#8C9BAD] dark:text-[#4E6080]' },
};

const textPrimary = 'text-[#1B2B3E] dark:text-[#D8E4F5]';
const textSecond  = 'text-[#52657A] dark:text-[#7B8FAD]';
const textMuted   = 'text-[#8C9BAD] dark:text-[#4E6080]';
const cardCls     = 'bg-white dark:bg-[#1E2840] border border-[#DDE3EC] dark:border-[#2A3547] rounded-2xl overflow-hidden';
const dividerCls  = 'border-b border-[#EEF0F5] dark:border-[#2A3547]';
const labelCls    = `text-xs font-bold uppercase tracking-wider ${textMuted}`;
const inputCls    = `w-full bg-white dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547]
  rounded-xl px-4 py-3 text-base ${textPrimary} placeholder-[#8C9BAD] resize-none
  focus:outline-none focus:ring-2 focus:ring-blue-400`;

export default function PlanScreen() {
  const [mode,     setMode]     = useState('compare');
  const [plan,     setPlan]     = useState(null);
  const [weekLogs, setWeekLogs] = useState({});
  const [editDays, setEditDays] = useState({});

  const weekStart = getWeekStart();
  const weekLabel = getWeekLabel(weekStart);
  const weekDates = getWeekDates(weekStart);

  useEffect(() => {
    const saved = getWeekPlan(weekStart);
    const p = saved || { weekStart, days: { ...EMPTY_DAYS } };
    setPlan(p);
    setEditDays({ ...p.days });
    const logs = {};
    weekDates.forEach(({ day, date }) => { logs[day] = getLogsForDate(date); });
    setWeekLogs(logs);
  }, [weekStart]);

  function handleSave() {
    const updated = { weekStart, days: editDays };
    saveWeekPlan(updated);
    setPlan(updated);
    setMode('compare');
  }

  if (!plan) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────── */}
      <div className="bg-[#3D5068] dark:bg-[#141D2E] px-5 pt-3 pb-5 flex-shrink-0">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{weekLabel}</p>
        <h1 className="text-4xl font-bold text-white mb-4">Weekly Plan</h1>
        <div className="flex gap-2">
          {[['compare', 'Compare'], ['edit', 'Edit plan']].map(([m, l]) => (
            <button key={m}
              onClick={() => { setMode(m); if (m === 'edit') setEditDays({ ...plan.days }); }}
              className={`flex-1 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                mode === m ? 'bg-amber-500 text-white' : 'bg-white/8 text-white/50 border border-white/15'
              }`}
            >{l}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#EDF0F5] dark:bg-[#161D2C] p-3.5 pb-24 space-y-3">

        {/* ── EDIT MODE ───────────────────────────── */}
        {mode === 'edit' && (<>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 flex gap-2.5 text-sm text-blue-800 dark:text-blue-300">
            <span>💡</span>
            <span>Write each day's plan freely — e.g. "Bike 30 min, RDL 30 lb 3×7". No special format needed.</span>
          </div>

          {DAYS.map((day) => {
            const entry     = weekDates.find((d) => d.day === day);
            const dateLabel = entry ? parseLocalDate(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            return (
              <div key={day}>
                <div className={`flex items-baseline gap-1.5 mb-1.5 ${textPrimary}`}>
                  <span className="text-sm font-bold uppercase tracking-wide">{day}</span>
                  <span className={`text-sm ${textMuted}`}>· {dateLabel}</span>
                </div>
                <textarea
                  value={editDays[day] || ''}
                  onChange={(e) => setEditDays({ ...editDays, [day]: e.target.value })}
                  placeholder="e.g. Bike 30 min, RDL 30 lb 3×7"
                  rows={2}
                  className={inputCls}
                />
              </div>
            );
          })}

          <button onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-colors">
            ✓ Done — view comparison
          </button>
        </>)}

        {/* ── COMPARE MODE ────────────────────────── */}
        {mode === 'compare' && (<>
          {/* Week at a glance */}
          <div className={`${cardCls} p-4`}>
            <h3 className={`text-base font-bold mb-4 ${textPrimary}`}>Week at a glance</h3>
            <div className="flex justify-between">
              {DAYS.map((day) => {
                const s = DOT_STYLES[getDotStatus(day, weekLogs[day] || [])];
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold ${s.bg} ${s.border} ${s.ic}`}>
                      {s.dot}
                    </div>
                    <span className={`text-[10px] font-bold ${s.lc}`}>{day}</span>
                  </div>
                );
              })}
            </div>
            <div className={`flex flex-wrap gap-4 mt-4 pt-3 border-t border-[#EEF0F5] dark:border-[#2A3547]`}>
              {[['Done','bg-emerald-500'],['Partial','bg-amber-500'],['Today','bg-blue-500'],['Upcoming','bg-[#8C9BAD]']].map(([l,c])=>(
                <div key={l} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${c}`} />
                  <span className={`text-sm ${textMuted}`}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day cards */}
          {DAYS.map((day) => {
            const entry     = weekDates.find((d) => d.day === day);
            const dateLabel = entry ? parseLocalDate(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            const exercises = weekLogs[day] || [];
            const planText  = plan.days[day] || '';
            const status    = getCompareStatus(day, exercises, planText);

            return (
              <div key={day} className={cardCls}>
                {/* Day row */}
                <div className={`flex items-center justify-between px-4 py-3 ${dividerCls}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${textPrimary}`}>{day}</span>
                    <span className={`text-sm ${textMuted}`}>{dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: status.color }} />
                    <span className="text-sm font-semibold" style={{ color: status.color }}>{status.label}</span>
                  </div>
                </div>

                {/* Plan */}
                <div className={`px-4 py-3 bg-[#F6F8FB] dark:bg-[#1A2232] ${dividerCls}`}>
                  <div className={`flex items-center gap-1.5 mb-1.5 ${labelCls}`}>
                    <span>📋</span><span>Plan</span>
                  </div>
                  <p className={`text-base leading-snug ${textSecond}`}>{planText.trim() || 'Rest day'}</p>
                </div>

                {/* Actual */}
                <div className="px-4 py-3">
                  <div className={`flex items-center gap-1.5 mb-2 ${labelCls}`}>
                    <span>✓</span><span>Actual</span>
                  </div>
                  {exercises.length === 0 ? (
                    <p className={`text-base italic ${textMuted}`}>
                      {status.label === 'Upcoming' || status.label === 'Today' ? 'Not yet logged' : 'Nothing logged'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {exercises.map((ex) => {
                        const catColor = CATEGORIES[ex.category]?.color || '#8C9BAD';
                        return (
                          <div key={ex.id} className="flex items-start gap-2.5">
                            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: catColor }} />
                            <div>
                              <span className={`text-base font-semibold ${textPrimary}`}>{ex.name}</span>
                              <span className={`text-sm ${textSecond}`}> · {formatExercise(ex)}</span>
                              {ex.note && <div className={`text-sm italic ${textMuted}`}>{ex.note}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>)}
      </div>
    </div>
  );
}
