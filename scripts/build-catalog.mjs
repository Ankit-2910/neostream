// Builds NeoStream's HYBRID catalog:
//   1. Internet Archive public-domain classics  -> play IN-APP (embed)
//   2. JustWatch "free & ad-supported" modern     -> deep-link OUT (Tubi/Roku/
//      Freevee/Sony LIV/…), 1990-2026, US + IN. Legal, free-with-ads, no login.
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
    title: title.slice(0, 80),
    year: year && year > 1870 && year < 2027 ? year : null,
    overview: clean(doc.description).slice(0, 400),
    genres: [genre],
    score: doc.avg_rating ? Math.round(doc.avg_rating * 2 * 10) / 10 : null, // 0-5 → 0-10
    downloads: doc.downloads || 0,
    poster: `https://archive.org/services/img/${doc.identifier}`,
    backdrop: `https://archive.org/services/img/${doc.identifier}`,
    embed: `https://archive.org/embed/${doc.identifier}`,
    watchUrl: `https://archive.org/details/${doc.identifier}`,
    provider: "Internet Archive",
  };
}

/* ------------------------------------------------------------------ */
/*  2. JustWatch — modern free / ad-supported, deep-link out           */
/* ------------------------------------------------------------------ */
const JW_GENRE = {
  act: "Action", cmy: "Comedy", crm: "Crime", drm: "Drama", fnt: "Fantasy",
  hrr: "Horror", rma: "Romance", scf: "Sci-Fi", trl: "Thriller", doc: "Documentary",
  ani: "Animation", fml: "Family", war: "War", hst: "History", msc: "Music",
  spt: "Sport", wsn: "Western",
};
const JW_QUERY = `
query($country: Country!, $first: Int!, $filter: TitleFilter) {
  popularTitles(country: $country, first: $first, sortBy: POPULAR, filter: $filter) {
    edges { node { id objectType ... on MovieOrShow {
      content(country: $country, language: "en") {
        title originalReleaseYear shortDescription posterUrl
        genres { shortName } scoring { imdbScore }
        backdrops { backdropUrl }
      }
      offers(country: $country, platform: WEB, filter: { monetizationTypes: [FREE, ADS] }) {
        monetizationType standardWebURL package { clearName }
      }
    } } }
  }
}`;
const jwImg = (tpl, profile) =>
  tpl ? "https://images.justwatch.com" + tpl.replace("{profile}", profile).replace("{format}", "webp") : null;

async function fetchJW(country, objectTypes, count) {
  const res = await fetch("https://apis.justwatch.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: JW_QUERY,
      variables: {
        country,
        first: count,
        filter: { objectTypes, monetizationTypes: ["FREE", "ADS"], releaseYear: { min: 1990 } },
      },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 300));
  return j.data.popularTitles.edges.map((e) => e.node);
}

// Providers that are genuinely free / ad-supported (filter out mislabeled subs)
const FREE_PROVIDERS = new Set([
  "Tubi TV", "The Roku Channel", "Amazon Freevee", "Freevee", "Pluto TV", "Fawesome",
  "Plex", "Kanopy", "Hoopla", "Crackle", "PBS", "FXNow", "JustWatch TV", "Sony Liv",
  "MX Player", "JioCinema", "Zee5", "VI movies and tv", "Distro TV", "Vudu Free",
  "Fandango at Home Free", "Sun Nxt", "Hungama Play", "ShemarooMe",
]);

function normJW(node, region) {
  const c = node.content;
  if (!c || !c.posterUrl || !c.title) return null;
  const offers = (node.offers || [])
    .filter((o) => o.standardWebURL && FREE_PROVIDERS.has(o.package?.clearName))
    .map((o) => ({ provider: o.package.clearName, url: o.standardWebURL, region, free: o.monetizationType === "FREE" }));
  if (!offers.length) return null;
  const uniq = [...new Map(offers.map((o) => [o.provider + o.region, o])).values()];
  return {
    id: `jw-${node.id}`,
    source: "external",
    playable: false,
    type: node.objectType === "MOVIE" ? "movie" : "show",
    title: c.title.slice(0, 80),
    year: c.originalReleaseYear || null,
    overview: (c.shortDescription || "").slice(0, 400),
    genres: (c.genres || []).map((g) => JW_GENRE[g.shortName]).filter(Boolean),
    score: c.scoring?.imdbScore ?? null,
    downloads: 0,
    poster: jwImg(c.posterUrl, "s332"),
    backdrop: jwImg(c.backdrops?.[0]?.backdropUrl, "s1440") || jwImg(c.posterUrl, "s718"),
    offers: uniq,
    watchUrl: uniq[0].url,
    provider: uniq[0].provider,
    regions: [...new Set(uniq.map((o) => o.region))],
  };
}

/* ------------------------------------------------------------------ */
/*  Build                                                              */
/* ------------------------------------------------------------------ */
const byId = new Map();

// Archive
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

// JustWatch modern free — merge same title across regions
const jwByKey = new Map();
const JW_JOBS = [
  ["US", ["MOVIE"], 90],
  ["US", ["SHOW"], 50],
  ["IN", ["MOVIE"], 70],
  ["IN", ["SHOW"], 50],
];
for (const [country, types, count] of JW_JOBS) {
  try {
    const nodes = await fetchJW(country, types, count);
    let added = 0;
    for (const n of nodes) {
      const t = normJW(n, country);
      if (!t) continue;
      const key = (t.title + "|" + (t.year || "")).toLowerCase();
      if (jwByKey.has(key)) {
        const ex = jwByKey.get(key);
        for (const o of t.offers) if (!ex.offers.some((e) => e.provider === o.provider && e.region === o.region)) ex.offers.push(o);
        ex.regions = [...new Set(ex.offers.map((o) => o.region))];
        continue;
      }
      jwByKey.set(key, t);
      added++;
    }
    console.log(`JW ${country} ${types}: ${nodes.length} fetched, ${added} new`);
  } catch (e) {
    console.error(`JW ${country} ${types} failed:`, e.message);
  }
}
for (const t of jwByKey.values()) byId.set(t.id, t);

const titles = [...byId.values()];
const archiveN = titles.filter((t) => t.source === "archive").length;
const modernN = titles.filter((t) => t.source === "external").length;
if (archiveN < 80 || modernN < 40) {
  console.error(`Too few titles (archive ${archiveN}, modern ${modernN}) — refusing to overwrite.`);
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), titles }, null, 1));
console.log(`\nWrote ${titles.length} titles: ${archiveN} in-app classics + ${modernN} modern free links`);
const eras = titles.reduce((a, t) => {
  const d = t.year ? `${Math.floor(t.year / 10) * 10}s` : "unknown";
  a[d] = (a[d] || 0) + 1;
  return a;
}, {});
console.log("By decade:", Object.fromEntries(Object.entries(eras).sort()));
