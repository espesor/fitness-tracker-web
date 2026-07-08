# Fitness Tracker Web — Design & Architecture Document

**Project**: Personal daily exercise tracker, mobile-first web app  
**Repo**: `https://github.com/espesor/fitness-tracker-web`  
**Live URL**: `https://espesor.github.io/fitness-tracker-web/`  
**Stack**: React 18, Vite 5, Tailwind CSS 3  
**No backend** — all data in `localStorage`

---

## 1. Product Overview

A personal iPhone-optimised exercise tracker. The user maintains a persistent plan of regular exercises per category, checks them off daily with optional notes, and tracks progress via animated rings.

### Core features

| Feature | Detail |
|---------|--------|
| Plan page | Persistent exercise list per category; add, inline-edit, delete |
| Today page | Checklist of today's planned exercises; check off + optional note per item |
| Auto-save | Every checkbox toggle and note edit saves immediately to localStorage |
| Progress rings | Four animated SVG rings in dark header, one per category |
| Dark mode | Toggle in Settings, persisted in localStorage |
| Data portability | Export / import / clear via Settings panel |

---

## 2. File Structure

```
fitness-tracker-web/
├── index.html                    HTML entry, PWA meta tags, manifest link
├── public/manifest.json          PWA manifest (standalone, theme #111827)
├── vite.config.js                base: '/fitness-tracker-web/' for GitHub Pages
├── tailwind.config.js            darkMode:'class', custom font scale
├── postcss.config.js
├── package.json                  React 18, Vite 5, Tailwind 3, gh-pages
└── src/
    ├── main.jsx                  ReactDOM.createRoot, wraps in ThemeProvider
    ├── index.css                 @tailwind, hide-scrollbar, ring-animate
    ├── ThemeContext.jsx           dark/toggleDark context; toggles 'dark' on <html>
    ├── App.jsx                   Shell: tabs, settings overlay, tab-switch refresh
    ├── constants.js              CATEGORIES, CAT_KEYS, TARGETS, EXERCISE_LIBRARY
    ├── storage.js                localStorage CRUD: plan, logs, hints, export/import
    ├── utils.js                  Date helpers, formatExercise (unused in new flow)
    └── components/
        ├── ProgressRing.jsx      SVG circular arc
        ├── TodayScreen.jsx       Dark header + rings + category checklists
        └── PlanScreen.jsx        Category exercise list with add/edit/delete
```

> `LogScreen.jsx` was removed in this redesign. Exercises are managed through the Plan page only.

---

## 3. Data Model

### Plan exercises (persistent)

```js
// localStorage key: 'plan:exercises'
{
  cardio:   string[],   // e.g. ['Running', 'Cycling']
  strength: string[],   // e.g. ['Squat', 'RDL', 'Bench Press', 'OHP']
  stretch:  string[],   // e.g. ['Hip Flexor', 'Hamstring', 'Pigeon Pose']
  balance:  string[],   // e.g. ['Single Leg Stand', 'Tree Pose']
}
```

### Today's log (date-specific)

```js
// localStorage key: 'logs:YYYY-MM-DD'
[
  { name: string, category: string, checked: boolean, note: string },
  ...
]
```

One entry per planned exercise. `checked` is the completion state. `note` is free text (e.g. "185 lb", "felt great").

### Other localStorage keys

| Key | Type | Notes |
|-----|------|-------|
| `plan:exercises` | `PlanExercises` | Persistent exercise list |
| `logs:YYYY-MM-DD` | `LogEntry[]` | Daily checklist state |
| `hints:cardio` etc. | `string[]` | Autocomplete history for Plan add-input |
| `theme` | `'dark'\|'light'` | Dark mode preference |

---

## 4. Category Configuration (`constants.js`)

```js
CATEGORIES = {
  cardio:   { key, label, color: '#2563EB', bg: '#EFF6FF', icon: '❤️',  formType: 'duration'  },
  strength: { key, label, color: '#DC2626', bg: '#FEF2F2', icon: '🏋️', formType: 'strength'  },
  stretch:  { key, label, color: '#059669', bg: '#ECFDF5', icon: '🌿',  formType: 'duration'  },
  balance:  { key, label, color: '#7C3AED', bg: '#F5F3FF', icon: '⚖️',  formType: 'balance'   },
}
```

### Progress ring targets (`TARGETS`)

All are count-based (number of checked exercises needed for 100%).

| Category | Target |
|----------|--------|
| Cardio   | 1      |
| Strength | 4      |
| Stretch  | 3      |
| Balance  | 2      |

---

## 5. Screen Behaviours

### `TodayScreen`

1. **On mount**: reads `plan:exercises` and `logs:YYYY-MM-DD`
2. Builds `items` state: for each plan exercise, find saved state or default to `{checked: false, note: ''}`
3. If plan is empty → shows "No exercises planned yet" message with hint to use Plan tab
4. **Checkbox toggle** → updates `items` state + immediately persists to localStorage
5. **Note input** → appears below checked exercises only; updates on every keystroke + persists
6. Category header shows `checked/target` count; count turns category-coloured when target is met
7. Checked exercises show name with strikethrough in muted colour

