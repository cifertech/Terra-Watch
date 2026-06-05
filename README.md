<p align="center">
  <img src="./docs/demo.gif" alt="Terra Watch — Live Earth Disaster Globe" width="100%" />
</p>

<h1 align="center">🌍 Terra Watch</h1>

<p align="center">
  <strong>Real-time 3D globe showing every active natural disaster on Earth — powered by NASA</strong>
</p>

<p align="center">
  <a href="https://cifertech.github.io/Terra-Watch/">
    <img src="https://img.shields.io/badge/🌐 Live Demo-Terra Watch-1A56DB?style=for-the-badge" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Data-NASA · NOAA · USGS-FF4500?style=for-the-badge" alt="Data Sources" />
  <img src="https://img.shields.io/badge/Built with-CesiumJS-2979FF?style=for-the-badge" alt="CesiumJS" />
  <img src="https://img.shields.io/github/stars/cifertech/Terra-Watch?style=for-the-badge&color=FFC107" alt="GitHub Stars" />
</p>

<p align="center">
  <a href="https://cifertech.github.io/Terra-Watch/"><strong>🚀 Try it live — no install, no login, open in your browser</strong></a>
</p>

---

## What is Terra Watch?

Terra Watch is an open-source, browser-based mission control for planet Earth. It pulls live data from NASA EONET, USGS, and NOAA to show every active wildfire, earthquake, volcano, flood, and storm on a photorealistic 3D globe — right now.

Open it and within seconds you'll see 500+ active events pulsing across the Earth. Click any event to see satellite imagery, magnitude history, population impact, and live news. Rewind history back to the year 2000 and watch two decades of disasters play out.

**No install. No API keys. No backend. Runs entirely in your browser.**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌍 **3D Satellite Globe** | Photorealistic Earth using CesiumJS with Esri World Imagery — looks like Google Earth |
| 🔴 **Live Event Markers** | Pulsing, animated markers for wildfires, earthquakes, volcanoes, floods, storms, drought, and sea ice |
| 📊 **Live Dashboard** | Real-time count of active events by category, most severe event, affected countries |
| 🔍 **Event Detail Panel** | Click any event for magnitude history, source link, population impact estimate, and news headlines |
| ⏱️ **Time Machine** | Scrubber from 2000 to today — replay any historical disaster period |
| 🛰️ **NASA GIBS Layers** | Toggle real NASA satellite imagery: true colour, thermal anomalies, aerosol/smoke |
| 👥 **Population Overlay** | Heatmap showing population density — see how many people are near each disaster |
| 🤖 **Ask the Globe** | AI-powered chat: ask questions about what's happening on Earth right now |
| 🔗 **Shareable URLs** | Every view is encoded in the URL — share exactly what you're seeing |
| 📱 **Mobile Friendly** | Works on phone and tablet — touch to rotate, pinch to zoom |

---

## 📸 Screenshots

> Add screenshots here after recording — a GIF at the top is the single most important thing for GitHub stars.

---

## 🗺️ How It Works

Terra Watch runs entirely as a static site deployed on GitHub Pages. It calls NASA, USGS, and NOAA APIs directly from your browser — no backend server required.

```
Your browser
  ├── NASA EONET v3        → wildfires, volcanoes, floods, storms, sea ice
  ├── USGS Earthquake Feed → real-time global earthquakes (updated every 60s)
  ├── NOAA NHC             → Atlantic & Pacific tropical storms
  ├── NASA GIBS WMTS       → daily satellite imagery tiles
  ├── GDELT                → geo-tagged news headlines
  └── Wikipedia API        → region and event summaries
```

All rendered on a CesiumJS 3D globe with Esri World Imagery as the basemap.

---

## 🚀 Quick Start

**Just want to use it?**
→ [Open the live demo](https://cifertech.github.io/Terra-Watch/) — nothing to install.

**Want to run it locally?**

Since Terra Watch is a pre-built static site, just clone the repo and serve it with any static file server:

```bash
# Clone the repo
git clone https://github.com/cifertech/Terra-Watch.git
cd Terra-Watch

# Serve locally (any of these work)
npx serve .
python3 -m http.server 8080
# Then open http://localhost:8080
```

> ⚠️ Opening `index.html` directly as a `file://` URL won't work due to browser security restrictions on local files. Use a local server as shown above.

---

## 🗄️ Data Sources

All data is free and open. No API keys required.

| Source | Data | Update Frequency |
|--------|------|-----------------|
| [NASA EONET v3](https://eonet.gsfc.nasa.gov/docs/v3) | Wildfires, volcanoes, floods, storms, drought, sea ice | Every 5 min |
| [USGS Earthquake Hazards](https://earthquake.usgs.gov/) | Global earthquakes M0+ | Every 60 sec |
| [NOAA National Hurricane Center](https://www.nhc.noaa.gov/) | Atlantic & Pacific tropical storms | Every 10 min |
| [NASA GIBS WMTS](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs) | Satellite imagery tiles | Daily |
| [GDELT](https://www.gdeltproject.org/) | News headlines tagged by location | Continuous |
| [Wikipedia API](https://www.mediawiki.org/wiki/API:REST_API) | Region and event summaries | On demand |

---

## 🗂️ Repository Structure

```
Terra-Watch/
  ├── index.html          # App entry point
  ├── assets/
  │   ├── index-*.js      # Bundled application (React + all logic)
  │   └── index-*.css     # Bundled styles
  ├── cesium/             # CesiumJS library (self-hosted for GitHub Pages)
  │   ├── Cesium.js
  │   ├── Workers/
  │   ├── Assets/
  │   └── Widgets/
  ├── 404.html            # GitHub Pages SPA fallback
  ├── .nojekyll           # Disables Jekyll processing on GitHub Pages
  └── docs/
      └── demo.gif        # README demo capture
```

---

## 🚢 Deployment

Terra Watch is deployed as a static site on GitHub Pages — no build step needed to deploy since the assets are pre-built and committed.

**To deploy your own fork:**
1. Fork this repo on GitHub
2. Go to **Settings → Pages → Source → Deploy from branch**
3. Select `main` branch, `/ (root)` folder
4. Click Save — your globe will be live at `https://yourusername.github.io/Terra-Watch/`

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get started.

Ideas for contributions:
- 🎨 Visual improvements to event markers or the UI
- 📱 Mobile layout improvements
- 🌍 New event category support
- 🐛 Bug fixes and API fallback improvements

---

## 📄 License

MIT — free to use, fork, and build on.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/cifertech">cifertech</a> · Powered by NASA open data
</p>

<p align="center">
  <a href="https://cifertech.github.io/Terra-Watch/">Live Demo</a> ·
  <a href="https://github.com/cifertech/Terra-Watch/issues">Report Bug</a> ·
  <a href="https://github.com/cifertech/Terra-Watch/issues">Request Feature</a>
</p>
