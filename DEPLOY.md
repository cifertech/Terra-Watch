# Deploy Terra Watch to GitHub Pages

If https://cifertech.github.io/Terra-Watch/ shows the README instead of the globe app, GitHub Pages is serving the repo root — not the built site.

## Fix (one-time, in GitHub)

1. Open **https://github.com/cifertech/Terra-Watch/settings/pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. Upload or push the full project (including `.github/workflows/ci.yml`).
4. Go to **Actions** → **Build and Deploy** → **Run workflow** (or push to `main`).
5. Wait for the green checkmark, then open **https://cifertech.github.io/Terra-Watch/**

The live URL should match what you see at `http://localhost:5173/`.

## What gets deployed

The workflow builds `apps/web` with `VITE_BASE_PATH=/Terra-Watch/` and publishes `apps/web/dist` to GitHub Pages. No server or API keys are required — the app fetches NASA, USGS, and NOAA data directly in the browser.

## Upload the project

Use the prepared folder on your Desktop:

`Terra-Watch-GitHub-Upload`

Or push with Git:

```powershell
cd "c:\Users\CiferTech\Desktop\Terra-Watch-GitHub-Upload"
git init
git remote add origin https://github.com/cifertech/Terra-Watch.git
git add .
git commit -m "Deploy Terra Watch app to GitHub Pages"
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site shows README | Pages source must be **GitHub Actions** |
| Blank page | Hard-refresh (Ctrl+F5); check Actions log for build errors |
| 404 on assets | Ensure repo name is `Terra-Watch` (case-sensitive path) |
| Workflow missing | Upload `.github/workflows/ci.yml` |
