// Builds NeoStream's FREE catalog from the Internet Archive's public-domain
// film & TV collections. Every title has a real, embeddable, in-browser player
// (https://archive.org/embed/{id}) — genuine playback, 100% legal, no keys.
// Run: node scripts/fetch-free-catalog.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "catalog.json");

// Each shelf maps an Archive collection to a NeoStream genre label.
const SHELVES = [
  { collection: "feature_films", genre: "Feature Films", rows: 90 },
  { collection: "Film_Noir", genre: "Film Noir", rows: 60 },
  { collection: "SciFi_Horror", genre: "Sci-Fi & Horror", rows: 70 },
  { collection: "classic_tv", genre: "Classic TV", rows: 60 },
  { collection: "silent_films", genre: "Silent Era", rows: 40 },
  { collection: "animationandcartoons", genre: "Animation", rows: 50 },
  { collection: "more_animation", genre: "Animation", rows: 40 },
];

const FIELDS = ["identifier", "title", "year", "description", "downloads", "avg_rating", "subject"];

async function fetchShelf({ collection, rows }) {
  const params = new URLSearchParams();
  params.set("q", `collection:(${collection}) AND mediatype:(movies)`);
  for (const f of FIELDS) params.append("fl[]", f);
  params.append("sort[]", "downloads desc");
  params.set("rows", String(rows));
  params.set("output", "json");
  const res = await fetch(`https://archive.org/advancedsearch.php?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.response.docs;
}

// Archive returns some fields as arrays (multi-valued) or numbers — coerce to a string.
const first = (x) => (Array.isArray(x) ? x[0] : x);
const clean = (x) =>
  String(first(x) ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/You can find more information.*$/is, "")
    .replace(/\s+/g, " ")
    .trim();

const isTv = (collection) => collection === "classic_tv";

function normalize(doc, genre, collection) {
  if (!doc.identifier || !doc.title) return null;
  const title = String(first(doc.title) ?? "").replace(/\s+/g, " ").trim();
  if (!title) return null;
  const year = parseInt(first(doc.year), 10);
  return {
    id: `ia-${doc.identifier}`,
    source: "archive",
    playId: doc.identifier,
    type: isTv(collection) ? "show" : "movie",
    title: title.slice(0, 80),
    year: year && year > 1870 && year < 2027 ? year : null,
    overview: clean(doc.description).slice(0, 400),
    genres: [genre],
    rating: doc.avg_rating ? Math.round(doc.avg_rating * 10) / 10 : null,
    downloads: doc.downloads || 0,
    poster: `https://archive.org/services/img/${doc.identifier}`,
    embed: `https://archive.org/embed/${doc.identifier}`,
    watchUrl: `https://archive.org/details/${doc.identifier}`,
  };
}

const byId = new Map();
for (const shelf of SHELVES) {
  try {
    const docs = await fetchShelf(shelf);
    let added = 0;
    for (const d of docs) {
      const t = normalize(d, shelf.genre, shelf.collection);
      if (!t) continue;
      if (byId.has(t.id)) {
        // Same film in two collections → merge genres instead of dropping
        const ex = byId.get(t.id);
        if (!ex.genres.includes(shelf.genre)) ex.genres.push(shelf.genre);
        continue;
      }
      byId.set(t.id, t);
      added++;
    }
    console.log(`${shelf.collection}: ${docs.length} fetched, ${added} new`);
  } catch (err) {
    console.error(`${shelf.collection} failed:`, err.message);
  }
}

const titles = [...byId.values()].filter((t) => t.downloads > 500);
if (titles.length < 100) {
  console.error(`Only ${titles.length} titles — refusing to overwrite catalog.`);
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), source: "Internet Archive (public domain)", titles }, null, 1));
const counts = titles.reduce((a, t) => ((a[t.genres[0]] = (a[t.genres[0]] || 0) + 1), a), {});
console.log(`\nWrote ${titles.length} playable titles to catalog.json`);
console.log(counts);
