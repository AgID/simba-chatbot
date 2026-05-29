export default function StatusBar({ health, onRefresh, compact }) {
  // [VA-03] indicatore unico: nessuna topologia per-servizio esposta
  const s = health?.status;
  const cls = s === "ok" ? "ok" : "error";
  const label = s === "ok" ? "Attivo" : (s === "degraded" ? "Degradato" : (s ? "Non disponibile" : "…"));
  const refreshIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
  );
  if (compact) {
    return (
      <div className="status-bar-compact">
        <div className="status-compact-grid">
          <div className="status-compact-line">
            <span className={`status-dot ${cls}`} /> <span>Stato: {label}</span>
          </div>
        </div>
        <button className="refresh-btn-compact" onClick={onRefresh} title="Aggiorna stato" aria-label="Aggiorna stato">{refreshIcon}</button>
      </div>
    );
  }
  return (
    <div className="status-bar">
      <div className="status-row"><span className={`status-dot ${cls}`} /> <span>Stato: {label}</span></div>
      <button className="refresh-btn" onClick={onRefresh} title="Aggiorna stato">↻</button>
    </div>
  );
}
