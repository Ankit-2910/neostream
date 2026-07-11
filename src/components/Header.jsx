import { useEffect, useState } from "react";
import { PLATFORMS } from "../lib.js";

const NAV = [
  ["home", "Home"],
  ["movies", "Movies"],
  ["shows", "TV Shows"],
  ["mylist", "My List"],
];

export default function Header({ profile, nav, onNav, platform, onPlatform, query, onQuery, onSwitchProfile }) {
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
        <div className="platform-pills">
          <button className={platform === "all" ? "pill active" : "pill"} onClick={() => onPlatform("all")}>
            All
          </button>
          {Object.entries(PLATFORMS).map(([key, p]) => (
            <button
              key={key}
              className={platform === key ? "pill active" : "pill"}
              style={platform === key ? { borderColor: p.color, color: "#fff", background: p.color + "33" } : {}}
              onClick={() => onPlatform(key)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <input
          className="search"
          placeholder="Search titles…"
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
