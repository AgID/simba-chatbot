import { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function AdminPanel() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [blocklist, setBlocklist] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function authHeaders() {
    return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
  }

  function handleAuthFail() {
    setToken(""); setBlocklist([]);
    setLoginError("Sessione scaduta, effettua di nuovo l'accesso.");
  }

  async function doLogin(e) {
    e.preventDefault();
    setLoggingIn(true); setLoginError("");
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setLoginError(data.error || "Accesso non riuscito"); return; }
      setPassword("");
      setToken(data.token);
    } catch (err) { setLoginError(err.message); }
    finally { setLoggingIn(false); }
  }

  useEffect(() => { if (token) fetchBlocklist(); /* eslint-disable-next-line */ }, [token]);

  async function fetchBlocklist() {
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/blocklist`, { headers: authHeaders() });
      if (r.status === 401) return handleAuthFail();
      const data = await r.json();
      setBlocklist(data.blocklist || []);
    } catch (e) { setError("Errore caricamento blocklist: " + e.message); }
  }

  async function addWord(e) {
    e.preventDefault();
    if (!newWord.trim()) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/blocklist`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ word: newWord.trim() }),
      });
      if (r.status === 401) return handleAuthFail();
      const data = await r.json();
      if (!r.ok) { setError(data.error); return; }
      setBlocklist(data.blocklist);
      setNewWord("");
      setSuccess(`"${newWord.trim()}" aggiunta.`);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function removeWord(word) {
    setError(""); setSuccess("");
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/blocklist/${encodeURIComponent(word)}`, { method: "DELETE", headers: authHeaders() });
      if (r.status === 401) return handleAuthFail();
      const data = await r.json();
      if (!r.ok) { setError(data.error); return; }
      setBlocklist(data.blocklist);
      setSuccess(`"${word}" rimossa.`);
    } catch (e) { setError(e.message); }
  }

  const Header = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, borderBottom: "2px solid #0066cc", paddingBottom: 16 }}>
      <a href="https://www.agid.gov.it/it" target="_blank" rel="noopener noreferrer" aria-label="Sito istituzionale AgID (apre in nuova scheda)"><img src="/chatbot/logo-agid.png" alt="AgID — Agenzia per l'Italia Digitale" style={{ height: 36 }} /></a>
      <div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#17324d" }}>SIMBA — Pannello Admin</div>
        <div style={{ fontSize: 13, color: "#5c6f82" }}>Gestione guardrail contenuti</div>
      </div>
    </div>
  );

  if (!token) {
    return (
      <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 20px", fontFamily: "'Titillium Web', sans-serif" }}>
        {Header}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#17324d", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>Accesso amministratore</h2>
        {loginError && <div style={{ background: "#ffeef0", border: "1px solid #f5a6ae", borderRadius: 4, padding: "8px 12px", color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{loginError}</div>}
        <form onSubmit={doLogin} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
          <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="Utente" autoComplete="username"
            style={{ padding: "9px 12px", border: "1px solid #d9e4ef", borderRadius: 4, fontSize: 14, fontFamily: "inherit" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password"
            style={{ padding: "9px 12px", border: "1px solid #d9e4ef", borderRadius: 4, fontSize: 14, fontFamily: "inherit" }} />
          <button type="submit" disabled={loggingIn || !password}
            style={{ padding: "9px 20px", background: "#0066cc", color: "#fff", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            {loggingIn ? "Accesso…" : "Accedi"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 20px", fontFamily: "'Titillium Web', sans-serif" }}>
      {Header}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#17324d", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Blocklist attiva ({blocklist.length} termini)
        </h2>
        <button onClick={() => { setToken(""); setBlocklist([]); }} style={{ background: "none", border: "1px solid #d9e4ef", borderRadius: 4, padding: "4px 12px", cursor: "pointer", fontSize: 13, color: "#5c6f82" }}>Esci</button>
      </div>
      <p style={{ fontSize: 13, color: "#5c6f82", marginBottom: 20 }}>
        Le parole qui sotto vengono bloccate prima che la richiesta raggiunga il motore di ricerca.
      </p>

      {error && <div style={{ background: "#ffeef0", border: "1px solid #f5a6ae", borderRadius: 4, padding: "8px 12px", color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ background: "#eafaf1", border: "1px solid #a9dfbf", borderRadius: 4, padding: "8px 12px", color: "#1e8449", fontSize: 13, marginBottom: 12 }}>{success}</div>}

      <form onSubmit={addWord} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={newWord}
          onChange={e => setNewWord(e.target.value)}
          placeholder="Aggiungi parola da bloccare…"
          style={{ flex: 1, padding: "9px 12px", border: "1px solid #d9e4ef", borderRadius: 4, fontSize: 14, fontFamily: "inherit" }}
        />
        <button type="submit" disabled={loading || !newWord.trim()}
          style={{ padding: "9px 20px", background: "#0066cc", color: "#fff", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          Aggiungi
        </button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {blocklist.sort().map(word => (
          <div key={word} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f6fc", border: "1px solid #cce0f5", borderRadius: 4, padding: "4px 10px" }}>
            <span style={{ fontSize: 13, color: "#17324d", fontFamily: "monospace" }}>{word}</span>
            <button onClick={() => removeWord(word)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b", fontSize: 15, lineHeight: 1, padding: "0 2px" }}
              title={`Rimuovi "${word}"`}>×</button>
          </div>
        ))}
      </div>

      {blocklist.length === 0 && (
        <p style={{ color: "#5c6f82", fontSize: 14, fontStyle: "italic" }}>Nessun termine in blocklist.</p>
      )}
    </div>
  );
}
