# Fitness Tracker

A personal daily exercise tracker built with React Native and Expo (SDK 54). Designed for iPhone, runs via Expo Go during development, and can be deployed as a standalone app or a progressive web app.

## Features

**Four exercise categories** — cardio, strength, stretch, and balance — each with appropriate input fields:

- Cardio, stretch, and balance log exercise name and duration in minutes
- Strength logs exercise name, weight (lb), sets, and reps
- Every entry supports an optional free-text note

**Today screen** — four progress rings in the header show daily completion at a glance. Below, each category lists logged exercises with metrics. Tap "+ Add" on any category or the floating action button to open the log form.

**Log exercise** — modal form with a 2×2 category selector, autocomplete exercise name search (pre-populated library of common exercises per category), dynamic input fields that switch between duration and weight/sets/reps based on category, and a note field.

**Weekly plan** — two modes toggled at the top:

- *Edit plan* — a free-text textarea per day of the week. Write whatever format makes sense: `Bike 30 min, RDL 30 lb 3×7`.
- *Compare* — a "week at a glance" dot summary (done / partial / today / upcoming) followed by per-day cards showing your written plan alongside what you actually logged. Designed for weekend review of plan adherence.

**Local storage** — all data persisted on-device via AsyncStorage. Nothing leaves the phone.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) installed on your iPhone (for development)

## Getting Started

```bash
cd fitness-tracker
npm install --legacy-peer-deps
npx expo install --fix
npx expo start --clear
```

Scan the QR code with the iPhone Camera app. If the QR doesn't scan, press `t` in the terminal to switch to tunnel mode, then scan the new QR.

> Phone and computer must be on the same Wi-Fi network (unless using tunnel mode).

## Project Structure

```
fitness-tracker/
├── app/
│   ├── _layout.tsx                 Root stack navigator (modal support)
│   ├── log.tsx                     Log exercise modal
│   └── (tabs)/
│       ├── _layout.tsx             Bottom tab bar (Today + Plan)
│       ├── index.tsx               Today screen (rings + category cards)
│       └── plan.tsx                Weekly plan (edit + compare modes)
│
├── components/
│   ├── ProgressRing.tsx            SVG circular progress ring
│   ├── CategorySection.tsx         Category card with exercise list
│   ├── ExerciseItem.tsx            Single exercise row (metrics + note + delete)
│   ├── WeekGlance.tsx              Seven-dot week summary bar
│   └── DayCompareCard.tsx          Per-day plan vs. actual comparison card
│
├── constants/
│   ├── Categories.ts               Colors, icons, labels, daily targets
│   └── Exercises.ts                Autocomplete exercise library per category
│
├── hooks/
│   ├── useTodayLogs.ts             Load/add/remove exercises for today
│   └── useWeekPlan.ts              Load/save weekly plan + fetch week logs
│
├── storage/
│   └── index.ts                    AsyncStorage read/write helpers
│
├── types/
│   └── index.ts                    TypeScript interfaces (Exercise, WeekPlan)
│
├── utils/
│   └── date.ts                     Date math utilities (no external deps)
│
├── app.json                        Expo configuration
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Daily Targets

Progress rings on the Today screen fill based on these default targets:

| Category | Target | Metric |
|----------|--------|--------|
| Cardio | 45 min | Total duration across all cardio exercises |
| Strength | 3 exercises | Number of distinct strength entries logged |
| Stretch | 20 min | Total duration across all stretch exercises |
| Balance | 2 exercises | Number of distinct balance entries logged |

Edit `constants/Categories.ts` → `TARGETS` to adjust.

## Data Model

All data is stored locally in AsyncStorage with the following key scheme:

| Key pattern | Value | Example |
|-------------|-------|---------|
| `logs:YYYY-MM-DD` | `Exercise[]` | `logs:2025-06-27` |
| `plan:YYYY-MM-DD` | `WeekPlan` (keyed to Monday) | `plan:2025-06-23` |

### Exercise interface

```typescript
{
  id: string;
  name: string;
  category: 'cardio' | 'strength' | 'stretch' | 'balance';
  note: string;
  timestamp: number;
  duration?: number;    // minutes (cardio, stretch, balance)
  weight?: number;      // pounds (strength)
  sets?: number;        // strength
  reps?: number;        // strength
}
```

### WeekPlan interface

```typescript
{
  weekStart: string;                // "2025-06-23" (Monday)
  days: Record<string, string>;     // { Mon: "Bike 30 min", Tue: "...", ... }
}
```

## Usage

### Logging exercises

1. Open the **Today** tab
2. Tap **+ Add** on any category card, or the amber **+** button
3. Select a category, type or pick an exercise name
4. Enter duration or weight/sets/reps
5. Optionally add a note (how it felt, deviations from plan)
6. Tap **Save exercise** — redirects to Today with updated rings

### Weekly planning

1. Open the **Plan** tab → tap **Edit plan**
2. Write each day's plan in free text
3. Tap **Done — view comparison**
4. Log exercises throughout the week
5. Review the **Compare** view to check adherence

## Deployment Options

### Web app (free, no PC needed after deploy)

```bash
npx expo export --platform web
```

Host the `dist/` folder on Vercel, Netlify, or GitHub Pages. Open in Safari and tap "Add to Home Screen" for an app-like experience.

### Standalone iOS build (requires Apple Developer account)

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
```

Builds an installable `.ipa` in the cloud. See [EAS Build docs](https://docs.expo.dev/build/introduction/).

### Local iOS build (requires Mac + Xcode)

```bash
npx expo run:ios --device
```

## Tech Stack

- **Framework**: React Native 0.81 + Expo SDK 54
- **Routing**: Expo Router v6 (file-based)
- **Storage**: AsyncStorage (on-device key-value)
- **Charts**: react-native-svg (progress rings)
- **Icons**: @expo/vector-icons (Ionicons)
- **Language**: TypeScript
