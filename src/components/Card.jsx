import { PLATFORMS } from "../lib.js";

export default function Card({ title: t, onSelect, myList, onToggleList }) {
  const p = PLATFORMS[t.platform];
  const inList = myList.includes(t.id);
  return (
    <div className="card" onClick={() => onSelect(t)}>
      <img className="card-poster" src={t.poster} alt={t.title} loading="lazy" />
      <span className="card-platform" style={{ background: p.color }} title={p.name}>
        {p.short}
      </span>
      <div className="card-hover">
        <div className="card-title">{t.title}</div>
        <div className="card-meta">
          {t.imdb && <span className="imdb">★ {t.imdb.toFixed(1)}</span>}
          <span>{t.year}</span>
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
