import { useEffect, useMemo, useState } from "react";
import { TITLES, initCatalog, buildRows, pickHeroes, eraTest, isFreeIn, loadList, saveList, loadProfile, saveProfile, clearProfile } from "./lib.js";
import ProfileGate from "./components/ProfileGate.jsx";
import Splash from "./components/Splash.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Row from "./components/Row.jsx";
import Grid from "./components/Grid.jsx";
import DetailModal from "./components/DetailModal.jsx";
import Player from "./components/Player.jsx";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [profile, setProfile] = useState(loadProfile);
  const [nav, setNav] = useState("home");
  const [genre, setGenre] = useState("all");
  const [era, setEra] = useState("all");
  const [region, setRegion] = useState("IN");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [myList, setMyList] = useState(loadList);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}catalog.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        initCatalog(data);
        setLoaded(true);
      })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => saveList(myList), [myList]);

  const toggleList = (t) =>
    setMyList((ids) => (ids.includes(t.id) ? ids.filter((i) => i !== t.id) : [...ids, t.id]));

  // In-app titles open the Player; everything else opens its best provider link.
  const play = (t) => {
    if (t.playable) return setPlaying(t);
    setSelected(t); // no embed → open the detail modal's "Where to watch"
  };

  const n015 = (t) => (nav === "movies" ? t.type === "movie" : nav === "shows" ? t.type === "show" : true);

  // Browse = free-to-watch only (in-app classics + free/ads modern), filtered.
  const browsePool = useMemo(() => {
    const test = eraTest(era);
    return TITLES.filter(
      (t) => test(t.year) && n015(t) && (genre === "all" || t.genres.includes(genre)) && isFreeIn(t, region)
    );
  }, [genre, era, nav, region, loaded]);

  // Search = universal, across the WHOLE index (free + paid), so you can find
  // where to watch anything, not just the free stuff.
  const searching = query.trim().length > 0;
  const results = useMemo(() => {
    if (!searching) return [];
    const q = query.trim().toLowerCase();
    const test = eraTest(era);
    return TITLES.filter((t) => t.title.toLowerCase().includes(q) && test(t.year) && n015(t))
      .sort((a, b) => {
        // free first, then by score
        const af = isFreeIn(a, region) ? 1 : 0;
        const bf = isFreeIn(b, region) ? 1 : 0;
        if (af !== bf) return bf - af;
        return (b.score || 0) - (a.score || 0);
      })
      .slice(0, 120);
  }, [query, era, nav, region, searching, loaded]);

  const rows = useMemo(() => buildRows(browsePool), [browsePool]);
  const heroes = useMemo(() => pickHeroes(browsePool), [browsePool]);
  const listItems = useMemo(() => TITLES.filter((t) => myList.includes(t.id)), [myList, loaded]);

  if (loadError) return <Splash error />;
  if (!loaded) return <Splash />;
  if (!profile) return <ProfileGate onPick={(p) => (saveProfile(p), setProfile(p))} />;

  const common = { region, onSelect: setSelected, onPlay: play, myList, onToggleList: toggleList };

  return (
    <div className="app">
      <Header
        profile={profile}
        nav={nav}
        onNav={(n) => (setNav(n), setQuery(""))}
        genre={genre}
        onGenre={setGenre}
        era={era}
        onEra={setEra}
        region={region}
        onRegion={setRegion}
        query={query}
        onQuery={setQuery}
        onSwitchProfile={() => (clearProfile(), setProfile(null))}
      />

      {searching ? (
        <Grid title={`Where to watch “${query.trim()}”`} items={results} {...common} />
      ) : nav === "mylist" ? (
        <Grid
          title="My List"
          items={listItems}
          empty="Your list is empty. Hover any title and hit + to save it here."
          {...common}
        />
      ) : rows.length === 0 ? (
        <Grid title="Nothing here" items={[]} empty="No free titles match these filters. Try widening the year, genre, or region." {...common} />
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
          Free & legal streaming, plus a universal “where can I watch it?” search across every
          service. Classics play in-app; everything else links you to the cheapest legal option — free first.
        </span>
      </footer>

      {selected && (
        <DetailModal
          title={selected}
          region={region}
          onClose={() => setSelected(null)}
          onPlay={(t) => (t.playable ? (setSelected(null), setPlaying(t)) : null)}
          inList={myList.includes(selected.id)}
          onToggleList={() => toggleList(selected)}
        />
      )}

      {playing && <Player title={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
