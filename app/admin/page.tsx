"use client";
import { useState, useEffect } from "react";

interface Release { version: string; mac: number; win: number; total: number; }
interface Stats { downloads: Release[]; pageViews: any; }

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(secret)}`);
      if (!res.ok) { setError("Wrong password"); setLoading(false); return; }
      const data = await res.json();
      setStats(data);
      setAuthed(true);
    } catch {
      setError("Failed to load");
    }
    setLoading(false);
  }

  async function refresh() {
    setLoading(true);
    const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(secret)}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }

  const totalDownloads = stats?.downloads.reduce((s, r) => s + r.total, 0) ?? 0;
  const totalMac = stats?.downloads.reduce((s, r) => s + r.mac, 0) ?? 0;
  const totalWin = stats?.downloads.reduce((s, r) => s + r.win, 0) ?? 0;

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 18, padding: 40, width: 380 }}>
          <h1 style={{ color: "#60a5fa", fontWeight: 800, fontSize: 22, marginBottom: 24 }}>Admin Dashboard</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            style={{ width: "100%", background: "#0f1117", border: "1.5px solid #2a2d3a", color: "#f0f0f0", borderRadius: 12, padding: "12px 16px", fontSize: 16, marginBottom: 16, boxSizing: "border-box" }}
          />
          {error && <div style={{ color: "#f87171", fontSize: 14, marginBottom: 12 }}>{error}</div>}
          <button
            onClick={login}
            disabled={loading}
            style={{ width: "100%", background: "#2563eb", border: "none", color: "white", borderRadius: 12, padding: "13px 0", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Loading..." : "Enter"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e8e8e8", padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={{ color: "#60a5fa", fontWeight: 800, fontSize: 26 }}>Admin Dashboard</h1>
          <button onClick={refresh} disabled={loading} style={{ background: "#1e2130", border: "1.5px solid #2a2d3a", color: "#e5e7eb", borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 14 }}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Downloads", value: totalDownloads, color: "#60a5fa" },
            { label: "Mac Downloads", value: totalMac, color: "#34d399" },
            { label: "Windows Downloads", value: totalWin, color: "#a78bfa" },
          ].map(c => (
            <div key={c.label} style={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 16, padding: 24 }}>
              <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>{c.label}</div>
              <div style={{ color: c.color, fontSize: 36, fontWeight: 800 }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Downloads per version */}
        <div style={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Downloads by Version</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#6b7280", fontSize: 13, textAlign: "left" }}>
                <th style={{ padding: "8px 12px" }}>Version</th>
                <th style={{ padding: "8px 12px" }}>Mac</th>
                <th style={{ padding: "8px 12px" }}>Windows</th>
                <th style={{ padding: "8px 12px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats?.downloads.map(r => (
                <tr key={r.version} style={{ borderTop: "1px solid #2a2d3a" }}>
                  <td style={{ padding: "12px 12px", fontWeight: 700, color: "#60a5fa" }}>{r.version}</td>
                  <td style={{ padding: "12px 12px", color: "#34d399" }}>{r.mac}</td>
                  <td style={{ padding: "12px 12px", color: "#a78bfa" }}>{r.win}</td>
                  <td style={{ padding: "12px 12px", fontWeight: 700 }}>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Page views */}
        <div style={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 16, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>Page Views (Last 7 Days)</div>
          {stats?.pageViews ? (
            <pre style={{ color: "#9ca3af", fontSize: 13, overflow: "auto" }}>{JSON.stringify(stats.pageViews, null, 2)}</pre>
          ) : (
            <div style={{ color: "#6b7280", fontSize: 14 }}>
              Page views require <strong style={{ color: "#f59e0b" }}>VERCEL_TOKEN</strong> and <strong style={{ color: "#f59e0b" }}>VERCEL_PROJECT_ID</strong> env vars set in Vercel. Download stats work without them.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
