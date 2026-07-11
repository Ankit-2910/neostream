import { useEffect, useMemo, useState } from "react";
import { TITLES, PLATFORMS, buildRows, pickHeroes, loadList, saveList, loadProfile, saveProfile, clearProfile } from "./lib.js";
import ProfileGate from "./components/ProfileGate.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Row from "./components/Row.jsx";
import Grid from "./components/Grid.jsx";
import DetailModal from "./components/DetailModal.jsx";

export default function App() {
  const [profile, setProfile] = useState(loadProfile);
  const [nav, setNav] = useState("home"); // home | movies | shows | mylist
  const [platform, setPlatform] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [myList, setMyList] = useState(loadList);

  useEffect(() => saveList(myList), [myList]);

  const toggleList = (t) =>
    setMyList((ids) => (ids.includes(t.id) ? ids.filter((i) => i !== t.id) : [...ids, t.id]));

  const pool = useMemo(() => {
    let ts = TITLES;
    if (platform !== "all") ts = ts.filter((t) => t.platform === platform);
    if (nav === "movies") ts = ts.filter((t) => t.type === "movie");
    if (nav === "shows") ts = ts.filter((t) => t.type === "show");
    return ts;
  }, [platform, nav]);

  const searching = query.trim().length > 0;
  const results = useMemo(() => {
    if (!searching) return [];
    const q = query.trim().toLowerCase();
    return pool.filter((t) => t.title.toLowerCase().includes(q));
  }, [query, pool, searching]);

  const rows = useMemo(() => buildRows(pool), [pool]);
  const heroes = useMemo(() => pickHeroes(pool), [pool]);
  const listItems = useMemo(() => TITLES.filter((t) => myList.includes(t.id)), [myList]);

  if (!profile)
    return <ProfileGate onPick={(p) => (saveProfile(p), setProfile(p))} />;

  const common = { onSelect: setSelected, myList, onToggleList: toggleList };

  return (
    <div className="app">
      <Header
        profile={profile}
        nav={nav}
        onNav={(n) => (setNav(n), setQuery(""))}
        platform={platform}
        onPlatform={setPlatform}
        query={query}
        onQuery={setQuery}
        onSwitchProfile={() => (clearProfile(), setProfile(null))}
      />

      {searching ? (
        <Grid title={`Results for “${query.trim()}”`} items={results} {...common} />
      ) : nav === "mylist" ? (
        <Grid
          title="My List"
          items={listItems}
          empty="Your list is empty. Hover any title and hit + to save it here."
          {...common}
        />
      ) : (
        <>
          {heroes.length > 0 && <Hero heroes={heroes} {...common} />}
          <main className="rows">
            {rows.map((r) => (
              <Row key={r.key} label={r.label} items={r.items} {...common} />
            ))}
          </main>
        </>
      )}

      <footer className="footer">
        <span className="brand-mini">NEOSTREAM</span>
        <span>
          One home for {Object.values(PLATFORMS).map((p) => p.name).join(" · ")}. Catalog via JustWatch —
          playback happens on each platform.
        </span>
      </footer>

      {selected && (
        <DetailModal
          title={selected}
          onClose={() => setSelected(null)}
          inList={myList.includes(selected.id)}
          onToggleList={() => toggleList(selected)}
        />
      )}
    </div>
  );
}
