# NeoStream

**One home for Netflix, Prime Video & JioHotstar.**

NeoStream unifies the catalogs of all three major streaming platforms into a single
cinematic, Netflix-style experience — browse everything in one place, then play any
title with one click on the platform that carries it (your subscriptions and accounts
stay with each provider; NeoStream never touches their streams).

## Features

- **Unified catalog** — 200+ live titles across Netflix, Prime Video and JioHotstar (India),
  refreshed from JustWatch's public API
- **Profile gate** — Netflix-style "Who's watching?" screen
- **Cinematic hero** — auto-rotating featured titles with full-bleed backdrops
- **Smart rows** — Trending (platform-interleaved), per-platform rows, Top Rated (IMDb 8+), genre rows
- **Platform filter** — view All / Netflix / Prime Video / JioHotstar only
- **Movies / TV Shows tabs**, instant **search**, and a persistent **My List** (localStorage)
- **Detail modal** — backdrop, synopsis, genres, IMDb score, trailer lookup, and a
  **deep link straight to the title's watch page** on its platform

## Run

```powershell
npm install
npm run dev        # http://localhost:5173
```

## Refresh the catalog

```powershell
npm run catalog    # re-fetches from JustWatch into src/data/catalog.json
```

## Stack

Vite + React 18, plain CSS. Catalog data via JustWatch public GraphQL (region IN).
No API keys required.
