# Contributing to Terra Watch

Thanks for your interest in contributing! Terra Watch is a static, pre-built site — contributions work a little differently here than in a typical source-available repo.

---

## Understanding the Repo

The repo currently contains the **built output** of the app — not the original source files. This means:

- `assets/index-*.js` is the bundled, minified application
- `cesium/` is the self-hosted CesiumJS library
- There is no `src/` folder or `package.json` in the repo

This is important to understand before you try to contribute.

---

## Ways to Contribute

Even without source files, there are meaningful ways to help:

| Type | How |
|------|-----|
| 🐛 **Report a bug** | Open an [Issue](https://github.com/cifertech/Terra-Watch/issues) describing what you saw, what you expected, and your browser/OS |
| 💡 **Suggest a feature** | Open an [Issue](https://github.com/cifertech/Terra-Watch/issues) with the `enhancement` label |
| 📖 **Improve docs** | Edit `README.md` or `CONTRIBUTING.md` directly and open a PR |
| 🖼️ **Add screenshots** | Add demo screenshots or a GIF to `docs/` and open a PR — this directly helps the project get discovered |
| ⭐ **Star the repo** | Seriously, it helps more than you think |

---

## Reporting Bugs

When reporting a bug, please include:

- **What you saw** — describe the problem clearly
- **What you expected** — what should have happened
- **Steps to reproduce** — how to trigger the issue
- **Browser and OS** — e.g. Chrome 124 on Windows 11
- **Console errors** — open DevTools → Console and paste any red errors
- **Screenshot** — if the issue is visual

---

## Feature Requests

Open an issue with:

- A clear description of the feature
- Why it would be useful to others (not just you)
- Any data sources or APIs that could power it (bonus points for free, no-key APIs)

Good candidates for new features based on the project roadmap:
- 🌊 Ocean currents layer (Copernicus OSCAR — free)
- ☢️ Nuclear facilities overlay (GeoNuclearData — free static GeoJSON)
- 🌡️ Climate anomaly heatmap (NASA GISS — free)
- 🌋 Volcanic SO2 cloud overlay (NASA GIBS OMPS layer — free)

---

## Pull Requests

PRs are welcome for:
- Documentation improvements
- Adding screenshots or demo GIFs to `docs/`
- Fixing typos or broken links in README

For code changes, please open an issue first to discuss — since the repo contains a built bundle, code PRs require coordination with the maintainer to rebuild and commit the updated bundle.

---

## Code of Conduct

Be kind. Critique ideas, not people. This is a fun open-source project — keep it that way.

---

## Questions?

Open a [GitHub Issue](https://github.com/cifertech/Terra-Watch/issues) and tag it with `question`.

---

<p align="center">
  Terra Watch is MIT licensed and built on NASA open data.<br/>
  Every star, issue, and pull request makes it better. 🌍
</p>
