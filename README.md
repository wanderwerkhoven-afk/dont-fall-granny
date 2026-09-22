# Don’t Fall Granny

A premium stylized arcade-survival game built around one clear fantasy:

> Stay upright. Survive the chaos. Never underestimate Granny.

## Technology

Primary implementation: **Phaser + TypeScript + Vite**.

The game runs directly in the browser and deploys to GitHub Pages. No Unity installation, Unity account, license secret or WebGL editor build is required.

## Current playable slice

The browser version currently includes:

- Home / Play flow;
- responsive portrait layout;
- stylized procedural Granny;
- automatic running;
- jump controls for mobile and keyboard;
- trip, heavy and moving hazards;
- balance system with Stable / Unstable / Critical / Fallen states;
- recovery window with dedicated action;
- coins and live distance score;
- near-miss feedback;
- fall + 10-second rescue flow;
- Game Over with Replay / Home;
- best-distance persistence in localStorage;
- reduced-motion preference.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## GitHub Pages

The Pages workflow is in:

`.github/workflows/pages.yml`

After it is merged to `main` and GitHub Pages is configured with **Source → GitHub Actions**, the expected URL is:

`https://wanderwerkhoven-afk.github.io/dont-fall-granny/`

## Repository layout

- `src/scenes` – Phaser scenes;
- `src/game` – gameplay systems and shared state;
- `src/styles.css` – browser/mobile shell;
- `docs` – design and production notes;
- legacy Unity folders remain temporarily for reference during the pivot and are no longer the production target.

## Product direction

The next milestone is a polished 15–30 second browser-native vertical slice before adding broader content such as scooter and airplane event modes.
