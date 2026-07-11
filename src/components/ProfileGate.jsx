const PROFILES = [
  { name: "Ankit", hue: 355 },
  { name: "Family", hue: 265 },
  { name: "Guest", hue: 195 },
  { name: "Kids", hue: 45 },
];

export default function ProfileGate({ onPick }) {
  return (
    <div className="gate">
      <div className="gate-logo">NEOSTREAM</div>
      <div className="gate-tag">Netflix · Prime Video · JioHotstar — one home.</div>
      <h1>Who’s watching?</h1>
      <div className="gate-profiles">
        {PROFILES.map((p) => (
          <button key={p.name} className="gate-profile" onClick={() => onPick(p)}>
            <span
              className="avatar"
              style={{ background: `linear-gradient(135deg, hsl(${p.hue} 85% 55%), hsl(${p.hue + 60} 80% 45%))` }}
            >
              {p.name[0]}
            </span>
            <span className="gate-name">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
