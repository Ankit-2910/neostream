import { scoreLabel, badgeFor, providerLogo } from "../lib.js";

export default function Card({ title: t, region, onSelect, myList, onToggleList }) {
  const inList = myList.includes(t.id);
  const badge = badgeFor(t, region);
  const logo = badge.provider ? providerLogo(badge.provider) : null;
  return (
    <div className="card" onClick={() => onSelect(t)}>
      <div className="card-poster-wrap">
        <img className="card-poster" src={t.poster} alt={t.title} loading="lazy" />
        <span className={"card-free " + badge.cls} title={badge.provider ? `${badge.text} · ${badge.provider}` : t.title}>
          {logo && <img className="card-free-logo" src={logo} alt="" loading="lazy" />}
          {badge.text}
        </span>
        <span className="card-play">{t.playable ? "▶" : "↗"}</span>
      </div>
      <div className="card-hover">
        <div className="card-title">{t.title}</div>
        <div className="card-meta">
          {scoreLabel(t) && <span className="imdb">{scoreLabel(t)}</span>}
          {t.year && <span>{t.year}</span>}
        </div>
        <button
          className="card-add"
          title={inList ? "Remove from My List" : "Add to My List"}
          onClick={(e) => (e.stopPropagation(), onToggleList(t))}
        >
          {inList ? "✓" : "+"}
        </button>
      </div>
    </div>
  );
}
