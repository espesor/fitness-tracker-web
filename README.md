# Fitness Tracker

A personal daily exercise tracker — mobile-first web app, installable on iPhone.

**Live**: https://espesor.github.io/fitness-tracker-web/  
**Stack**: React 18 · Vite 5 · Tailwind CSS 3 · localStorage

---

## How it works

**Plan tab** — build your regular exercise list, organised by category (Cardio, Strength, Stretch, Balance). Add, edit, or remove exercises any time. This is your persistent template.

**Today tab** — every day, your plan appears as a checklist. Check off exercises as you do them; add an optional note to each (e.g. "185 lb", "felt good"). Progress rings in the header fill as you check things off.

All data is saved automatically — no Save button needed. Check a few exercises in the morning, come back later to check more.

---

## Progress ring targets

| Category | Checks needed for 100% |
|----------|------------------------|
| Cardio | 1 |
| Strength | 4 |
| Stretch | 3 |
| Balance | 2 |

---

## Quick start

```bash
cd fitness-tracker-web
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. On iPhone (same Wi-Fi): use the Network URL shown in the terminal.

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

Builds the app and pushes to the `gh-pages` branch. Site is live at `https://espesor.github.io/fitness-tracker-web/` within ~60 seconds.

**Standard workflow after any change:**

```bash
npm install                   # only if new packages were added
npm run dev                   # test locally
git add .
git commit -m "your message"
git push origin main
npm run deploy
```

---

## Install on iPhone

1. Open the live URL in **Safari**
2. Tap **Share** → **Add to Home Screen**
3. The app runs fullscreen, no browser chrome

---

## Data & privacy

All data lives in your browser's `localStorage` — nothing is sent anywhere.

Use **Settings** (⚙️ on Today screen) to:
- Export all data as a JSON file (backup)
- Import from a previous export
- Clear all data

---

## Project structure

```
src/
├── App.jsx               Shell: tabs, settings overlay
├── ThemeContext.jsx       Dark/light mode provider
├── constants.js          Categories, targets, exercise library
├── storage.js            localStorage helpers
├── utils.js              Date utilities
└── components/
    ├── ProgressRing.jsx  SVG arc ring
    ├── TodayScreen.jsx   Checklist + progress rings
    └── PlanScreen.jsx    Exercise list manager
```

See `DESIGN.md` for full architecture documentation.
