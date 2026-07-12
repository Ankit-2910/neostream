import { scoreLabel } from "../lib.js";

export default function Card({ title: t, onSelect, myList, onToggleList }) {
  const inList = myList.includes(t.id);
  return (
    <div className="card" onClick={() => onSelect(t)}>
      <div className="card-poster-wrap">
        <img className="card-poster" src={t.poster} alt={t.title} loading="lazy" />
        {t.playable ? (
          <span className="card-free">▶ FREE</span>
        ) : (
          <span className="card-free ext" title={`Free on ${t.provider}`}>↗ {t.provider}</span>
        )}
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
