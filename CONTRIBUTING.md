# Contributing to Terra Watch

Thanks for helping build Terra Watch. The project is intentionally structured so new data layers and visual improvements can be added without touching every part of the app.

## Local Development

```bash
npm install
npm run dev
```

The web app runs on `http://localhost:5173`; the API runs on `http://localhost:8787`.

## Phase 1 Scope

Phase 1 is limited to NASA EONET events, Cesium globe rendering, pulsing markers, and the basic event detail panel. Please keep pull requests focused on this MVP unless a later phase has started.

## Before Opening a PR

```bash
npm run lint
npm run typecheck
npm run build
```

## Data Source Credits

Always credit external data providers in the README and link event-level source URLs when they are available.
