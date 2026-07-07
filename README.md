# tpcom

Personal site for [Tyler Probst](https://github.com/tylerprobst), built with Next.js.

**Live site:** https://tylerprobst.github.io/tpcom/

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test the GitHub Pages build locally

```bash
GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/tpcom npm run build
npx serve out
```

Then open the URL shown (paths are under `/tpcom/`).

## GitHub Pages

Deployments run automatically via GitHub Actions on pushes to `main`.

### One-time GitHub setup

1. Open **Settings → Pages** for this repo.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or re-run the **Deploy to GitHub Pages** workflow).

The site publishes to `https://tylerprobst.github.io/tpcom/`.

## Legacy static site

The previous HTML/CSS resume site is archived in [`legacy/`](legacy/).

## Hero iterations

Prior homepage experiments are archived under [`iterations/`](iterations/).