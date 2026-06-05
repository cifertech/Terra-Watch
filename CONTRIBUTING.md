# Contributing to Terra Watch

First off — thank you. Terra Watch is better because of contributors like you.

This guide covers everything you need to go from idea to merged pull request. The project is structured so new data layers and visual improvements can be added in isolation without touching the core globe engine.

---

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Local Development](#local-development)
- [Adding a New Data Layer](#adding-a-new-data-layer)
- [Code Style](#code-style)
- [Before Opening a PR](#before-opening-a-pr)
- [Commit Messages](#commit-messages)
- [Good First Issues](#good-first-issues)
- [Data Source Credits](#data-source-credits)

---

## Ways to Contribute

You don't have to write code to contribute. Here's everything that helps:

| Type | Examples |
|------|---------|
| 🗺️ **New data layer** | Add ocean currents, volcanic SO2 clouds, nuclear facilities |
| 🎨 **Visual improvements** | Better marker animations, cluster redesign, mobile polish |
| 🐛 **Bug fixes** | API fallback issues, rendering glitches, mobile layout breaks |
| 📖 **Documentation** | Improve LAYERS.md, add code comments, fix typos |
| 🌍 **New event categories** | Tsunami warnings, dust storms, space weather |
| ⭐ **Just starring the repo** | Seriously, it helps more than you think |

---

## Local Development

**Requirements:** Node.js 20+, npm 9+

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/Terra-Watch.git
cd Terra-Watch

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The globe loads at `http://localhost:5173` with live NASA data — no API keys required.

**Optional proxy mode** (for rate-limit-sensitive APIs):
```bash
# Terminal 1 — API proxy
cd apps/api && npm run dev

# Terminal 2 — Frontend
cd apps/web && npm run dev

# Set in apps/web/.env:
VITE_API_BASE_URL=http://localhost:8787
```

---

## Adding a New Data Layer

This is the most impactful contribution. New layers can be added in about 50 lines of code. See [LAYERS.md](./LAYERS.md) for the full guide.

The short version:

```
1. Add a fetcher in  apps/web/src/data/sources/your-layer.ts
2. Add TypeScript types in  packages/types/src/events.ts
3. Register the layer in  apps/web/src/data/registry.ts
4. Add a CesiumJS marker style in  apps/web/src/globe/markers/your-layer.ts
5. Add a toggle in the layer panel  apps/web/src/components/LayerPanel.tsx
```

**Ideal candidates for new layers:**
- 🌊 Ocean currents (Copernicus OSCAR — free, no key)
- ☢️ Nuclear facilities (GeoNuclearData — free static GeoJSON)
- 🌡️ Climate anomalies (NASA GISS — free)
- 🌋 Volcanic SO2 clouds (NASA GIBS OMPS layer — free)

---

## Code Style

- **TypeScript everywhere** — no `any` types, no implicit returns
- **Component files** stay under 200 lines — split if larger
- **No inline styles** — use Tailwind classes or CSS variables
- **Fetchers are pure functions** — no side effects, return normalized event objects
- **All external data** must be typed and validated before reaching the globe renderer

Run the linter before committing:
```bash
npm run lint
npm run typecheck
```

---

## Before Opening a PR

```bash
npm run lint        # ESLint — must pass with zero errors
npm run typecheck   # TypeScript — must pass with zero errors
npm run build       # Production build — must complete without warnings
```

**PR checklist:**
- [ ] Lint and typecheck pass
- [ ] New data sources are credited in the README Data Sources table
- [ ] New layers have a toggle in the layer panel and are OFF by default
- [ ] No API keys or secrets are hardcoded anywhere
- [ ] The globe still loads and renders with your changes applied

---

## Commit Messages

Use the conventional commits format:

```
feat: add ocean currents layer from Copernicus OSCAR
fix: correct NOAA NHC endpoint fallback URL
docs: add nuclear facilities to LAYERS.md examples
style: reduce cluster marker size on mobile
perf: batch EONET requests to reduce initial load time
```

---

## Good First Issues

Look for issues tagged [`good first issue`](https://github.com/cifertech/Terra-Watch/issues?q=is%3Aissue+label%3A%22good+first+issue%22) on GitHub. These are scoped, well-defined tasks that don't require deep knowledge of the codebase.

Current good first areas:
- Improve mobile responsive layout for the event detail panel
- Add loading skeleton for the stats dashboard
- Fix cluster marker appearance on high-DPI screens
- Add keyboard navigation for layer toggles

---

## Data Source Credits

Terra Watch is built entirely on open, free data from NASA, NOAA, USGS, and other public sources. Every contribution that adds a new data source must:

1. Confirm the source is free and openly licensed for this use
2. Add the source to the Data Sources table in README.md
3. Link to the source's terms of use in the fetcher file header
4. Include the source URL in event-level data so users can click through to the original

---

## Questions?

Open a [GitHub Discussion](https://github.com/cifertech/Terra-Watch/discussions) — we're happy to help you get started.

---

<p align="center">
  Terra Watch is MIT licensed and built on NASA open data.<br/>
  Every contribution, big or small, makes the globe better. 🌍
</p>
