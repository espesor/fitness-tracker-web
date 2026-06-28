# Fitness Tracker (Web)

A personal daily exercise tracker built with React, Vite, and Tailwind CSS. Runs in any browser, installable as a home-screen app on iPhone via Safari.

## Features

**Four exercise categories** — cardio, strength, stretch, balance.

- Cardio, stretch, balance: log exercise name + duration (min)
- Strength: log exercise name + weight (lb) + sets + reps + time (min)
- Optional free-text note per entry
- All logged exercises are editable — tap any entry to modify it

**Today screen** — four progress rings showing daily completion, category cards with logged exercises, floating + button to log new entries.

**Weekly plan** — write each day's plan as free text, then compare plan vs. actual at the end of the week. Status badges (done / partial / missed / upcoming) per day.

**Data management** — export all data as JSON, import from a previous export, or clear everything. Accessible from the settings gear icon.

## Quick Start

```bash
cd fitness-tracker-web
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Install on iPhone

1. Deploy to any static host (see below)
2. Open the URL in Safari
3. Tap Share → Add to Home Screen
4. The app runs fullscreen without Safari's address bar

## Deploy (free)

Build the static files:

```bash
npm run build
```

This creates a `dist/` folder. Host it on any of these (all free):

- **Vercel**: `npx vercel --prod`
- **Netlify**: drag the `dist/` folder to netlify.com/drop
- **GitHub Pages**: push `dist/` to a `gh-pages` branch

## Data Storage

All data lives in the browser's `localStorage`. Keys:

| Pattern | Content |
|---------|---------|
| `logs:YYYY-MM-DD` | Exercise array for that date |
| `plan:YYYY-MM-DD` | Weekly plan (keyed by Monday) |

Use the export button (⚙️ → Export data) to back up your data as a JSON file. Import restores from that file.

## Project Structure

```
src/
├── main.jsx              Entry point
├── index.css             Tailwind imports
├── App.jsx               Shell: tabs, FAB, settings, log modal
├── constants.js          Categories, exercises, targets, days
├── storage.js            localStorage helpers + export/import
├── utils.js              Date utilities + exercise formatting
└── components/
    ├── ProgressRing.jsx   SVG circular progress ring
    ├── TodayScreen.jsx    Rings header + category exercise cards
    ├── LogScreen.jsx      Add/edit exercise form
    └── PlanScreen.jsx     Weekly plan editor + comparison view
```

## Tech Stack

React 18, Vite 5, Tailwind CSS 3. No backend, no accounts, no tracking.
