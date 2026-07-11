import { useEffect } from "react";

// Real in-browser playback. Internet Archive's embed player streams the actual
// public-domain video file — no login, no key, legal forever.
export default function Player({ title: t, onClose }) {
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
    <div className="player-backdrop" onClick={onClose}>
      <div className="player" onClick={(e) => e.stopPropagation()}>
        <div className="player-bar">
          <span className="player-title">{t.title}{t.year ? ` (${t.year})` : ""}</span>
          <div className="player-bar-right">
            <a className="player-ext" href={t.watchUrl} target="_blank" rel="noreferrer">Open on Archive ↗</a>
            <button className="player-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>
        <div className="player-frame">
          <iframe
            src={t.embed}
            title={t.title}
            allow="autoplay; fullscreen"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
}
