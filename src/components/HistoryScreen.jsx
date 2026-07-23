import { useState, useMemo } from 'react';
import { CATEGORIES, CAT_KEYS, TARGETS } from '../constants';
import { getLogsForDate, getLoggedDates, deleteLogsForDate } from '../storage';

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getCategoryDots(log) {
  const dots = [];
  CAT_KEYS.forEach((cat) => {
    const hasChecked = log.some((e) => e.category === cat && e.checked);
    if (hasChecked) dots.push(CATEGORIES[cat].color);
  });
  return dots;
}

function DayDetail({ dateStr, onClose, onDeleted }) {
  const log = getLogsForDate(dateStr);
  const grouped = {};
  CAT_KEYS.forEach((cat) => { grouped[cat] = log.filter((e) => e.category === cat); });
  const hasAny = log.length > 0;

  const [y, m, d] = dateStr.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  function handleDelete() {
    if (confirm(`Delete the log for ${label}? This cannot be undone.`)) {
      deleteLogsForDate(dateStr);
      onDeleted(dateStr);
      onClose();
    }
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#EDF0F5] dark:bg-[#161D2C]">
      <div className="bg-[#3D5068] dark:bg-[#141D2E] px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest">History</p>
          <h2 className="text-white text-lg font-semibold">{label}</h2>
        </div>
        <button onClick={onClose} className="text-gray-300 text-3xl leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-3.5 space-y-3">
        {!hasAny && (
          <div className="bg-white dark:bg-[#1E2840] rounded-2xl border border-[#DDE3EC] dark:border-[#2A3547] p-6 text-center">
            <p className="text-[#8C9BAD] dark:text-[#4E6080]">No exercises logged for this day.</p>
          </div>
        )}

        {CAT_KEYS.map((key) => {
          const list = grouped[key];
          if (!list || list.length === 0) return null;
          const cat = CATEGORIES[key];
          const checked = list.filter((e) => e.checked).length;
          const target = TARGETS[key];

          return (
            <div key={key} className="bg-white dark:bg-[#1E2840] rounded-2xl border border-[#DDE3EC] dark:border-[#2A3547] overflow-hidden">
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

              {list.map((item, idx) => (
                <div key={item.name}
                  className={`px-4 py-3 ${idx < list.length - 1 ? 'border-b border-[#EEF0F5] dark:border-[#2A3547]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: item.checked ? cat.color : '#C0CAD8',
                        background: item.checked ? cat.color : 'transparent',
                      }}
                    >
                      {item.checked && (
                        <svg viewBox="0 0 12 10" className="w-4 h-4" fill="none">
                          <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-base font-medium ${
                        item.checked
                          ? 'text-[#8C9BAD] dark:text-[#4E6080] line-through'
                          : 'text-[#1B2B3E] dark:text-[#D8E4F5]'
                      }`}>
                        {item.name}
                      </span>
                      {item.note && (
                        <p className="text-sm text-[#52657A] dark:text-[#7B8FAD] mt-0.5">{item.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {hasAny && (
          <button
            onClick={handleDelete}
            className="w-full rounded-xl p-4 border border-red-200 dark:border-red-900
              bg-white dark:bg-[#1E2840] text-red-600 dark:text-red-400 font-semibold text-base"
          >
            Delete this day's log
          </button>
        )}
      </div>
    </div>
  );
}

export default function HistoryScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loggedDates = useMemo(() => new Set(getLoggedDates()), [refreshKey]);

  // Compute calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Shift so Mon=0 ... Sun=6
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {selectedDate && (
        <DayDetail
          dateStr={selectedDate}
          onClose={() => setSelectedDate(null)}
          onDeleted={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* Header */}
      <div className="bg-[#3D5068] dark:bg-[#141D2E] px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-5 flex-shrink-0">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Exercise Log</p>
        <h1 className="text-4xl font-bold text-white">History</h1>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#EDF0F5] dark:bg-[#161D2C] p-3.5">
        <div className="bg-white dark:bg-[#1E2840] rounded-2xl border border-[#DDE3EC] dark:border-[#2A3547] overflow-hidden">

          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEF0F5] dark:border-[#2A3547]">
            <button onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#52657A] dark:text-[#7B8FAD]
                hover:bg-[#EDF0F5] dark:hover:bg-[#242F42] transition-colors text-lg font-bold">
              ‹
            </button>
            <span className="text-base font-semibold text-[#1B2B3E] dark:text-[#D8E4F5]">{monthLabel}</span>
            <button onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#52657A] dark:text-[#7B8FAD]
                hover:bg-[#EDF0F5] dark:hover:bg-[#242F42] transition-colors text-lg font-bold">
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-[#EEF0F5] dark:border-[#2A3547]">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="py-2 text-center text-xs font-semibold text-[#8C9BAD] dark:text-[#4E6080]">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const dateStr = toDateStr(year, month, day);
              const isToday = dateStr === todayStr;
              const hasLog = loggedDates.has(dateStr);
              const dots = hasLog ? getCategoryDots(getLogsForDate(dateStr)) : [];

              return (
                <button key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center py-2 gap-1 min-h-[52px]
                    border-b border-r border-[#EEF0F5] dark:border-[#2A3547]
                    transition-colors hover:bg-[#EDF0F5] dark:hover:bg-[#242F42]
                    ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <span className={`text-sm font-medium leading-none ${
                    isToday
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-[#1B2B3E] dark:text-[#D8E4F5]'
                  }`}>
                    {day}
                  </span>
                  {dots.length > 0 && (
                    <div className="flex gap-0.5">
                      {dots.map((color, di) => (
                        <div key={di} className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 bg-white dark:bg-[#1E2840] rounded-2xl border border-[#DDE3EC] dark:border-[#2A3547] p-4">
          <p className="text-xs font-bold text-[#52657A] dark:text-[#7B8FAD] uppercase tracking-widest mb-3">Legend</p>
          <div className="grid grid-cols-2 gap-2">
            {CAT_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORIES[key].color }} />
                <span className="text-sm text-[#1B2B3E] dark:text-[#D8E4F5]">{CATEGORIES[key].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
