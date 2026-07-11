import { useEffect, useState } from "react";
import { ratingStars } from "../lib.js";

export default function Hero({ heroes, onPlay, onSelect, myList, onToggleList }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % heroes.length), 7000);
    return () => clearInterval(id);
  }, [heroes.length]);

  const t = heroes[Math.min(i, heroes.length - 1)];
  const inList = myList.includes(t.id);

  return (
    <section className="hero">
      {heroes.map((h, n) =>
        n === i || n === (i + heroes.length - 1) % heroes.length ? (
          <div
            key={h.id}
            className={"hero-bg" + (n === i ? " on" : "")}
            style={{ backgroundImage: `url(${h.poster})` }}
          />
        ) : null
      )}
      <div className="hero-shade" />
      <div className="hero-content" key={t.id}>
        <span className="hero-badge">▶ Free to Stream</span>
        <h1 className="hero-title">{t.title}</h1>
        <div className="hero-meta">
          {t.rating && <span className="imdb">{ratingStars(t.rating)}</span>}
          {t.year && <span>{t.year}</span>}
          <span className="cap">{t.type === "movie" ? "Movie" : "Series"}</span>
          <span className="dim">{t.genres.slice(0, 3).join(" · ")}</span>
        </div>
        <p className="hero-overview">{t.overview}</p>
        <div className="hero-actions">
          <button className="btn btn-play" onClick={() => onPlay(t)}>
            ▶ Play
          </button>
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
