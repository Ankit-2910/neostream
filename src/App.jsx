import { useEffect, useMemo, useState } from "react";
import { TITLES, buildRows, pickHeroes, eraTest, loadList, saveList, loadProfile, saveProfile, clearProfile } from "./lib.js";
import ProfileGate from "./components/ProfileGate.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Row from "./components/Row.jsx";
import Grid from "./components/Grid.jsx";
import DetailModal from "./components/DetailModal.jsx";
import Player from "./components/Player.jsx";

export default function App() {
  const [profile, setProfile] = useState(loadProfile);
  const [nav, setNav] = useState("home"); // home | movies | shows | mylist
  const [genre, setGenre] = useState("all");
  const [era, setEra] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [myList, setMyList] = useState(loadList);

  useEffect(() => saveList(myList), [myList]);

  const toggleList = (t) =>
    setMyList((ids) => (ids.includes(t.id) ? ids.filter((i) => i !== t.id) : [...ids, t.id]));

  // In-app titles open the Player; external free titles open the provider in a new tab.
  const play = (t) => {
    if (t.playable) setPlaying(t);
    else window.open(t.watchUrl, "_blank", "noopener,noreferrer");
  };

  const pool = useMemo(() => {
    const test = eraTest(era);
    let ts = TITLES.filter((t) => test(t.year));
    if (genre !== "all") ts = ts.filter((t) => t.genres.includes(genre));
    if (nav === "movies") ts = ts.filter((t) => t.type === "movie");
    if (nav === "shows") ts = ts.filter((t) => t.type === "show");
    return ts;
  }, [genre, era, nav]);

  const searching = query.trim().length > 0;
  const results = useMemo(() => {
    if (!searching) return [];
    const q = query.trim().toLowerCase();
    return pool.filter((t) => t.title.toLowerCase().includes(q));
  }, [query, pool, searching]);

  const rows = useMemo(() => buildRows(pool), [pool]);
  const heroes = useMemo(() => pickHeroes(pool), [pool]);
  const listItems = useMemo(() => TITLES.filter((t) => myList.includes(t.id)), [myList]);

  if (!profile) return <ProfileGate onPick={(p) => (saveProfile(p), setProfile(p))} />;

  const common = { onSelect: setSelected, onPlay: play, myList, onToggleList: toggleList };

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
      ) : rows.length === 0 ? (
        <Grid title="Nothing here" items={[]} empty="No titles match these filters. Try widening the year or genre." {...common} />
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
          Free & legal streaming. Classics play in-app (Internet Archive); modern titles open free
          with ads on Tubi, Roku, Sony LIV & more. No subscription, ever.
        </span>
      </footer>

      {selected && (
        <DetailModal
          title={selected}
          onClose={() => setSelected(null)}
          onPlay={(t) => (setSelected(null), play(t))}
          inList={myList.includes(selected.id)}
          onToggleList={() => toggleList(selected)}
        />
      )}

      {playing && <Player title={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
