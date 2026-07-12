import { useEffect } from "react";
import { scoreLabel, watchOptions, primaryAction, providerLogo } from "../lib.js";

const KIND_LABEL = { free: "Free", sub: "Subscription", rent: "Rent", buy: "Buy" };

export default function DetailModal({ title: t, region, onClose, onPlay, inList, onToggleList }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const groups = watchOptions(t, region);
  const action = primaryAction(t, region);
  const handlePrimary = () => {
    if (action.mode === "play") onPlay(t);
    else if (action.mode === "link") window.open(action.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-hero" style={{ backgroundImage: `url(${t.backdrop})` }}>
          <div className="modal-hero-shade" />
          <h2 className="modal-title">{t.title}</h2>
          {action.mode !== "none" && (
            <button className="modal-hero-play" onClick={handlePrimary}>{action.label}</button>
          )}
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            {t.playable && <span className="hero-badge">▶ Free</span>}
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

          <div className="wtw">
            <h3 className="wtw-title">Where to watch</h3>
            {t.playable && (
              <div className="wtw-group">
                <span className="wtw-kind free">Free · plays here</span>
                <button className="wtw-chip free" onClick={() => onPlay(t)}>▶ Internet Archive</button>
              </div>
            )}
            {groups.map((g) => (
              <div className="wtw-group" key={g.kind}>
                <span className={"wtw-kind " + g.kind}>{KIND_LABEL[g.kind]}</span>
                <div className="wtw-chips">
                  {g.offers.map((o, n) => (
                    <a key={g.kind + n} className={"wtw-chip " + g.kind} href={o.url} target="_blank" rel="noreferrer">
                      {providerLogo(o.provider) && (
                        <img className="wtw-logo" src={providerLogo(o.provider)} alt="" loading="lazy" />
                      )}
                      {o.provider}
                      {region === "all" && <span className="wtw-region">{o.region}</span>}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {!t.playable && groups.length === 0 && (
              <p className="modal-note">No streaming option found for this title in your region yet.</p>
            )}
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onToggleList}>
              {inList ? "✓ In My List" : "+ My List"}
            </button>
          </div>
          <p className="modal-note">
            {t.playable
              ? "Plays free in your browser from the Internet Archive — no account, ever."
              : "NeoStream links you to where this is watchable — free options first. Playback happens on the provider."}
          </p>
        </div>
      </div>
    </div>
  );
}
