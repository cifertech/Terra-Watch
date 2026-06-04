<p align="center">
  <img src="./docs/demo.gif" alt="Terra Watch rotating globe with live disaster markers" width="100%" />
</p>

# Terra Watch

Real-time 3D globe showing every active natural disaster on Earth, powered by NASA data.

![License: MIT](https://img.shields.io/badge/License-MIT-00BFFF.svg)
![Phase](https://img.shields.io/badge/Phases-1--4-FF4500.svg)
![Data](https://img.shields.io/badge/Data-NASA%20NOAA%20USGS-2979FF.svg)

Terra Watch is a browser-based mission-control view of active natural disasters. It combines a dark atmospheric Cesium globe with live NASA EONET, USGS, NOAA, NASA GIBS, GDELT, Wikipedia, population impact fallbacks, and an optional AI-powered “ask the globe” panel.

## Live Demo

GitHub Pages deployment URL is created automatically by the `Build and Deploy` workflow after pushing to `main`.

## Quick Start

```bash
npm install && npm run dev
```

The web app runs at `http://localhost:5173`. By default it runs in static mode and fetches public NASA, USGS, NOAA, GDELT, Wikipedia, and GIBS data directly from the browser. The Express API remains available as an optional local/proxy mode.

## Features

- 3D Earth rendered with CesiumJS on a dark NASA mission-control theme.
- Unified live feed for NASA EONET hazards, USGS earthquakes, and NOAA tropical storms.
- Pulsing markers, earthquake ripples, storm wind rings, and NASA GIBS satellite overlays.
- Toggleable layers, shareable URL state, and embeddable widget mode with `?embed=1`.
- Time machine scrubber with daily playback and a day/night terminator line.
- Event detail panel with source links, magnitude sparkline, GDELT headlines, Wikipedia summary, and population impact fallback estimates.
- Collapsible stats dashboard with source health, category totals, most severe event, and affected-country estimate.
- Optional API proxy and AI endpoint with deterministic static fallbacks when no backend is configured.

## Tech Stack

- React 18, TypeScript, Vite
- CesiumJS for the 3D globe
- D3.js for live summary aggregation
- Zustand for client state
- Tailwind CSS with custom globe UI variables
- Optional Node.js and Express proxy for deployments that need server-side caching

## Repository Structure

```text
terra-watch/
  apps/
    web/          React frontend (Vite + CesiumJS)
    api/          Optional Node.js cache/proxy server
  packages/
    types/        Shared TypeScript event model
    utils/        Shared geo/date utilities
  docs/
    demo.gif      README demo capture placeholder
  LAYERS.md       How to add data layers
```

## Data Sources

Terra Watch uses [NASA EONET v3](https://eonet.gsfc.nasa.gov/docs/v3), [USGS Earthquake Hazards](https://earthquake.usgs.gov/), [NOAA National Hurricane Center](https://www.nhc.noaa.gov/), [NASA GIBS](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs), [GDELT](https://www.gdeltproject.org/), and [Wikipedia](https://www.mediawiki.org/wiki/API:REST_API). Optional AI and population integrations are configured through environment variables and degrade gracefully when absent.

## Environment

Static GitHub Pages mode does not require environment variables. To use the optional Express proxy locally, set `VITE_API_BASE_URL` in `apps/web/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8787
```

For GitHub Pages, the workflow sets `VITE_BASE_PATH` to `/<repo-name>/` automatically.

## Deployment

GitHub Pages deploys the static web app from `apps/web/dist` through `.github/workflows/ci.yml`.

1. In GitHub, enable Pages with source `GitHub Actions`.
2. Push to `main`.
3. The workflow installs dependencies, typechecks/lints/builds `apps/web`, and deploys the Pages artifact.

Manual static build:

```bash
npm install
npm run build:pages
```

Optional proxy mode is still available with Docker:

```bash
docker compose up --build
```

## Contributing

See `LAYERS.md` for the shortest path to adding a new data source. Good first areas include marker polish, source adapters, mobile UI improvements, and replacing fallback population estimates with a real WorldPop raster pipeline.
