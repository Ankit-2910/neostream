import { useRef } from "react";
import Card from "./Card.jsx";

export default function Row({ label, items, ...rest }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.9, behavior: "smooth" });

  return (
    <section className="row">
      <h2 className="row-label">{label}</h2>
      <div className="row-wrap">
        <button className="row-arrow left" onClick={() => scroll(-1)} aria-label="Scroll left">‹</button>
        <div className="row-scroller" ref={ref}>
          {items.map((t) => (
            <Card key={t.id} title={t} {...rest} />
          ))}
        </div>
        <button className="row-arrow right" onClick={() => scroll(1)} aria-label="Scroll right">›</button>
      </div>
    </section>
  );
}
