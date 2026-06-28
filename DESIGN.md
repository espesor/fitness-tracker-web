# Fitness Tracker Web — Design & Architecture Document

**Project**: Personal daily exercise tracker, mobile-first web app  
**Repo**: `https://github.com/espesor/fitness-tracker-web`  
**Live URL**: `https://espesor.github.io/fitness-tracker-web/`  
**Stack**: React 18, Vite 5, Tailwind CSS 3  
**No backend** — all data in `localStorage`

---

## 1. Product Overview

A personal iPhone-optimised exercise log and weekly planner. The user logs daily workouts across four categories, writes a weekly plan in free text, and reviews plan vs actual at the end of the week.

### Core features

| Feature | Detail |
|---------|--------|
| Four categories | Cardio, Strength, Stretch, Balance |
| Per-category logging | Different input fields per category (see §4) |
| Edit entries | Tap any logged exercise to reopen its form pre-filled |
| Smart autocomplete | User's history appears first; deletable; built-in library below |
| Weekly plan | Free-text per day, no required format |
| Plan vs Actual | Compare view with per-day status badges |
| Dark mode | Toggle in Settings, persisted in localStorage |
| Data portability | Export / import / clear via Settings panel |

---

## 2. File Structure

```
fitness-tracker-web/
├── index.html                    HTML entry point (PWA meta tags, manifest link)
├── public/
│   └── manifest.json             PWA manifest (standalone display, theme #111827)
├── vite.config.js                base: '/fitness-tracker-web/' for GitHub Pages
├── tailwind.config.js            darkMode: 'class', custom font scale
├── postcss.config.js
├── package.json                  React 18, Vite 5, Tailwind 3
└── src/
    ├── main.jsx                  ReactDOM.createRoot, wraps App in ThemeProvider
    ├── index.css                 @tailwind directives, hide-scrollbar, ring-animate
    ├── ThemeContext.jsx           dark/toggleDark context; applies 'dark' class to <html>
    ├── App.jsx                   Shell: tab routing, log modal, settings panel, FAB
    ├── constants.js              CATEGORIES, CAT_KEYS, TARGETS, DAYS, EXERCISE_LIBRARY
    ├── storage.js                localStorage CRUD for logs, plans, hints
    ├── utils.js                  Date math, formatExercise
    └── components/
        ├── ProgressRing.jsx      SVG circular arc, uses currentColor for track
        ├── TodayScreen.jsx       Dark header + rings + category cards
        ├── LogScreen.jsx         Add/edit form, formType-aware, smart hints
        └── PlanScreen.jsx        Edit (textareas) + Compare (dot grid + day cards)
```

---

## 3. Data Model

### Exercise object

```js
{
  id:        string,        // Date.now().toString()
  name:      string,        // e.g. "RDL"
  category:  string,        // 'cardio' | 'strength' | 'stretch' | 'balance'
  note:      string,        // free text, may be ""
  timestamp: number,        // ms epoch, set on creation, preserved on edit

  // cardio / stretch / balance:
  duration:  number,        // minutes (0 if not entered)

  // strength only (spread in on save):
  weight:    number,        // pounds
  sets:      number,
  reps:      number,

  // balance only (spread in on save):
  sets:      number,
  reps:      number,
  // duration also present for balance (optional)
}
```

### WeekPlan object

```js
{
  weekStart: string,        // "YYYY-MM-DD" — always the Monday of that week
  days: {
    Mon: string,            // free-text plan, may be ""
    Tue: string,
    Wed: string,
    Thu: string,
    Fri: string,
    Sat: string,
    Sun: string,
  }
}
```

### localStorage keys

| Key pattern | Type | Notes |
|-------------|------|-------|
| `logs:YYYY-MM-DD` | `Exercise[]` | One entry per calendar date |
| `plan:YYYY-MM-DD` | `WeekPlan` | Date is the Monday of that week |
| `hints:cardio` | `string[]` | Per-category name history, max 30, newest first |
| `hints:strength` | `string[]` | |
| `hints:stretch` | `string[]` | |
| `hints:balance` | `string[]` | |
| `theme` | `'dark' \| 'light'` | Dark mode preference |

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

### `formType` controls LogScreen inputs

| formType | Fields shown |
|----------|-------------|
| `duration` | Duration (large number + "min") |
| `strength` | Weight (lb) · Sets · Reps · Time (optional, smaller) |
| `balance` | Sets · Reps (2-col) · Duration (optional) |

### Progress ring targets (`TARGETS`)

| Category | Kind | Target |
|----------|------|--------|
| Cardio | minutes | 45 |
| Strength | sessions (count) | 3 |
| Stretch | minutes | 20 |
| Balance | sessions (count) | 2 |

Ring fills to 100% when target is reached. `getProgress()` in TodayScreen handles both kinds.

---

## 5. Theme System

### Dark mode mechanism

