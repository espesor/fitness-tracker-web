import { useState, useEffect } from 'react';
import ProgressRing from './ProgressRing';
import { CATEGORIES, CAT_KEYS, TARGETS } from '../constants';
import { getLogsForDate, saveLogsForDate } from '../storage';
import { getTodayString, formatTodayFull, formatExercise } from '../utils';

function getProgress(exercises, catKey) {
  const items = exercises.filter((e) => e.category === catKey);
  if (!items.length) return 0;
  const t = TARGETS[catKey];
  if (t.kind === 'sessions') return Math.min(100, (items.length / t.value) * 100);
  return Math.min(100, (items.reduce((s, e) => s + (e.duration || 0), 0) / t.value) * 100);
}

export default function TodayScreen({ onAddExercise, onEditExercise, onOpenSettings }) {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    setExercises(getLogsForDate(getTodayString()));
  }, []);

  function handleRemove(id) {
    const updated = exercises.filter((e) => e.id !== id);
    saveLogsForDate(getTodayString(), updated);
    setExercises(updated);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
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
            const pct = getProgress(exercises, key);
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

      {/* ── Category sections ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#EDF0F5] dark:bg-[#161D2C] p-3.5 pb-24 space-y-3">
        {CAT_KEYS.map((key) => {
          const cat = CATEGORIES[key];
          const items = exercises.filter((e) => e.category === key);
          return (
            <div key={key}
              className="bg-white dark:bg-[#1E2840] rounded-2xl border border-[#DDE3EC] dark:border-[#2A3547] overflow-hidden">

              {/* Category header */}
              <div className={`flex items-center justify-between px-4 py-3 ${items.length ? 'border-b border-[#EEF0F5] dark:border-[#2A3547]' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-xs font-bold text-[#52657A] dark:text-[#7B8FAD] uppercase tracking-widest">
                    {cat.label}
                  </span>
                </div>
                <button
                  onClick={() => onAddExercise(key)}
                  className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  + Add
                </button>
              </div>

              {/* Exercise items */}
              {items.length === 0 ? (
                <div className="py-4 text-center text-sm text-[#8C9BAD] dark:text-[#4E6080]">
                  Nothing logged yet
                </div>
              ) : (
                items.map((ex, i) => (
                  <div
                    key={ex.id}
                    onClick={() => onEditExercise(ex)}
                    className={`flex items-start px-4 py-3 cursor-pointer
                      hover:bg-[#F6F8FB] dark:hover:bg-[#232E44] transition-colors
                      ${i < items.length - 1 ? 'border-b border-[#EEF0F5] dark:border-[#2A3547]' : ''}`}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mr-3 mt-0.5"
                      style={{ background: cat.bg }}>
                      {cat.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-[#1B2B3E] dark:text-[#D8E4F5]">
                        {ex.name}
                      </div>
                      <div className="text-sm text-[#52657A] dark:text-[#7B8FAD] mt-0.5">
                        {formatExercise(ex)}
                      </div>
                      {ex.note && (
                        <div className="text-sm text-[#8C9BAD] dark:text-[#4E6080] italic mt-0.5">
                          {ex.note}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3 mt-1">
                      <span className="text-xs text-[#C0CAD8] dark:text-[#2A3547]">edit</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(ex.id); }}
                        className="text-[#C0CAD8] dark:text-[#3A4A5E] hover:text-red-400 transition-colors text-2xl leading-none"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
