import catalog from "./data/catalog.json";

export const TITLES = catalog.titles;

export const PLATFORMS = {
  netflix: { name: "Netflix", short: "N", color: "#e50914" },
  prime: { name: "Prime Video", short: "P", color: "#00a8e1" },
  hotstar: { name: "JioHotstar", short: "H", color: "#1f80e0" },
};

export const GENRES = {
  act: "Action & Adventure",
  cmy: "Comedy",
  crm: "Crime",
  drm: "Drama",
  fnt: "Fantasy",
  hrr: "Horror",
  rma: "Romance",
  scf: "Sci-Fi",
  trl: "Thriller",
  doc: "Documentary",
  ani: "Animation",
  fml: "Family",
  war: "War",
  hst: "History",
  msc: "Music",
  spt: "Sport",
  wsn: "Western",
};

export const genreNames = (t) => t.genres.map((g) => GENRES[g]).filter(Boolean);

export function buildRows(titles) {
  const rows = [];
  const byRating = [...titles].sort((a, b) => (b.imdb || 0) - (a.imdb || 0));

  rows.push({ key: "trending", label: "Trending Now", items: interleave(titles) });
  for (const [key, p] of Object.entries(PLATFORMS)) {
    const items = titles.filter((t) => t.platform === key);
    if (items.length) rows.push({ key, label: `Popular on ${p.name}`, items });
  }
  rows.push({ key: "top", label: "Top Rated — IMDb 8+", items: byRating.filter((t) => t.imdb >= 8) });
  for (const g of ["act", "drm", "cmy", "trl", "scf", "crm", "rma", "fnt", "hrr"]) {
    const items = titles.filter((t) => t.genres.includes(g));
    if (items.length >= 6) rows.push({ key: "g-" + g, label: GENRES[g], items });
  }
  return rows.filter((r) => r.items.length >= 4);
}

// Mix platforms so "Trending" doesn't show one provider block-by-block
function interleave(titles) {
  const buckets = Object.keys(PLATFORMS).map((k) => titles.filter((t) => t.platform === k));
  const out = [];
  for (let i = 0; i < 20; i++) for (const b of buckets) if (b[i]) out.push(b[i]);
  return out;
}

export function pickHeroes(titles) {
  const good = titles.filter((t) => t.backdrop && t.imdb >= 7.5 && t.overview.length > 60);
  const perPlatform = Object.keys(PLATFORMS).map((k) => good.filter((t) => t.platform === k).slice(0, 3));
  const out = [];
  for (let i = 0; i < 3; i++) for (const b of perPlatform) if (b[i]) out.push(b[i]);
  return out.slice(0, 7);
}

export const trailerUrl = (t) =>
  t.trailer
    ? `https://www.youtube.com/watch?v=${t.trailer}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${t.title} ${t.year || ""} official trailer`)}`;

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
