import { ratingStars } from "../lib.js";

export default function Card({ title: t, onSelect, myList, onToggleList }) {
  const inList = myList.includes(t.id);
  return (
    <div className="card" onClick={() => onSelect(t)}>
      <div className="card-poster-wrap">
        <img className="card-poster" src={t.poster} alt={t.title} loading="lazy" />
        <span className="card-free">FREE</span>
        <span className="card-play">▶</span>
      </div>
      <div className="card-hover">
        <div className="card-title">{t.title}</div>
        <div className="card-meta">
          {t.rating && <span className="imdb">{ratingStars(t.rating)}</span>}
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
