# NeoStream

**Free movies & shows. Streaming forever. No account, no subscription, no limits.**

NeoStream is a Netflix-style, 100% **legal & free** streaming platform. It's a hybrid:

- **Classics play right in the browser** — real in-app video from the
  [Internet Archive](https://archive.org)'s public-domain film & TV collections (~300 titles).
- **Modern titles (1990–2026)** are the movies & shows that are legitimately free
  (ad-supported) on Tubi, Roku Channel, Freevee, Sony LIV, MX Player, Zee5 & more.
  NeoStream lists them with one-click "Watch Free" deep-links (US + India). ~170 titles.

- **Universal "where can I watch it?" search** — search *any* of ~1,150 indexed
  titles and NeoStream shows every place it streams, **free options first**, then
  subscription, then rent/buy — each a one-click deep-link. Region-aware (India / US).

Nothing here is pirated, so it can never be taken down. Modern copyrighted content
(Netflix/Prime/Hotstar originals behind a paywall) is intentionally **not** rehosted —
that would be piracy. Instead NeoStream plays what's legally free in-app, and for
everything else tells you exactly where to watch it for the least money.

> **Why not Netflix/Prime/Hotstar content?** Those are copyrighted and paywalled —
> serving them free would be piracy (illegal, and taken down within days).
> NeoStream instead unifies the *legitimately free* film world into one
> cinematic experience you own forever.

## Features

- **Real in-app playback** — click Play, the film streams in an embedded player. No redirect, no login.
- **350+ public-domain titles** across Feature Films, Film Noir, Sci-Fi & Horror, Classic TV, Silent Era, Animation & Comedy
- **Profile gate**, auto-rotating cinematic hero, Most Watched / Top Rated / per-genre rows
- **Genre filter**, Movies / TV tabs, instant **search**, persistent **My List**
- **Detail modal** with synopsis, rating, genres, and one-click Play

## Run

```powershell
npm install
npm run dev            # http://localhost:5173
```

## Refresh the catalog

```powershell
npm run catalog        # re-fetches free titles from the Internet Archive
```

## Deploy (GitHub Pages)

```powershell
$env:GHPAGES="1"; npm run build      # builds with /neostream/ base path
# then force-push dist/ to the gh-pages branch
```

Live at **https://ankit-2910.github.io/neostream/**

## Stack

Vite + React 18, plain CSS. Catalog & playback via the Internet Archive public API
(`archive.org/advancedsearch.php` + `/embed/`). No API keys, no backend.