`ThemeContext.jsx` stores `dark: boolean` in React state, reads initial value from `localStorage.getItem('theme')`, and toggles `document.documentElement.classList` between `dark` / `''`. Tailwind's `darkMode: 'class'` config means all `dark:` variants activate when `<html>` has the `dark` class.

### Color tokens (hardcoded Tailwind arbitrary values)

Because category colors are dynamic (used as inline styles), the theme uses hardcoded hex values as Tailwind arbitrary-value classes (`bg-[#3D5068]`) rather than CSS variables. This ensures JIT inclusion.

| Role | Light | Dark |
|------|-------|------|
| Page background | `#EDF0F5` | `#161D2C` |
| Cards / surface | `#FFFFFF` | `#1E2840` |
| Input background | `#FFFFFF` | `#242F42` |
| Header / nav bar | `#3D5068` | `#141D2E` |
| Text primary | `#1B2B3E` | `#D8E4F5` |
| Text secondary | `#52657A` | `#7B8FAD` |
| Text muted | `#8C9BAD` | `#4E6080` |
| Borders | `#DDE3EC` | `#2A3547` |
| Dividers (inner) | `#EEF0F5` | `#2A3547` |
| Hover bg | `#F6F8FB` | `#232E44` |

Category `bg` values (`#EFF6FF` etc.) are used for icon boxes and pill backgrounds in light mode. These are not adapted for dark mode — they stay as inline styles on top of the dark surface, which provides enough contrast.

### Font scale (`tailwind.config.js`)

The default Tailwind scale is overridden to bump sizes up:

| Class | Size |
|-------|------|
| `text-2xs` | 11px |
| `text-xs` | 13px |
| `text-sm` | 15px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 20px |
| `text-2xl` | 22px |
| `text-3xl` | 28px |
| `text-4xl` | 34px |

---

## 6. Component Details

### `App.jsx`

**State**:
- `tab`: `'today' | 'plan'`
- `logState`: `null | { category, exercise }` — when non-null, renders LogScreen as overlay
- `refreshKey`: integer bumped after log close to re-mount today/plan screens
- `showSettings`: boolean

**Overlay pattern**: Both LogScreen and Settings are `absolute inset-0 z-50` divs layered over the main content. No router or portal needed.

**FAB**: Positioned `absolute -top-7 left-1/2` inside the bottom nav bar, floats above it.

**Bottom nav**: Two tabs (Today, Plan) + center FAB. Active tab uses `text-blue-600 dark:text-blue-400`.

---

### `TodayScreen.jsx`

Props: `onAddExercise(catKey)`, `onEditExercise(exercise)`, `onOpenSettings()`

Reads `getLogsForDate(getTodayString())` on mount. Does not reload on focus (parent re-mounts via `refreshKey` after log closes).

**Progress rings**: SVG via `ProgressRing` component. Progress % label sits as absolute-positioned text centred over the SVG.

**Category sections**: Four cards. Each card has a header row (dot + label + "+ Add" button) and a list of exercise rows. Clicking a row calls `onEditExercise(ex)`. The × button calls `handleRemove(id)` which writes back to localStorage immediately.

---

### `LogScreen.jsx`

Props: `initialCategory`, `editExercise` (null = add mode, object = edit mode), `onClose`

**State**: `category, name, duration, weight, sets, reps, note, showSugg, hints, saved`

**Edit mode**: When `editExercise` is non-null (`isEdit = true`), all fields initialise from the existing exercise, the header says "Edit exercise", and the save button says "Update exercise". On save, the entry is found by `id` in the day's log array and replaced in-place.

**Autocomplete / hints**:
1. On mount and category change: `setHints(getHints(category))`
2. `filtered` array = hints matching input (🕐 icon, deletable) + library names not in hints (🔍 icon)
3. Max 8 suggestions shown
4. Clicking a suggestion sets `name` and hides dropdown
5. Clicking × on a hint calls `deleteHint(category, name)` and filters from local state
6. On save, `addHint(category, name)` is called — prepends to history, deduplicates, caps at 30

**formType switching**: The JSX conditionally renders three form sections based on `cat.formType`. Changing category in add mode clears all numeric fields.

**Save flow**: Validates `name.trim()`, builds `entry` object (spreads strength or balance fields conditionally), writes to localStorage, calls `addHint`, sets `saved = true`, calls `onClose` after 500ms.

---

### `PlanScreen.jsx`

State: `mode ('compare'|'edit')`, `plan`, `weekLogs`, `editDays`

On mount: loads plan from localStorage (or empty template), loads logs for all 7 days of current week.

**Edit mode**: Seven textareas, one per day, bound to `editDays` state. "Done" button calls `saveWeekPlan` and switches to compare.

**Compare mode**:
- "Week at a glance" card: 7 dot boxes, one per day
- 7 day cards: each showing Plan section (grey bg) + Actual section

**Day status logic** (`getDotStatus` / `getCompareStatus`):

