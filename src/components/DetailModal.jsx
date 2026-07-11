import { useEffect } from "react";
import { PLATFORMS, genreNames, trailerUrl } from "../lib.js";

export default function DetailModal({ title: t, onClose, inList, onToggleList }) {
  const p = PLATFORMS[t.platform];

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div
          className="modal-hero"
          style={{ backgroundImage: t.backdrop ? `url(${t.backdrop})` : `url(${t.poster})` }}
        >
          <div className="modal-hero-shade" />
          <h2 className="modal-title">{t.title}</h2>
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            <span className="hero-badge" style={{ background: p.color }}>{p.name}</span>
            {t.imdb && <span className="imdb">★ {t.imdb.toFixed(1)} IMDb</span>}
            <span>{t.year}</span>
            <span className="cap">{t.type === "movie" ? "Movie" : "Series"}</span>
          </div>
          <p className="modal-overview">{t.overview || "No synopsis available."}</p>
          <div className="modal-genres">
            {genreNames(t).map((g) => (
              <span key={g} className="genre-chip">{g}</span>
            ))}
          </div>
          <div className="modal-actions">
            <a className="btn btn-play" href={t.watchUrl} target="_blank" rel="noreferrer">
              ▶ Watch on {p.name}
            </a>
            <a className="btn btn-ghost" href={trailerUrl(t)} target="_blank" rel="noreferrer">
              Trailer
            </a>
            <button className="btn btn-ghost" onClick={onToggleList}>
              {inList ? "✓ In My List" : "+ My List"}
            </button>
          </div>
          <p className="modal-note">Playback opens on {p.name} — your subscription and account stay with them.</p>
        </div>
      </div>
    </div>
  );
}
