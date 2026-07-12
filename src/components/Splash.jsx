export default function Splash({ error }) {
  return (
    <div className="splash">
      <div className="splash-logo">NEOSTREAM</div>
      {error ? (
        <p className="splash-msg">Couldn’t load the catalog. Check your connection and refresh.</p>
      ) : (
        <>
          <div className="splash-spinner" />
          <p className="splash-msg">Loading thousands of free titles…</p>
        </>
      )}
    </div>
  );
}
