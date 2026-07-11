import { useEffect } from "react";
import { ratingStars, SOURCE_LABEL } from "../lib.js";

export default function DetailModal({ title: t, onClose, onPlay, inList, onToggleList }) {
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
        <div className="modal-hero" style={{ backgroundImage: `url(${t.poster})` }}>
          <div className="modal-hero-shade" />
          <h2 className="modal-title">{t.title}</h2>
          <button className="modal-hero-play" onClick={() => onPlay(t)}>▶ Play</button>
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            <span className="hero-badge">▶ Free</span>
            {t.rating && <span className="imdb">{ratingStars(t.rating)}</span>}
            {t.year && <span>{t.year}</span>}
            <span className="cap">{t.type === "movie" ? "Movie" : "Series"}</span>
          </div>
          <p className="modal-overview">{t.overview || "No synopsis available for this public-domain title."}</p>
          <div className="modal-genres">
            {t.genres.map((g) => (
              <span key={g} className="genre-chip">{g}</span>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn btn-play" onClick={() => onPlay(t)}>▶ Play Now</button>
            <button className="btn btn-ghost" onClick={onToggleList}>
              {inList ? "✓ In My List" : "+ My List"}
            </button>
            <a className="btn btn-ghost" href={t.watchUrl} target="_blank" rel="noreferrer">
              Open on Archive ↗
            </a>
          </div>
          <p className="modal-note">Streams free & legally from {SOURCE_LABEL} — no account, no subscription, ever.</p>
        </div>
      </div>
    </div>
  );
}
