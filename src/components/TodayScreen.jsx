import { useState, useEffect, useCallback } from 'react';
import ProgressRing from './ProgressRing';
import { CATEGORIES, CAT_KEYS, TARGETS } from '../constants';
import { getPlanExercises, getLogsForDate, saveLogsForDate } from '../storage';
import { getTodayString, formatTodayFull } from '../utils';

function getProgress(items, cat) {
  const checked = (items[cat] || []).filter((i) => i.checked).length;
  return Math.min(100, (checked / TARGETS[cat]) * 100);
}

export default function TodayScreen({ onOpenSettings }) {
  // items: { cardio: [{name, checked, note}], strength: [...], ... }
  const [items, setItems] = useState(null);

  useEffect(() => {
    const plan   = getPlanExercises();
    const saved  = getLogsForDate(getTodayString());

    // Build today state: plan exercises merged with saved state
    const state = {};
    CAT_KEYS.forEach((cat) => {
      state[cat] = (plan[cat] || []).map((name) => {
        const s = saved.find((e) => e.category === cat && e.name === name);
        return { name, checked: s?.checked || false, note: s?.note || '' };
      });
    });
    setItems(state);
  }, []);

  // Auto-save to localStorage whenever items change
  const persist = useCallback((state) => {
    const log = [];
    CAT_KEYS.forEach((cat) => {
      (state[cat] || []).forEach((item) => {
        log.push({ name: item.name, category: cat, checked: item.checked, note: item.note });
      });
    });
    saveLogsForDate(getTodayString(), log);
  }, []);

  function toggle(cat, idx) {
    setItems((prev) => {
      const updated = {
        ...prev,
        [cat]: prev[cat].map((item, i) =>
          i === idx ? { ...item, checked: !item.checked } : item
        ),
      };
      persist(updated);
      return updated;
    });
  }

  function updateNote(cat, idx, note) {
    setItems((prev) => {
      const updated = {
        ...prev,
        [cat]: prev[cat].map((item, i) =>
          i === idx ? { ...item, note } : item
        ),
      };
      persist(updated);
      return updated;
    });
  }

  if (!items) return null;

  const isEmpty = CAT_KEYS.every((cat) => (items[cat] || []).length === 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header with rings ─────────────────────────── */}
      <div className="bg-[#3D5068] dark:bg-[#141D2E] px-5 pt-3 pb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/50 uppercase tracking-widest">{formatTodayFull()}</p>
          <button onClick={onOpenSettings} className="text-white/50 hover:text-white/80 text-xl transition-colors" title="Settings">
            ⚙️
          </button>
        </div>
        <h1 className="text-4xl font-bold text-white mb-6">Today</h1>

        {/* Progress rings */}
        <div className="flex justify-around">
          {CAT_KEYS.map((key) => {
            const cat = CATEGORIES[key];
            const pct = getProgress(items, key);
            const checked = (items[key] || []).filter((i) => i.checked).length;
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <div className="relative" style={{ width: 56, height: 56 }}>
                  <ProgressRing progress={pct} color={cat.color} size={56} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold"
                      style={{ color: pct > 0 ? cat.color : 'rgba(255,255,255,0.25)' }}>
                      {Math.round(pct)}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-white/50 font-medium">{cat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Exercise checklists ───────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#EDF0F5] dark:bg-[#161D2C] p-3.5 pb-10 space-y-3">

        {isEmpty && (
          <div className="bg-white dark:bg-[#1E2840] rounded-2xl border border-[#DDE3EC] dark:border-[#2A3547] p-6 text-center">
            <p className="text-lg text-[#8C9BAD] dark:text-[#4E6080] mb-1">No exercises planned yet</p>
            <p className="text-sm text-[#8C9BAD] dark:text-[#4E6080]">Go to the Plan tab to add your regular exercises.</p>
          </div>
        )}

        {CAT_KEYS.map((key) => {
          const cat   = CATEGORIES[key];
          const list  = items[key] || [];
          if (list.length === 0) return null;

          const checked = list.filter((i) => i.checked).length;
          const target  = TARGETS[key];

          return (
            <div key={key} className="bg-white dark:bg-[#1E2840] rounded-2xl border border-[#DDE3EC] dark:border-[#2A3547] overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEF0F5] dark:border-[#2A3547]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-xs font-bold text-[#52657A] dark:text-[#7B8FAD] uppercase tracking-widest">
                    {cat.label}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: checked >= target ? cat.color : '#8C9BAD' }}>
                  {checked}/{target}
                </span>
              </div>

              {/* Exercise items */}
              {list.map((item, idx) => (
                <div key={item.name}
                  className={`px-4 py-3 ${idx < list.length - 1 ? 'border-b border-[#EEF0F5] dark:border-[#2A3547]' : ''}`}
                >
                  {/* Checkbox row */}
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => toggle(key, idx)}
                  >
                    {/* Custom checkbox */}
                    <div
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors`}
                      style={{
                        borderColor: item.checked ? cat.color : '#C0CAD8',
                        background:  item.checked ? cat.color : 'transparent',
                      }}
                    >
                      {item.checked && (
                        <svg viewBox="0 0 12 10" className="w-4 h-4" fill="none">
                          <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <span className={`text-base font-medium flex-1 transition-colors ${
                      item.checked
                        ? 'text-[#8C9BAD] dark:text-[#4E6080] line-through'
                        : 'text-[#1B2B3E] dark:text-[#D8E4F5]'
                    }`}>
                      {item.name}
                    </span>
                  </div>

                  {/* Note input — visible when checked */}
                  {item.checked && (
                    <div className="mt-2 ml-10">
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => updateNote(key, idx, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Add a note... (e.g. 185 lb, felt good)"
                        className="w-full bg-[#F6F8FB] dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547]
                          rounded-lg px-3 py-2 text-sm text-[#1B2B3E] dark:text-[#D8E4F5]
                          placeholder-[#8C9BAD] focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
