import catalog from "./data/catalog.json";

export const TITLES = catalog.titles;
export const SOURCE_LABEL = catalog.source;

// All genres present in the catalog, ordered by how many titles carry them.
export const GENRES = (() => {
  const count = {};
  for (const t of TITLES) for (const g of t.genres) count[g] = (count[g] || 0) + 1;
  return Object.keys(count).sort((a, b) => count[b] - count[a]);
})();

export function buildRows(titles) {
  const rows = [];
  const byDownloads = [...titles].sort((a, b) => b.downloads - a.downloads);
  const byRating = [...titles].filter((t) => t.rating).sort((a, b) => b.rating - a.rating);

  rows.push({ key: "watched", label: "Most Watched", items: byDownloads });
  if (byRating.length >= 6) rows.push({ key: "top", label: "Top Rated", items: byRating.filter((t) => t.rating >= 4) });
  for (const g of GENRES) {
    const items = byDownloads.filter((t) => t.genres.includes(g));
    if (items.length >= 5) rows.push({ key: "g-" + g, label: g, items });
  }
  return rows.filter((r) => r.items.length >= 4);
}

export function pickHeroes(titles) {
  const good = titles
    .filter((t) => t.overview.length > 70 && t.poster)
    .sort((a, b) => b.downloads - a.downloads);
  // Spread the hero picks across different lead genres so it isn't all one shelf
  const seenGenre = new Set();
  const spread = [];
  const rest = [];
  for (const t of good) {
    const g = t.genres[0];
    if (!seenGenre.has(g)) (seenGenre.add(g), spread.push(t));
    else rest.push(t);
  }
  return [...spread, ...rest].slice(0, 7);
}

export const ratingStars = (r) => (r ? "★ " + r.toFixed(1) + "/5" : null);

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
