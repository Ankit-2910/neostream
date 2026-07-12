import { useEffect } from "react";
import { scoreLabel } from "../lib.js";

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

  const regions = t.regions?.length ? t.regions.join(" / ") : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-hero" style={{ backgroundImage: `url(${t.backdrop})` }}>
          <div className="modal-hero-shade" />
          <h2 className="modal-title">{t.title}</h2>
          <button className="modal-hero-play" onClick={() => onPlay(t)}>
            {t.playable ? "▶ Play" : "▶ Watch Free"}
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            <span className="hero-badge">{t.playable ? "▶ Free" : "↗ Free"}</span>
            {scoreLabel(t) && <span className="imdb">{scoreLabel(t)}</span>}
            {t.year && <span>{t.year}</span>}
            <span className="cap">{t.type === "movie" ? "Movie" : "Series"}</span>
          </div>
          <p className="modal-overview">{t.overview || "No synopsis available."}</p>
          <div className="modal-genres">
            {t.genres.map((g) => (
              <span key={g} className="genre-chip">{g}</span>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn btn-play" onClick={() => onPlay(t)}>
              {t.playable ? "▶ Play Now" : `▶ Watch Free on ${t.provider}`}
            </button>
            <button className="btn btn-ghost" onClick={onToggleList}>
              {inList ? "✓ In My List" : "+ My List"}
            </button>
          </div>
          {t.playable ? (
            <p className="modal-note">Streams free & legally in your browser from the Internet Archive — no account, ever.</p>
          ) : (
            <p className="modal-note">
              Free (ad-supported) on <b>{t.offers.map((o) => o.provider).filter((v, i, a) => a.indexOf(v) === i).join(", ")}</b>
              {regions ? ` · available in ${regions}` : ""}. Opens on the provider — no subscription needed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
