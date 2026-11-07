export function AppHeader() {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <div className="brand-copy">
          <p className="brand-name">
            Yap<span>Tier</span>
          </p>
          <p className="brand-tagline">Rank everything. Yap about anything.</p>
        </div>
      </div>
      <span className="sprint-badge">
        <span className="status-dot" aria-hidden="true" />
        Editor · Sprint 1
      </span>
    </header>
  );
}
