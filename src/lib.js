// Catalog is fetched at runtime (it's multi-MB) and installed here via initCatalog().
export let TITLES = [];
export let GENRES = [];
export let PROVIDER_LOGOS = {};

export function initCatalog(data) {
  TITLES = data.titles || [];
  PROVIDER_LOGOS = data.providers || {};
  const count = {};
  for (const t of TITLES) for (const g of t.genres) count[g] = (count[g] || 0) + 1;
  GENRES = Object.keys(count).sort((a, b) => count[b] - count[a]);
}

export const providerLogo = (name) => PROVIDER_LOGOS[name] || null;

export const REGIONS = [
  { key: "IN", label: "India" },
  { key: "US", label: "US" },
  { key: "all", label: "All regions" },
];

export const ERAS = [
  { key: "all", label: "All Years", test: () => true },
  { key: "2020s", label: "2020s", test: (y) => y >= 2020 },
  { key: "2010s", label: "2010s", test: (y) => y >= 2010 && y < 2020 },
  { key: "2000s", label: "2000s", test: (y) => y >= 2000 && y < 2010 },
  { key: "1990s", label: "90s", test: (y) => y >= 1990 && y < 2000 },
  { key: "classic", label: "Classics", test: (y) => y && y < 1990 },
];
export const eraTest = (key) => (ERAS.find((e) => e.key === key) || ERAS[0]).test;

export const scoreLabel = (t) => (t.score ? "★ " + t.score.toFixed(1) : null);

/* ---- where-to-watch helpers (region-aware) ---- */
export const offersFor = (t, kind, region) =>
  (t[kind] || []).filter((o) => region === "all" || o.region === region);

export const isFreeIn = (t, region) => t.playable || offersFor(t, "free", region).length > 0;

export function watchOptions(t, region) {
  const groups = [
    { kind: "free", label: "Free", offers: offersFor(t, "free", region) },
    { kind: "sub", label: "Subscription", offers: offersFor(t, "sub", region) },
    { kind: "rent", label: "Rent", offers: offersFor(t, "rent", region) },
    { kind: "buy", label: "Buy", offers: offersFor(t, "buy", region) },
  ].filter((g) => g.offers.length);
  // If nothing in the chosen region, fall back to showing all regions
  if (!groups.length && region !== "all") return watchOptions(t, "all");
  return groups;
}

// The primary button: play in-app > free > subscription > rent > buy.
export function primaryAction(t, region) {
  if (t.playable) return { mode: "play", label: "▶ Play" };
  const order = [
    ["free", (p) => `▶ Watch Free on ${p}`],
    ["sub", (p) => `Watch on ${p}`],
    ["rent", (p) => `Rent on ${p}`],
    ["buy", (p) => `Buy on ${p}`],
  ];
  for (const [kind, label] of order) {
    const o = offersFor(t, kind, region)[0] || (region !== "all" ? (t[kind] || [])[0] : null);
    if (o) return { mode: "link", label: label(o.provider), url: o.url, provider: o.provider, kind };
  }
  return { mode: "none", label: "Not available" };
}

// Small badge shown on cards.
export function badgeFor(t, region) {
  if (t.playable) return { text: "▶ FREE", cls: "free" };
  const free = offersFor(t, "free", region)[0];
  if (free) return { text: "FREE", cls: "free", provider: free.provider };
  const sub = offersFor(t, "sub", region)[0];
  if (sub) return { text: sub.provider, cls: "sub", provider: sub.provider };
  const paid = offersFor(t, "rent", region)[0] || offersFor(t, "buy", region)[0];
  if (paid) return { text: "Rent / Buy", cls: "paid", provider: paid.provider };
  return { text: "Where to watch", cls: "paid" };
}

export function buildRows(titles) {
  const rows = [];
  const modern = titles.filter((t) => t.source === "jw");
  const classics = titles.filter((t) => t.source === "archive");
  const byScore = (arr) => [...arr].sort((a, b) => (b.score || 0) - (a.score || 0));
  const byPop = (arr) => [...arr].sort((a, b) => b.downloads - a.downloads);

  const fresh = modern.filter((t) => t.year >= 2020);
  if (fresh.length >= 4) rows.push({ key: "new", label: "New & Free — 2020s", items: byScore(fresh) });
  if (modern.length >= 4) rows.push({ key: "freehub", label: "Free to Watch Now", items: byScore(modern) });
  if (classics.length >= 4) rows.push({ key: "classics", label: "▶ Plays In-App — Public-Domain Classics", items: byPop(classics) });

  const topRated = byScore(titles.filter((t) => t.score >= 7));
  if (topRated.length >= 6) rows.push({ key: "top", label: "Top Rated", items: topRated });

  for (const g of GENRES) {
    const items = byScore(titles.filter((t) => t.genres.includes(g)));
    if (items.length >= 5) rows.push({ key: "g-" + g, label: g, items });
  }
  return rows.filter((r) => r.items.length >= 4);
}

export function pickHeroes(titles) {
  const good = titles
    .filter((t) => t.overview.length > 70 && t.backdrop)
    .sort((a, b) => {
      const am = a.source === "jw" ? 1 : 0;
      const bm = b.source === "jw" ? 1 : 0;
      if (am !== bm) return bm - am;
      return (b.score || 0) - (a.score || 0);
    });
  const seen = new Set();
  const spread = [];
  const rest = [];
  for (const t of good) {
    const g = t.genres[0] || t.source;
    if (!seen.has(g)) (seen.add(g), spread.push(t));
    else rest.push(t);
  }
  return [...spread, ...rest].slice(0, 8);
}

const LIST_KEY = "neostream.mylist";
export const loadList = () => {
  try {
    return JSON.parse(localStorage.getItem(LIST_KEY)) || [];
  } catch {
    return [];
  }
};
export const saveList = (ids) => localStorage.setItem(LIST_KEY, JSON.stringify(ids));

const PROFILE_KEY = "neostream.profile";
export const loadProfile = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
};
export const saveProfile = (p) => localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
export const clearProfile = () => localStorage.removeItem(PROFILE_KEY);
