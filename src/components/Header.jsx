import { useEffect, useState } from "react";
import { GENRES, ERAS } from "../lib.js";

const NAV = [
  ["home", "Home"],
  ["movies", "Movies"],
  ["shows", "TV Shows"],
  ["mylist", "My List"],
];

export default function Header({ profile, nav, onNav, genre, onGenre, era, onEra, query, onQuery, onSwitchProfile }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={"header" + (scrolled ? " solid" : "")}>
      <div className="header-left">
        <span className="brand" onClick={() => onNav("home")}>NEOSTREAM</span>
        <nav className="nav">
          {NAV.map(([key, label]) => (
            <button key={key} className={nav === key ? "active" : ""} onClick={() => onNav(key)}>
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className="header-right">
        <div className="era-pills">
          {ERAS.map((e) => (
            <button key={e.key} className={era === e.key ? "pill active" : "pill"} onClick={() => onEra(e.key)}>
              {e.label}
            </button>
          ))}
        </div>
        <select className="genre-select" value={genre} onChange={(e) => onGenre(e.target.value)}>
          <option value="all">All Genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input
          className="search"
          placeholder="Search…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        <button className="profile-chip" title="Switch profile" onClick={onSwitchProfile}>
          <span
            className="avatar sm"
            style={{ background: `linear-gradient(135deg, hsl(${profile.hue} 85% 55%), hsl(${profile.hue + 60} 80% 45%))` }}
          >
            {profile.name[0]}
          </span>
        </button>
      </div>
    </header>
  );
}
