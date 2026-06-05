<p align="center">
  <img src="./docs/demo.gif" alt="Terra Watch — Live Earth Disaster Globe" width="100%" />
</p>

<h1 align="center">🌍 Terra Watch</h1>

<p align="center">
  <strong>Real-time 3D globe showing every active natural disaster on Earth — powered by NASA</strong>
</p>

<p align="center">
  <a href="https://cifertech.github.io/Terra-Watch/"><img src="https://img.shields.io/badge/🌐_Live_Demo-Terra_Watch-1A56DB?style=for-the-badge" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/License-MIT-00BFFF?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/Data-NASA_·_NOAA_·_USGS-FF4500?style=for-the-badge" alt="Data Sources" />
  <img src="https://img.shields.io/badge/Built_with-CesiumJS-2979FF?style=for-the-badge" alt="CesiumJS" />
  <img src="https://img.shields.io/github/stars/cifertech/Terra-Watch?style=for-the-badge&color=FFC107" alt="GitHub Stars" />
</p>

<p align="center">
  <a href="https://cifertech.github.io/Terra-Watch/">🚀 Try it live — no install, no login, works in your browser</a>
</p>

---

## What is Terra Watch?

Terra Watch is an open-source, browser-based mission control for planet Earth. It pulls live data from NASA, USGS, and NOAA to show every active wildfire, earthquake, volcano, flood, and storm on a photorealistic 3D globe — in real time.

Open it and within seconds you'll see 500+ active events pulsing across the Earth. Click any event to see satellite imagery, magnitude history, affected population estimates, and live news headlines. Rewind the globe back to the year 2000 and watch two decades of disasters unfold.

**No backend required. No API keys. Runs entirely in your browser.**

---

## ✨ Features

### 🔴 Live Disaster Globe
A dark, atmospheric CesiumJS globe with real satellite imagery. Every event type has its own animated marker style — wildfires flicker, earthquakes ripple, hurricanes spin, volcanoes glow. Events pulse with intensity scaled to their magnitude.

### 📡 Multi-Source Live Feed
Data from four independent NASA and government sources, unified into a single event stream:
- **NASA EONET v3** — wildfires, volcanoes, floods, droughts, sea ice
- **USGS Earthquake Hazards** — real-time global earthquakes updated every 60 seconds
- **NOAA National Hurricane Center** — Atlantic and Pacific tropical storm tracks
- **NASA GIBS** — daily satellite imagery tiles draped on the globe

### ⏱️ Time Machine
A scrubber at the bottom lets you replay history from 2000 to today. Watch a hurricane form and spiral across the Atlantic. Watch wildfire seasons spread across California year after year. Play forward at 1 day per second.

### 🛰️ Satellite Imagery Overlay
Toggle real NASA satellite tiles on the globe — true color, thermal anomalies, and aerosol/smoke layers. See the actual smoke plume from an active wildfire draped on the Earth.

### 👥 Population Impact
When you click an event, Terra Watch estimates how many people live within 50, 100, and 250 km of the disaster. *"This wildfire is within 80 km of 2.3 million people."*

### 🤖 Ask the Globe
An AI-powered chat panel lets you ask questions about what's happening on Earth right now. *"Which event is most severe?" "What's happening near Indonesia?"*

### 🔗 Shareable Views
Every globe state — camera position, active layers, selected event, and scrubber date — is encoded in the URL. Share exactly what you're seeing with one click.

### 📊 Live Stats Dashboard
A collapsible sidebar shows global summary stats: total active events by category, most severe event right now, events this week vs last year, and data source health.

---

## 📸 Screenshots

| Globe View | Event Detail | Time Machine |
|---|---|---|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

---

## 🚀 Quick Start

**Just want to use it?** → [Open the live demo](https://cifertech.github.io/Terra-Watch/) — nothing to install.

**Want to run it locally:**

```bash
git clone https://github.com/cifertech/Terra-Watch.git
cd Terra-Watch
npm install
npm run dev
```

Open `http://localhost:5173` — the globe loads instantly with live NASA data.

---

## 🗄️ Data Sources

All data is free and open. No API keys required for the core experience.

| Source | Data | Update Frequency |
|--------|------|-----------------|
| [NASA EONET v3](https://eonet.gsfc.nasa.gov/docs/v3) | Wildfires, volcanoes, floods, storms, sea ice | Every 5 min |
| [USGS Earthquake Hazards](https://earthquake.usgs.gov/) | Global earthquakes M0+ | Every 60 sec |
| [NOAA NHC](https://www.nhc.noaa.gov/) | Atlantic & Pacific tropical storms | Every 10 min |
| [NASA GIBS](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs) | Satellite imagery tiles | Daily |
| [GDELT](https://www.gdeltproject.org/) | News headlines tagged by location | Continuous |
| [Wikipedia API](https://www.mediawiki.org/wiki/API:REST_API) | Region and event summaries | On demand |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| 3D Globe | CesiumJS |
| Data overlays | D3.js |
| Heatmap layers | Deck.gl |
| State management | Zustand |
| Styling | Tailwind CSS |
| Build tool | Vite |
| Hosting | GitHub Pages |
| Optional proxy | Node.js + Express |

---

## 📁 Repository Structure

```
terra-watch/
  ├── apps/
  │   ├── web/          # React frontend (Vite + CesiumJS)
  │   └── api/          # Optional Node.js cache/proxy server
  ├── packages/
  │   ├── types/        # Shared TypeScript event model
  │   └── utils/        # Shared geo/date utilities
  ├── docs/
  │   └── demo.gif      # README demo GIF
  ├── LAYERS.md         # How to add a new data layer
  ├── CONTRIBUTING.md   # Contribution guide
  └── README.md
```

---

## 🚢 Deployment

Terra Watch deploys automatically to GitHub Pages on every push to `main`.

**To deploy your own fork:**
1. Fork this repo
2. Go to Settings → Pages → Source → GitHub Actions
3. Push to `main` — it deploys automatically

**Manual build:**
```bash
npm run build:pages
```

---

## 🤝 Contributing

Contributions are very welcome! The project is structured so new data layers and visual improvements can be added without touching the core globe code.

**Good first contributions:**
- 🗺️ Add a new data layer (see [LAYERS.md](./LAYERS.md))
- 🎨 Improve marker animations
- 📱 Mobile UI improvements
- 🌍 Add more event categories

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full details.

---

## 📄 License

MIT — free to use, fork, and build on. If you build something with Terra Watch, we'd love to know about it.

---

<p align="center">
  Built with 🌍 by <a href="https://github.com/cifertech">cifertech</a> · Powered by NASA open data
</p>

<p align="center">
  <a href="https://cifertech.github.io/Terra-Watch/">Live Demo</a> ·
  <a href="https://github.com/cifertech/Terra-Watch/issues">Report Bug</a> ·
  <a href="https://github.com/cifertech/Terra-Watch/issues">Request Feature</a>
</p>