| Condition | Status |
|-----------|--------|
| Day === today | `today` / blue |
| Day is in the future | `upcoming` / grey |
| Past, nothing logged | `upcoming` or `missed` |
| Past, ≥2 exercises logged | `done` / green |
| Past, 1 exercise logged | `partial` / amber |
| Past, 0 logged but plan exists | `missed` / red |
| Past, no plan | `rest` / grey |

---

### `ProgressRing.jsx`

Pure SVG. Two `<circle>` elements: track (uses `currentColor` with `text-white/10` for theme adaptation) and arc (uses `stroke={color}` prop). Arc uses `strokeDasharray` / `strokeDashoffset` to fill proportionally. CSS class `ring-animate` applies a 0.65s cubic-bezier transition to `stroke-dashoffset`.

---

## 7. Storage Layer (`storage.js`)

All functions are synchronous (localStorage is sync). No error bubbles up — all reads are wrapped in try/catch returning empty arrays or null.

```
getLogsForDate(dateStr)       → Exercise[]
saveLogsForDate(dateStr, [])  → void
getWeekPlan(weekStart)        → WeekPlan | null
saveWeekPlan(plan)            → void
getHints(category)            → string[]
addHint(category, name)       → void  (prepends, dedupes, caps at 30)
deleteHint(category, name)    → void
exportAllData()               → object  (all logs:, plan:, hints: keys)
importAllData(data)           → void
clearAllData()                → void   (removes all logs:, plan:, hints: keys)
```

---

## 8. Date Utilities (`utils.js`)

All date math uses local time (not UTC) to avoid midnight-offset bugs. `parseLocalDate(s)` parses `"YYYY-MM-DD"` as `new Date(y, m-1, d)`.

```
getTodayString()         → "YYYY-MM-DD"
getTodayDayOfWeek()      → "Mon" | "Tue" | ... | "Sun"
getWeekStart(date?)      → "YYYY-MM-DD"  (Monday of that week)
getWeekDates(weekStart)  → [{ day, date }, ...]  (7 entries)
getWeekLabel(weekStart)  → "Jun 23 – Jun 29, 2025"
formatTodayFull()        → "Monday, June 27, 2025"
formatExercise(ex)       → formatted string per category:
                           strength: "4×8  @ 185 lb  30 min"
                           balance:  "3×10  5 min"
                           other:    "35 min"
```

---

## 9. Deployment

### Dev

```bash
npm install
npm run dev        # http://localhost:5173
```

On iPhone (same network): use the Network URL printed in the terminal.

### Deploy to GitHub Pages

```bash
npm run deploy     # runs: vite build && gh-pages -d dist
```

This builds to `dist/`, then force-pushes `dist/` to the `gh-pages` branch. The `vite.config.js` sets `base: '/fitness-tracker-web/'` so all asset paths are relative to the subdirectory.

**Branch discipline**: always commit source to `main`; never manually edit `gh-pages`.

### PWA / Add to Home Screen

The `public/manifest.json` sets `display: standalone`. After deploying, open the live URL in Safari on iPhone, tap Share → "Add to Home Screen". The app runs fullscreen without the browser chrome.

---

## 10. Known Design Decisions & Trade-offs

**No router**: Three "screens" (Today, Log, Settings) use conditional rendering + absolute overlay positioning. Simple, no URL changes needed for a personal single-user app.

**No state management library**: React useState is sufficient. Data flows down via props. The `refreshKey` trick on the parent forces child re-mounts after mutations — cleaner than trying to sync sibling state.

**formType on category**: Rather than checking `category === 'strength'` everywhere, the `formType` field on each category config drives form rendering. Makes adding a new form variant (e.g. a "reps-only" type) a one-line config change.

**Smart hints deduplication**: Hints are case-insensitively deduped on write (`addHint`). The display filter excludes library names whose lowercase form appears in the hint set, so the same name never appears twice in the dropdown.

**Balance formType**: Balance uses a dedicated `'balance'` formType (sets + reps + optional duration). This is distinct from `'strength'` (weight + sets + reps + optional time) — balance exercises don't track load.

**Day status simplification**: "Done" vs "Partial" is based on exercise count (≥2 = done, 1 = partial). This is a heuristic, not a semantic match against the written plan, which would require parsing free text. Good enough for a personal app.

**Dark mode via class**: Tailwind's `darkMode: 'class'` toggled on `<html>` is the simplest approach. No CSS variables needed — all dark values are written as `dark:bg-[#...]` utility classes inline.

---

## 11. Suggested Future Improvements

- **Weekly history**: navigate to previous weeks' compare views
- **Edit plan for past weeks**: currently plan is always the current week
- **Multiple sets logging**: log each set individually rather than as a summary
- **Charts**: week-over-week progress per category using a simple SVG bar chart
- **Notifications**: browser push notification to remind logging
- **Cloud sync**: replace localStorage with a simple JSON bin or Supabase for multi-device access
