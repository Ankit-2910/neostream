// Builds NeoStream's catalog:
//   1. Internet Archive public-domain classics -> play IN-APP (embed)
//   2. JustWatch popular titles (US + IN), deep-paginated, with FULL "where to
//      watch" data: free/ads, subscription, rent, buy — every provider + link.
//      Powers the universal "where can I watch this?" search. Legal: we store
//      links, never streams.
// Run: node scripts/build-catalog.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "catalog.json");

/* ------------------------------------------------------------------ */
/*  1. Internet Archive — in-app playable public-domain classics       */
/* ------------------------------------------------------------------ */
const IA_SHELVES = [
  { collection: "feature_films", genre: "Feature Films", rows: 80 },
  { collection: "Film_Noir", genre: "Film Noir", rows: 55 },
  { collection: "SciFi_Horror", genre: "Sci-Fi & Horror", rows: 60 },
  { collection: "classic_tv", genre: "Classic TV", rows: 55 },
  { collection: "silent_films", genre: "Silent Era", rows: 30 },
  { collection: "animationandcartoons", genre: "Animation", rows: 45 },
];
const IA_FIELDS = ["identifier", "title", "year", "description", "downloads", "avg_rating"];
const first = (x) => (Array.isArray(x) ? x[0] : x);
const clean = (x) =>
  String(first(x) ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/You can find more information.*$/is, "")
    .replace(/\s+/g, " ")
    .trim();

async function fetchIA({ collection, rows }) {
  const p = new URLSearchParams();
  p.set("q", `collection:(${collection}) AND mediatype:(movies)`);
  for (const f of IA_FIELDS) p.append("fl[]", f);
  p.append("sort[]", "downloads desc");
  p.set("rows", String(rows));
  p.set("output", "json");
  const res = await fetch(`https://archive.org/advancedsearch.php?${p}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).response.docs;
}

function normIA(doc, genre, collection) {
  const title = String(first(doc.title) ?? "").replace(/\s+/g, " ").trim();
  if (!doc.identifier || !title) return null;
  const year = parseInt(first(doc.year), 10);
  return {
    id: `ia-${doc.identifier}`,
    source: "archive",
    playable: true,
    type: collection === "classic_tv" ? "show" : "movie",
    title: title.slice(0, 90),
    year: year && year > 1870 && year < 2027 ? year : null,
    overview: clean(doc.description).slice(0, 420),
    genres: [genre],
    score: doc.avg_rating ? Math.round(doc.avg_rating * 2 * 10) / 10 : null,
    downloads: doc.downloads || 0,
    poster: `https://archive.org/services/img/${doc.identifier}`,
    backdrop: `https://archive.org/services/img/${doc.identifier}`,
    embed: `https://archive.org/embed/${doc.identifier}`,
    free: [], sub: [], rent: [], buy: [],
    watchUrl: `https://archive.org/details/${doc.identifier}`,
    provider: "Internet Archive",
  };
}

/* ------------------------------------------------------------------ */
/*  2. JustWatch — deep index with full where-to-watch                 */
/* ------------------------------------------------------------------ */
const JW_GENRE = {
  act: "Action", cmy: "Comedy", crm: "Crime", drm: "Drama", fnt: "Fantasy",
  hrr: "Horror", rma: "Romance", scf: "Sci-Fi", trl: "Thriller", doc: "Documentary",
  ani: "Animation", fml: "Family", war: "War", hst: "History", msc: "Music",
  spt: "Sport", wsn: "Western",
};
const JW_QUERY = `
query($country: Country!, $first: Int!, $after: String, $filter: TitleFilter) {
  popularTitles(country: $country, first: $first, after: $after, sortBy: POPULAR, filter: $filter) {
    pageInfo { endCursor hasNextPage }
    edges { node { id objectType ... on MovieOrShow {
      content(country: $country, language: "en") {
        title originalReleaseYear shortDescription posterUrl
        genres { shortName } scoring { imdbScore } backdrops { backdropUrl }
      }
      offers(country: $country, platform: WEB) {
        monetizationType standardWebURL package { clearName }
      }
    } } }
  }
}`;
const jwImg = (tpl, profile) =>
  tpl ? "https://images.justwatch.com" + tpl.replace("{profile}", profile).replace("{format}", "webp") : null;

async function fetchJWPage(country, objectTypes, first, after) {
  const res = await fetch("https://apis.justwatch.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: JW_QUERY,
      variables: { country, first, after, filter: { objectTypes } },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 300));
  return j.data.popularTitles;
}

const bucket = (mt) => {
  if (mt === "FREE" || mt === "ADS") return "free";
  if (mt === "FLATRATE" || mt === "FLATRATE_AND_BUY") return "sub";
  if (mt === "RENT") return "rent";
  if (mt === "BUY") return "buy";
  return null;
};