**Remount pattern**: `App.jsx` bumps `refreshKey` whenever the user switches back to the Today tab, so TodayScreen always re-reads from storage and reflects plan changes.

### `PlanScreen`

State: `plan`, `editingKey` (`"${cat}:${idx}"` | null), `editValue`, `addingCat` (cat key | null), `newName`, `showSugg`

1. **On mount**: reads `plan:exercises`
2. **Edit**: click ✎ → replaces text with input pre-filled with current name → ✓ to save, ✗ or Escape to cancel; Enter also saves
3. **Delete**: click × → removes item, auto-saves
4. **Add**: click "+ Add exercise" → shows input + suggestion dropdown → "Add" button or Enter to confirm, ✗ or Escape to cancel
5. **Suggestions**: drawn from `EXERCISE_LIBRARY[cat]`, filtered by what's already in the plan and what's been typed
6. Note at the bottom: "Changes here update Today's checklist the next time you open it."

### `App`

- Two tabs: **Today** (🏠) and **Plan** (📋)
- Switching to Today tab bumps `refreshKey` → remounts `TodayScreen`
- Settings overlay: dark mode toggle, export, import, clear
- No FAB; no log modal (removed in this redesign)

---

## 6. Theme System

### Mechanism

`ThemeContext.jsx` stores `dark: boolean`, reads from `localStorage.getItem('theme')` on init, toggles `document.documentElement.classList` (`dark` / `''`). Tailwind `darkMode: 'class'` activates `dark:` variants.

### Color tokens

| Role | Light | Dark |
|------|-------|------|
| Page bg | `#EDF0F5` | `#161D2C` |
| Cards | `#FFFFFF` | `#1E2840` |
| Input bg | `#F6F8FB` | `#242F42` |
| Header | `#3D5068` | `#141D2E` |
| Text primary | `#1B2B3E` | `#D8E4F5` |
| Text secondary | `#52657A` | `#7B8FAD` |
| Text muted | `#8C9BAD` | `#4E6080` |
| Borders | `#DDE3EC` | `#2A3547` |
| Inner dividers | `#EEF0F5` | `#2A3547` |

### Font scale

Tailwind default overridden in `tailwind.config.js` (see file). Base is 16px; exercise names 16px bold; headers 34px.

---

## 7. Storage Layer (`storage.js`)

```
getPlanExercises()          → { cardio, strength, stretch, balance }  (all string[])
savePlanExercises(obj)      → void
getLogsForDate(dateStr)     → LogEntry[]
saveLogsForDate(dateStr, [])→ void
getHints(category)          → string[]
addHint(category, name)     → void  (prepends, dedupes, max 30)
deleteHint(category, name)  → void
exportAllData()             → object (all plan:, logs:, hints:, theme keys)
importAllData(data)         → void
clearAllData()              → void  (removes plan:, logs:, hints: keys)
```

---

## 8. Deployment

### Dev

```bash
npm install
npm run dev      # → http://localhost:5173
```

On iPhone (same Wi-Fi): use the Network URL printed in the terminal.

### Deploy to GitHub Pages

```bash
npm run deploy   # vite build → gh-pages -d dist
```

Pushes the built `dist/` to the `gh-pages` branch. `vite.config.js` sets `base: '/fitness-tracker-web/'`.

**Branch discipline**: commit source to `main` only. Never manually edit `gh-pages`.

### Standard push sequence (every change)

```bash
npm install                        # only if new deps added
npm run dev                        # test locally
git add .
git commit -m "<message>"
git push origin main               # or --force if conflict
npm run deploy                     # build + push to gh-pages
```

---

## 9. Design Decisions

**No router**: conditional rendering + absolute overlays. Simple for a single-user personal app.

**Plan drives Today**: Today's checklist is always derived from the current plan at mount time. If the plan changes, Today reflects it on next focus (due to remount via `refreshKey` bump).

**Auto-save everywhere**: no explicit "Save" button. Every checkbox toggle or note keystroke writes to localStorage immediately. Feels instantaneous; no data loss risk.

**Count-based progress**: rings fill based on number of exercises checked, not duration. Targets: cardio 1, strength 4, stretch 3, balance 2.

**Hints in Plan**: the `addHint` / `getHints` / `deleteHint` system tracks user-typed exercise names in the Plan add-input, shown as autocomplete with 🕐 history items first.

**Inline editing**: plan exercise names are edited in-place (no modal). Keyboard-friendly (Enter = save, Escape = cancel).

---

## 10. Future Improvements

- **Ad-hoc exercises**: add a one-off exercise to Today not in the plan (was removed in this redesign)
- **Weekly history**: view previous days' checklist states
- **Notes on plan items**: attach a default note/instructions to each plan exercise (e.g. "3×8 @ 185 lb")
- **Reorder plan items**: drag-to-reorder within a category
- **Cloud sync**: replace localStorage with Supabase for multi-device access
- **Push notifications**: remind user to log at end of day
