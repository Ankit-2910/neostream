// Fetches the combined catalog (Netflix + Prime Video + JioHotstar, India)
// from JustWatch's public GraphQL API and bakes it into src/data/catalog.json.
// Run: node scripts/fetch-catalog.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "catalog.json");

const PROVIDERS = [
  { code: "nfx", key: "netflix", name: "Netflix" },
  { code: "prv", key: "prime", name: "Prime Video" },
  { code: "jhs", key: "hotstar", name: "JioHotstar" },
];

const QUERY = `
query GetPopularTitles($country: Country!, $first: Int!, $filter: TitleFilter, $sortBy: PopularTitlesSorting!) {
  popularTitles(country: $country, first: $first, sortBy: $sortBy, filter: $filter) {
    edges {
      node {
        id
        objectType
        ... on MovieOrShow {
          content(country: $country, language: "en") {
            title
            posterUrl
            fullPath
            shortDescription
            originalReleaseYear
            genres { shortName }
            scoring { imdbScore }
            backdrops { backdropUrl }
            clips { externalId provider }
          }
          offers(country: $country, platform: WEB, filter: { monetizationTypes: [FLATRATE] }) {
            standardWebURL
            package { shortName }
          }
        }
      }
    }
  }
}`;

async function gql(variables) {
  const res = await fetch("https://apis.justwatch.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables }),
  });
  if (!res.ok) throw new Error(`JustWatch HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 500));
  return json.data.popularTitles.edges.map((e) => e.node);
}

const img = (tpl, profile) =>
  tpl ? "https://images.justwatch.com" + tpl.replace("{profile}", profile).replace("{format}", "webp") : null;

function normalize(node, providerKey) {
  const c = node.content;
  if (!c || !c.posterUrl) return null;
  const offer = (node.offers || []).find((o) => o.standardWebURL);
  const yt = (c.clips || []).find((cl) => cl.provider === "YOUTUBE");
  return {
    id: node.id,
    type: node.objectType === "MOVIE" ? "movie" : "show",
    title: c.title,
    year: c.originalReleaseYear,
    overview: c.shortDescription || "",
    genres: (c.genres || []).map((g) => g.shortName),
    imdb: c.scoring?.imdbScore ?? null,
    poster: img(c.posterUrl, "s332"),
    backdrop: img(c.backdrops?.[0]?.backdropUrl, "s1440"),
    trailer: yt ? yt.externalId : null,
    platform: providerKey,
    watchUrl: offer?.standardWebURL || "https://www.justwatch.com" + c.fullPath,
  };
}

const byId = new Map();
for (const p of PROVIDERS) {
  for (const sortBy of ["POPULAR", "TRENDING"]) {
    try {
      const nodes = await gql({
        country: "IN",
        first: 60,
        sortBy,
        filter: { packages: [p.code] },
      });
      let added = 0;
      for (const n of nodes) {
        const t = normalize(n, p.key);
        if (!t) continue;
        if (byId.has(t.id)) continue; // first provider wins; keeps dedupe simple
        byId.set(t.id, t);
        added++;
      }
      console.log(`${p.name} [${sortBy}]: ${nodes.length} fetched, ${added} new`);
    } catch (err) {
      console.error(`${p.name} [${sortBy}] failed:`, err.message);
    }
  }
}

const titles = [...byId.values()];
if (titles.length < 60) {
  console.error(`Only ${titles.length} titles — refusing to overwrite catalog.`);
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), region: "IN", titles }, null, 1));
const counts = titles.reduce((a, t) => ((a[t.platform] = (a[t.platform] || 0) + 1), a), {});
console.log(`Wrote ${titles.length} titles to catalog.json`, counts);
console.log(`With trailers: ${titles.filter((t) => t.trailer).length}, with backdrops: ${titles.filter((t) => t.backdrop).length}`);
