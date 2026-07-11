import { useEffect, useState } from "react";
import { PLATFORMS, genreNames } from "../lib.js";

export default function Hero({ heroes, onSelect, myList, onToggleList }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % heroes.length), 7000);
    return () => clearInterval(id);
  }, [heroes.length]);

  const t = heroes[Math.min(i, heroes.length - 1)];
  const p = PLATFORMS[t.platform];
  const inList = myList.includes(t.id);

  return (
    <section className="hero">
      {/* Only current + outgoing layers stay mounted — a full stack of 1440px
          composited layers can freeze the GPU on weaker machines */}
      {heroes.map((h, n) =>
        n === i || n === (i + heroes.length - 1) % heroes.length ? (
          <div
            key={h.id}
            className={"hero-bg" + (n === i ? " on" : "")}
            style={{ backgroundImage: `url(${h.backdrop})` }}
          />
        ) : null
      )}
      <div className="hero-shade" />
      <div className="hero-content" key={t.id}>
        <span className="hero-badge" style={{ background: p.color }}>
          {p.name}
        </span>
        <h1 className="hero-title">{t.title}</h1>
        <div className="hero-meta">
          {t.imdb && <span className="imdb">★ {t.imdb.toFixed(1)}</span>}
          <span>{t.year}</span>
          <span className="cap">{t.type === "movie" ? "Movie" : "Series"}</span>
          <span className="dim">{genreNames(t).slice(0, 3).join(" · ")}</span>
        </div>
        <p className="hero-overview">{t.overview}</p>
        <div className="hero-actions">
          <a className="btn btn-play" href={t.watchUrl} target="_blank" rel="noreferrer">
            ▶ Watch on {p.name}
          </a>
          <button className="btn btn-ghost" onClick={() => onSelect(t)}>
            ⓘ More Info
          </button>
          <button className="btn btn-ghost round" title={inList ? "Remove from My List" : "Add to My List"} onClick={() => onToggleList(t)}>
            {inList ? "✓" : "+"}
          </button>
        </div>
      </div>
      <div className="hero-dots">
        {heroes.map((_, n) => (
          <button key={n} className={n === i ? "dot on" : "dot"} onClick={() => setI(n)} />
        ))}
      </div>
    </section>
  );
}