function normJW(node, region) {
  const c = node.content;
  if (!c || !c.posterUrl || !c.title) return null;
  const groups = { free: new Map(), sub: new Map(), rent: new Map(), buy: new Map() };
  for (const o of node.offers || []) {
    const b = bucket(o.monetizationType);
    if (!b || !o.standardWebURL || !o.package?.clearName) continue;
    if (!groups[b].has(o.package.clearName))
      groups[b].set(o.package.clearName, { provider: o.package.clearName, url: o.standardWebURL, region });
  }
  const pick = (b) => [...groups[b].values()];
  return {
    id: `jw-${node.id}`,
    source: "jw",
    playable: false,
    type: node.objectType === "MOVIE" ? "movie" : "show",
    title: c.title.slice(0, 90),
    year: c.originalReleaseYear || null,
    overview: (c.shortDescription || "").slice(0, 420),
    genres: (c.genres || []).map((g) => JW_GENRE[g.shortName]).filter(Boolean),
    score: c.scoring?.imdbScore ?? null,
    downloads: 0,
    poster: jwImg(c.posterUrl, "s332"),
    backdrop: jwImg(c.backdrops?.[0]?.backdropUrl, "s1440") || jwImg(c.posterUrl, "s718"),
    free: pick("free"), sub: pick("sub"), rent: pick("rent"), buy: pick("buy"),
  };
}

const mergeOffers = (a, b) => {
  for (const k of ["free", "sub", "rent", "buy"]) {
    const seen = new Set(a[k].map((o) => o.provider + o.region));
    for (const o of b[k]) if (!seen.has(o.provider + o.region)) a[k].push(o);
  }
};

/* ------------------------------------------------------------------ */
/*  Build                                                              */
/* ------------------------------------------------------------------ */
const byId = new Map();

for (const s of IA_SHELVES) {
  try {
    const docs = await fetchIA(s);
    let added = 0;
    for (const d of docs) {
      const t = normIA(d, s.genre, s.collection);
      if (!t || t.downloads < 500) continue;
      if (byId.has(t.id)) {
        const ex = byId.get(t.id);
        if (!ex.genres.includes(s.genre)) ex.genres.push(s.genre);
        continue;
      }
      byId.set(t.id, t);
      added++;
    }
    console.log(`IA ${s.collection}: ${docs.length} fetched, ${added} new`);
  } catch (e) {
    console.error(`IA ${s.collection} failed:`, e.message);
  }
}

// JustWatch: paginate each (country, type). Merge same title across regions.
const jwByKey = new Map();
const JW_JOBS = [
  ["IN", ["MOVIE"], 8],
  ["IN", ["SHOW"], 6],
  ["US", ["MOVIE"], 8],
  ["US", ["SHOW"], 6],
];
const PAGE = 40;
for (const [country, types, pages] of JW_JOBS) {
  let after = null, got = 0, added = 0;
  for (let pg = 0; pg < pages; pg++) {
    try {
      const data = await fetchJWPage(country, types, PAGE, after);
      for (const e of data.edges) {
        const t = normJW(e.node, country);
        if (!t) continue;
        got++;
        const key = (t.title + "|" + (t.year || "")).toLowerCase();
        if (jwByKey.has(key)) mergeOffers(jwByKey.get(key), t);
        else (jwByKey.set(key, t), added++);
      }
      if (!data.pageInfo.hasNextPage) break;
      after = data.pageInfo.endCursor;
    } catch (e) {
      console.error(`JW ${country} ${types} p${pg} failed:`, e.message);
      break;
    }
  }
  console.log(`JW ${country} ${types}: ${got} fetched, ${added} new keys`);
}
for (const t of jwByKey.values()) {
  // Drop titles with no offers anywhere and no poster value
  if (!t.free.length && !t.sub.length && !t.rent.length && !t.buy.length) continue;
  byId.set(t.id, t);
}

const titles = [...byId.values()];
const archiveN = titles.filter((t) => t.source === "archive").length;
const jwN = titles.filter((t) => t.source === "jw").length;
const freeN = titles.filter((t) => t.playable || t.free.length).length;
if (archiveN < 80 || jwN < 300) {
  console.error(`Too few titles (archive ${archiveN}, jw ${jwN}) — refusing to overwrite.`);
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), titles }, null, 0));
console.log(`\nWrote ${titles.length} titles: ${archiveN} in-app classics + ${jwN} indexed`);
console.log(`Free to watch (in-app or free provider): ${freeN}`);
const eras = titles.reduce((a, t) => {
  const d = t.year ? `${Math.floor(t.year / 10) * 10}s` : "?";
  a[d] = (a[d] || 0) + 1;
  return a;
}, {});
console.log("By decade:", Object.fromEntries(Object.entries(eras).sort()));
