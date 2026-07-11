import Card from "./Card.jsx";

export default function Grid({ title, items, empty, ...rest }) {
  return (
    <main className="grid-page">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="grid-empty">{empty || "Nothing found. Try a different search or platform filter."}</p>
      ) : (
        <div className="grid">
          {items.map((t) => (
            <Card key={t.id} title={t} {...rest} />
          ))}
        </div>
      )}
    </main>
  );
}
