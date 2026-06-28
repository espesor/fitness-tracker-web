import { useState, useEffect } from 'react';
import { CATEGORIES, CAT_KEYS, EXERCISE_LIBRARY } from '../constants';
import { getLogsForDate, saveLogsForDate, getHints, addHint, deleteHint } from '../storage';
import { getTodayString } from '../utils';

export default function LogScreen({ initialCategory, editExercise, onClose }) {
  const isEdit = !!editExercise;

  const [category, setCategory] = useState(editExercise?.category || initialCategory || 'cardio');
  const [name,     setName]     = useState(editExercise?.name     || '');
  const [duration, setDuration] = useState(editExercise?.duration?.toString() || '');
  const [weight,   setWeight]   = useState(editExercise?.weight?.toString()   || '');
  const [sets,     setSets]     = useState(editExercise?.sets?.toString()     || '');
  const [reps,     setReps]     = useState(editExercise?.reps?.toString()     || '');
  const [note,     setNote]     = useState(editExercise?.note     || '');
  const [showSugg, setShowSugg] = useState(false);
  const [hints,    setHints]    = useState([]);
  const [saved,    setSaved]    = useState(false);

  const cat = CATEGORIES[category];

  // Reload hints whenever category changes
  useEffect(() => {
    setHints(getHints(category));
  }, [category]);

  function handleCategoryChange(key) {
    setCategory(key);
    if (!isEdit) { setName(''); setDuration(''); setWeight(''); setSets(''); setReps(''); }
    setShowSugg(false);
  }

  function handleDeleteHint(e, hintName) {
    e.stopPropagation();
    deleteHint(category, hintName);
    setHints((h) => h.filter((x) => x !== hintName));
  }

  // Build suggestion list: user hints first, then library names (deduped)
  const lowerName = name.toLowerCase();
  const hintSet   = new Set(hints.map((h) => h.toLowerCase()));
  const filtered  = [
    ...hints.filter((h) => !lowerName || h.toLowerCase().includes(lowerName))
      .map((h) => ({ name: h, isHint: true })),
    ...EXERCISE_LIBRARY[category]
      .filter((s) => (!lowerName || s.toLowerCase().includes(lowerName)) && !hintSet.has(s.toLowerCase()))
      .map((s) => ({ name: s, isHint: false })),
  ].slice(0, 8);

  function handleSave() {
    if (!name.trim()) return;
    const today  = getTodayString();
    const logs   = getLogsForDate(today);
    const entry  = {
      id:        isEdit ? editExercise.id : Date.now().toString(),
      name:      name.trim(),
      category,
      note:      note.trim(),
      timestamp: isEdit ? editExercise.timestamp : Date.now(),
      duration:  parseFloat(duration) || 0,
      ...(category === 'strength' && {
        weight: parseFloat(weight) || 0,
        sets:   parseInt(sets,  10) || 0,
        reps:   parseInt(reps,  10) || 0,
      }),
      ...((category === 'balance') && {
        sets: parseInt(sets, 10) || 0,
        reps: parseInt(reps, 10) || 0,
      }),
    };

    if (isEdit) {
      const idx = logs.findIndex((e) => e.id === editExercise.id);
      if (idx !== -1) logs[idx] = entry; else logs.push(entry);
    } else {
      logs.push(entry);
    }

    saveLogsForDate(today, logs);
    addHint(category, name.trim());
    setSaved(true);
    setTimeout(onClose, 500);
  }

  // ── Shared input class ──────────────────────────────────────
  const inputCls = `w-full bg-white dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547]
    rounded-xl px-4 py-3 text-base text-[#1B2B3E] dark:text-[#D8E4F5]
    placeholder-[#8C9BAD] focus:outline-none focus:ring-2 focus:ring-blue-400`;

  const labelCls = `block text-xs font-bold text-[#52657A] dark:text-[#7B8FAD]
    uppercase tracking-wider mb-2`;

  const numBoxCls = `bg-white dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547]
    rounded-xl py-3 px-2 text-center`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#3D5068] dark:bg-[#141D2E] px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={onClose} className="text-white/60 text-2xl leading-none mr-1">←</button>
        <h2 className="text-xl font-semibold text-white">{isEdit ? 'Edit exercise' : 'Log exercise'}</h2>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#EDF0F5] dark:bg-[#161D2C] p-4 space-y-5">

        {/* Category selector */}
        <div className="grid grid-cols-2 gap-2">
          {CAT_KEYS.map((key) => {
            const c      = CATEGORIES[key];
            const active = category === key;
            return (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-semibold border transition-all ${
                  active ? 'text-white border-transparent' : 'bg-white dark:bg-[#1E2840] text-[#1B2B3E] dark:text-[#D8E4F5] border-[#DDE3EC] dark:border-[#2A3547]'
                }`}
                style={active ? { background: c.color } : {}}
              >
                <span className="text-xl">{c.icon}</span>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Exercise name */}
        <div>
          <label className={labelCls}>Exercise name</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setShowSugg(true); }}
            onFocus={() => setShowSugg(true)}
            placeholder={`e.g. ${EXERCISE_LIBRARY[category][0]}`}
            className={inputCls}
          />

          {/* Suggestions */}
          {showSugg && filtered.length > 0 && (
            <div className="mt-1 bg-white dark:bg-[#1E2840] border border-[#DDE3EC] dark:border-[#2A3547] rounded-xl overflow-hidden">
              {filtered.map(({ name: sName, isHint }) => (
                <div
                  key={sName}
                  className={`flex items-center px-4 py-3 border-b border-[#EEF0F5] dark:border-[#2A3547] last:border-0 cursor-pointer
                    hover:bg-[#F6F8FB] dark:hover:bg-[#242F42] transition-colors
                    ${isHint ? 'bg-[#F6F8FB]/60 dark:bg-[#242F42]/40' : ''}`}
                  onClick={() => { setName(sName); setShowSugg(false); }}
                >
                  <span className="text-sm mr-2.5 text-[#8C9BAD]">{isHint ? '🕐' : '🔍'}</span>
                  <span className="flex-1 text-base text-[#1B2B3E] dark:text-[#D8E4F5]">{sName}</span>
                  {isHint && (
                    <button
                      onClick={(e) => handleDeleteHint(e, sName)}
                      className="ml-2 text-[#C0CAD8] dark:text-[#3A4A5E] hover:text-red-400 text-xl leading-none px-1"
                      title="Remove from history"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── STRENGTH: weight + sets + reps + optional time ── */}
        {cat.formType === 'strength' && (<>
          <div>
            <label className={labelCls}>Details</label>
            <div className="grid grid-cols-3 gap-2">
              {[['Weight (lb)', weight, setWeight], ['Sets', sets, setSets], ['Reps', reps, setReps]].map(([lbl, val, setter]) => (
                <div key={lbl} className={numBoxCls}>
                  <div className="text-xs text-[#8C9BAD] dark:text-[#4E6080] mb-1.5">{lbl}</div>
                  <input type="number" inputMode="decimal" value={val} onChange={(e) => setter(e.target.value)}
                    placeholder="0"
                    className="w-full text-center text-3xl font-bold text-[#1B2B3E] dark:text-[#D8E4F5] bg-transparent focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>
              Time <span className="font-normal normal-case tracking-normal text-[#8C9BAD]">(optional)</span>
            </label>
            <div className="bg-white dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547] rounded-xl px-5 py-4 flex items-center gap-3">
              <input type="number" inputMode="decimal" value={duration} onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="flex-1 text-4xl font-bold text-[#1B2B3E] dark:text-[#D8E4F5] bg-transparent focus:outline-none" />
              <span className="text-xl text-[#8C9BAD]">min</span>
            </div>
          </div>
        </>)}

        {/* ── BALANCE: sets + reps + optional duration ── */}
        {cat.formType === 'balance' && (<>
          <div>
            <label className={labelCls}>Details</label>
            <div className="grid grid-cols-2 gap-2">
              {[['Sets', sets, setSets], ['Reps', reps, setReps]].map(([lbl, val, setter]) => (
                <div key={lbl} className={numBoxCls}>
                  <div className="text-xs text-[#8C9BAD] dark:text-[#4E6080] mb-1.5">{lbl}</div>
                  <input type="number" inputMode="decimal" value={val} onChange={(e) => setter(e.target.value)}
                    placeholder="0"
                    className="w-full text-center text-3xl font-bold text-[#1B2B3E] dark:text-[#D8E4F5] bg-transparent focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>
              Duration <span className="font-normal normal-case tracking-normal text-[#8C9BAD]">(optional)</span>
            </label>
            <div className="bg-white dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547] rounded-xl px-5 py-4 flex items-center gap-3">
              <input type="number" inputMode="decimal" value={duration} onChange={(e) => setDuration(e.target.value)}
                placeholder="10"
                className="flex-1 text-4xl font-bold text-[#1B2B3E] dark:text-[#D8E4F5] bg-transparent focus:outline-none" />
              <span className="text-xl text-[#8C9BAD]">min</span>
            </div>
          </div>
        </>)}

        {/* ── DURATION (cardio + stretch) ── */}
        {cat.formType === 'duration' && (
          <div>
            <label className={labelCls}>Duration</label>
            <div className="bg-white dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547] rounded-xl px-5 py-4 flex items-center gap-3">
              <input type="number" inputMode="decimal" value={duration} onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="flex-1 text-5xl font-bold text-[#1B2B3E] dark:text-[#D8E4F5] bg-transparent focus:outline-none" />
              <span className="text-2xl text-[#8C9BAD]">min</span>
            </div>
          </div>
        )}

        {/* Note */}
        <div>
          <label className={labelCls}>
            Note <span className="font-normal normal-case tracking-normal text-[#8C9BAD]">(optional)</span>
          </label>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="How did it feel? Any plan adjustments?"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl text-white text-lg font-bold transition-colors ${saved ? 'bg-emerald-500' : ''}`}
          style={!saved ? { background: cat.color } : {}}
        >
          {saved ? '✓ Saved!' : isEdit ? 'Update exercise' : 'Save exercise'}
        </button>
      </div>
    </div>
  );
}
