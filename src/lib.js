import catalog from "./data/catalog.json";

export const TITLES = catalog.titles;

export const ERAS = [
  { key: "all", label: "All Years", test: () => true },
  { key: "2020s", label: "2020s", test: (y) => y >= 2020 },
  { key: "2010s", label: "2010s", test: (y) => y >= 2010 && y < 2020 },
  { key: "2000s", label: "2000s", test: (y) => y >= 2000 && y < 2010 },
  { key: "1990s", label: "90s", test: (y) => y >= 1990 && y < 2000 },
  { key: "classic", label: "Classics", test: (y) => y && y < 1990 },
];
export const eraTest = (key) => (ERAS.find((e) => e.key === key) || ERAS[0]).test;

// Genres present in the catalog, ordered by frequency.
export const GENRES = (() => {
  const count = {};
  for (const t of TITLES) for (const g of t.genres) count[g] = (count[g] || 0) + 1;
  return Object.keys(count).sort((a, b) => count[b] - count[a]);
})();

export const scoreLabel = (t) => (t.score ? "★ " + t.score.toFixed(1) : null);

export function buildRows(titles) {
  const rows = [];
  const modern = titles.filter((t) => t.source === "external");
  const classics = titles.filter((t) => t.source === "archive");
  const byScore = (arr) => [...arr].sort((a, b) => (b.score || 0) - (a.score || 0));
  const byPop = (arr) => [...arr].sort((a, b) => b.downloads - a.downloads);

  const fresh = modern.filter((t) => t.year >= 2018);
  if (fresh.length >= 4) rows.push({ key: "new", label: "New & Free — 2018 onward", items: byScore(fresh) });
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
  // Prefer modern titles with real backdrops for the hero; fall back to classics.
  const good = titles
    .filter((t) => t.overview.length > 70 && t.backdrop)
    .sort((a, b) => {
      const am = a.source === "external" ? 1 : 0;
      const bm = b.source === "external" ? 1 : 0;
      if (am !== bm) return bm - am; // modern first
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
