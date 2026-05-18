export default function StatusBar({ health, onRefresh, compact }) {
  const dot = (status) => (
    <span className={`status-dot ${status === "ok" ? "ok" : "error"}`} />
  );

  if (compact) {
    return (
      <div className="status-bar-compact">
        <div className="status-compact-grid">
          <div className="status-compact-line">
            {dot(health?.backend)} <span>Backend</span>
            {dot(health?.ollama)} <span>AI</span>
          </div>
          <div className="status-compact-line">
            {dot(health?.validatore)} <span>Validatore</span>
            {dot(health?.rdf)} <span>RDF</span>
          </div>
          <div className="status-compact-line">
            {dot(health?.guardrail)} <span>Guardrail</span>
          </div>
        </div>
        <button className="refresh-btn-compact" onClick={onRefresh} title="Aggiorna stato" aria-label="Aggiorna stato"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
      </div>
    );
  }

  return (
    <div className="status-bar">
      <div className="status-row">{dot(health?.backend)} <span>Backend</span></div>
      <div className="status-row">{dot(health?.ollama)} <span>AI</span></div>
      <div className="status-row">{dot(health?.validatore)} <span>Validatore</span></div>
      <div className="status-row">{dot(health?.rdf)} <span>RDF</span></div>
      <div className="status-row">{dot(health?.guardrail)} <span>Guardrail</span></div>
      <button className="refresh-btn" onClick={onRefresh} title="Aggiorna stato">↻</button>
    </div>
  );
}
