# Terra Watch — GitHub Upload Pack

This folder contains everything you should upload to GitHub.
It excludes `node_modules`, `dist`, `.env` files, and other local-only files.

## What's included

- `apps/web/` — React + Cesium frontend (source only)
- `apps/api/` — Optional Node.js proxy (source only)
- `packages/` — Shared TypeScript types and utilities
- `.github/workflows/` — GitHub Pages deploy workflow
- Root config — `package.json`, `package-lock.json`, `.gitignore`, etc.

## What was excluded (on purpose)

- `node_modules/` — reinstall with `npm install`
- `apps/web/dist/` — built automatically by GitHub Actions
- `.env` / secrets — never upload API keys
- Build cache and local editor files

## Option A — Upload with Git (recommended)

```powershell
cd "c:\Users\CiferTech\Desktop\Terra-Watch-GitHub-Upload"
git init
git remote add origin https://github.com/cifertech/Terra-Watch.git
git add .
git commit -m "Add Terra Watch app"
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Option B — Upload on GitHub.com

1. Open https://github.com/cifertech/Terra-Watch
2. Use **Add file → Upload files**
3. Drag the contents of this folder (not the folder itself, unless you want a nested repo)
4. Commit to `main`

## After upload

1. In GitHub repo **Settings → Pages**, set source to **GitHub Actions**
2. Push to `main` — the CI workflow builds and deploys the live site
3. Run locally anytime with:

```powershell
npm install
npm run dev
```

## Note

The README references `docs/demo.gif`, but no demo gif is included yet.
Add one later or remove that line from `README.md`.
