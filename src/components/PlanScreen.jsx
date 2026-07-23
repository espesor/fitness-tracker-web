import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, CAT_KEYS, EXERCISE_LIBRARY } from '../constants';
import { getPlanExercises, savePlanExercises } from '../storage';

export default function PlanScreen() {
  const [plan, setPlan]           = useState({ cardio: [], strength: [], stretch: [], balance: [] });
  const [editingKey, setEditingKey] = useState(null);   // `${cat}:${idx}` or null
  const [editValue, setEditValue]   = useState('');
  const [addingCat, setAddingCat]   = useState(null);   // category key or null
  const [newName, setNewName]       = useState('');
  const [showSugg, setShowSugg]     = useState(false);
  const editInputRef = useRef(null);
  const addInputRef  = useRef(null);

  useEffect(() => { setPlan(getPlanExercises()); }, []);

  // Focus edit input when it appears
  useEffect(() => {
    if (editingKey && editInputRef.current) editInputRef.current.focus();
  }, [editingKey]);

  // Focus add input when it appears
  useEffect(() => {
    if (addingCat && addInputRef.current) addInputRef.current.focus();
  }, [addingCat]);

  function persist(updated) {
    setPlan(updated);
    savePlanExercises(updated);
  }

  // ── Edit existing ──────────────────────────────────────
  function startEdit(cat, idx) {
    setAddingCat(null);
    setEditingKey(`${cat}:${idx}`);
    setEditValue(plan[cat][idx]);
  }

  function confirmEdit(cat, idx) {
    const trimmed = editValue.trim();
    if (!trimmed) { setEditingKey(null); return; }
    persist({ ...plan, [cat]: plan[cat].map((n, i) => (i === idx ? trimmed : n)) });
    setEditingKey(null);
  }

  function cancelEdit() { setEditingKey(null); }

  // ── Delete ─────────────────────────────────────────────
  function deleteItem(cat, idx) {
    persist({ ...plan, [cat]: plan[cat].filter((_, i) => i !== idx) });
  }

  // ── Add new ────────────────────────────────────────────
  function startAdd(cat) {
    setEditingKey(null);
    setAddingCat(cat);
    setNewName('');
    setShowSugg(false);
  }

  function confirmAdd(cat) {
    const trimmed = newName.trim();
    if (!trimmed) { setAddingCat(null); return; }
    persist({ ...plan, [cat]: [...plan[cat], trimmed] });
    setAddingCat(null);
    setNewName('');
    setShowSugg(false);
  }

  function cancelAdd() { setAddingCat(null); setNewName(''); setShowSugg(false); }

  // ── Shared styles ──────────────────────────────────────
  const t1  = 'text-[#1B2B3E] dark:text-[#D8E4F5]';
  const t2  = 'text-[#52657A] dark:text-[#7B8FAD]';
  const t3  = 'text-[#8C9BAD] dark:text-[#4E6080]';
  const inp = `bg-[#F6F8FB] dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547]
    rounded-xl px-3 py-2 text-base ${t1} placeholder-[#8C9BAD]
    focus:outline-none focus:ring-2 focus:ring-blue-400`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header ───────────────────────────────── */}
      <div className="bg-[#3D5068] dark:bg-[#141D2E] px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-5 flex-shrink-0">
        <h1 className="text-4xl font-bold text-white mb-1">Plan</h1>
        <p className="text-sm text-white/50">Your regular exercises by category</p>
      </div>

      {/* ── Category lists ───────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#EDF0F5] dark:bg-[#161D2C] p-3.5 pb-10 space-y-3">

        {CAT_KEYS.map((key) => {
          const cat  = CATEGORIES[key];
          const list = plan[key] || [];

          // Suggestions for add input: library names not already in the plan
          const planSet = new Set(list.map((n) => n.toLowerCase()));
          const suggs   = EXERCISE_LIBRARY[key].filter(
            (s) =>
              (!newName || s.toLowerCase().includes(newName.toLowerCase())) &&
              !planSet.has(s.toLowerCase())
          );

          return (
            <div key={key} className="bg-white dark:bg-[#1E2840] rounded-2xl border border-[#DDE3EC] dark:border-[#2A3547] overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#EEF0F5] dark:border-[#2A3547]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color }}>
                  {cat.icon} {cat.label}
                </span>
                <span className={`text-xs ml-auto ${t3}`}>{list.length} exercise{list.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Exercise items */}
              {list.length === 0 && !addingCat && (
                <div className={`px-4 py-3 text-sm ${t3} italic`}>No exercises yet — add one below</div>
              )}

              {list.map((name, idx) => {
                const eKey   = `${key}:${idx}`;
                const isEdit = editingKey === eKey;

                return (
                  <div key={`${name}-${idx}`}
                    className={`flex items-center gap-2 px-4 py-3 ${idx < list.length - 1 || addingCat === key ? 'border-b border-[#EEF0F5] dark:border-[#2A3547]' : ''}`}
                  >
                    {isEdit ? (
                      <>
                        {/* Inline edit input */}
                        <input
                          ref={editInputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmEdit(key, idx);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className={`flex-1 ${inp}`}
                        />
                        <button onClick={() => confirmEdit(key, idx)}
                          className="text-emerald-600 dark:text-emerald-400 font-bold text-lg px-1 leading-none" title="Save">✓</button>
                        <button onClick={cancelEdit}
                          className={`${t3} font-bold text-xl px-1 leading-none`} title="Cancel">✗</button>
                      </>
                    ) : (
                      <>
                        {/* Bullet + name */}
                        <span className={`text-sm mr-1 ${t3}`}>•</span>
                        <span className={`flex-1 text-base font-medium ${t1}`}>{name}</span>
                        {/* Edit / Delete */}
                        <button onClick={() => startEdit(key, idx)}
                          className={`${t3} hover:text-blue-500 transition-colors text-lg px-1`} title="Edit">
                          ✎
                        </button>
                        <button onClick={() => deleteItem(key, idx)}
                          className={`${t3} hover:text-red-400 transition-colors text-xl px-1 leading-none`} title="Delete">
                          ×
                        </button>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Add input area */}
              {addingCat === key ? (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      ref={addInputRef}
                      value={newName}
                      onChange={(e) => { setNewName(e.target.value); setShowSugg(true); }}
                      onFocus={() => setShowSugg(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmAdd(key);
                        if (e.key === 'Escape') cancelAdd();
                      }}
                      placeholder="Exercise name…"
                      className={`flex-1 ${inp}`}
                    />
                    <button onClick={() => confirmAdd(key)}
                      className="bg-emerald-600 text-white font-semibold px-3 py-2 rounded-xl text-sm whitespace-nowrap">
                      Add
                    </button>
                    <button onClick={cancelAdd}
                      className={`${t3} text-xl leading-none px-1`} title="Cancel">✗</button>
                  </div>

                  {/* Suggestions */}
                  {showSugg && suggs.length > 0 && (
                    <div className="bg-[#F6F8FB] dark:bg-[#242F42] border border-[#DDE3EC] dark:border-[#2A3547] rounded-xl overflow-hidden">
                      {suggs.slice(0, 5).map((s) => (
                        <div key={s}
                          className={`px-3 py-2.5 text-sm cursor-pointer ${t1}
                            hover:bg-[#EDF0F5] dark:hover:bg-[#2A3547]
                            border-b border-[#EEF0F5] dark:border-[#2A3547] last:border-0
                            flex items-center gap-2`}
                          onClick={() => { setNewName(s); setShowSugg(false); }}
                        >
                          <span className={`text-xs ${t3}`}>🔍</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* + Add exercise button */
                <button
                  onClick={() => startAdd(key)}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors
                    hover:bg-[#F6F8FB] dark:hover:bg-[#232E44]`}
                  style={{ color: cat.color }}
                >
                  <span className="text-lg leading-none">+</span>
                  Add exercise
                </button>
              )}
            </div>
          );
        })}

        <p className={`text-xs text-center pb-2 ${t3}`}>
          Changes here update Today's checklist the next time you open it.
        </p>
      </div>
    </div>
  );
}
