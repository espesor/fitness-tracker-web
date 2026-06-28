import { useState, useCallback } from 'react';
import TodayScreen from './components/TodayScreen';
import LogScreen from './components/LogScreen';
import PlanScreen from './components/PlanScreen';
import { useTheme } from './ThemeContext';
import { exportAllData, importAllData, clearAllData } from './storage';

const TABS = [
  { key: 'today', label: 'Today', icon: '🏠' },
  { key: 'plan',  label: 'Plan',  icon: '📅' },
];

// ─── Color tokens (light / dark) ────────────────────────────────────
// Used as Tailwind classes: must match tailwind.config content scan
// bg-[#3D5068] dark:bg-[#141D2E]  etc.

export default function App() {
  const { dark, toggleDark } = useTheme();
  const [tab, setTab]             = useState('today');
  const [logState, setLogState]   = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  function openLog(category = 'cardio', exercise = null) {
    setLogState({ category, exercise });
  }
  function closeLog() { setLogState(null); refresh(); }

  function handleExport() {
    const blob = new Blob([JSON.stringify(exportAllData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { importAllData(JSON.parse(ev.target.result)); refresh(); alert('Imported.'); }
        catch { alert('Invalid file.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleClear() {
    if (confirm('Delete all data? This cannot be undone.')) { clearAllData(); refresh(); }
  }

  const overlay = (children) => (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#EDF0F5] dark:bg-[#161D2C]">
      {children}
    </div>
  );

  const SettingRow = ({ label, desc, onClick, danger }) => (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-[#1E2840] border rounded-xl p-4
        ${danger ? 'border-red-200 dark:border-red-900' : 'border-[#DDE3EC] dark:border-[#2A3547]'}`}
    >
      <div className={`font-semibold text-base ${danger ? 'text-red-600 dark:text-red-400' : 'text-[#1B2B3E] dark:text-[#D8E4F5]'}`}>{label}</div>
      <div className="text-sm text-[#52657A] dark:text-[#7B8FAD] mt-0.5">{desc}</div>
    </button>
  );

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto bg-[#EDF0F5] dark:bg-[#161D2C] relative overflow-hidden">

      {/* Log modal */}
      {logState && overlay(
        <LogScreen
          initialCategory={logState.category}
          editExercise={logState.exercise}
          onClose={closeLog}
        />
      )}

      {/* Settings panel */}
      {showSettings && overlay(<>
        <div className="bg-[#3D5068] dark:bg-[#141D2E] px-5 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white text-xl font-semibold">Settings</h2>
          <button onClick={() => setShowSettings(false)} className="text-gray-300 text-3xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
          {/* Dark mode toggle */}
          <div className="bg-white dark:bg-[#1E2840] border border-[#DDE3EC] dark:border-[#2A3547] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-base text-[#1B2B3E] dark:text-[#D8E4F5]">Dark mode</div>
              <div className="text-sm text-[#52657A] dark:text-[#7B8FAD] mt-0.5">Switch appearance</div>
            </div>
            <button
              onClick={toggleDark}
              className={`w-14 h-8 rounded-full flex items-center px-1 transition-colors ${dark ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <SettingRow label="Export data" desc="Download all logs and plans as JSON" onClick={handleExport} />
          <SettingRow label="Import data" desc="Restore from a JSON export file" onClick={handleImport} />
          <SettingRow label="Clear all data" desc="Permanently delete all logs and plans" onClick={handleClear} danger />
        </div>
      </>)}

      {/* Main screens */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'today' && (
          <TodayScreen
            key={refreshKey}
            onAddExercise={openLog}
            onEditExercise={(ex) => openLog(ex.category, ex)}
            onOpenSettings={() => setShowSettings(true)}
            onToggleDark={toggleDark}
            dark={dark}
          />
        )}
        {tab === 'plan' && <PlanScreen key={refreshKey} />}
      </div>

      {/* Bottom nav */}
      <div className="relative flex-shrink-0 bg-white dark:bg-[#1E2840] border-t border-[#DDE3EC] dark:border-[#2A3547]
        flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-col items-center gap-1 px-8 py-1 ${
              tab === t.key
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-[#8C9BAD] dark:text-[#4E6080]'
            }`}
          >
            <span className="text-2xl">{t.icon}</span>
            <span className={`text-xs ${tab === t.key ? 'font-bold' : 'font-medium'}`}>{t.label}</span>
          </button>
        ))}

        {/* FAB */}
        <button
          onClick={() => openLog()}
          className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full
            bg-amber-500 text-white text-3xl shadow-lg shadow-amber-500/30
            flex items-center justify-center active:scale-95 transition-transform"
        >
          +
        </button>
      </div>
    </div>
  );
}
