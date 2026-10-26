import { useEffect, useState } from "react";
import { Nav } from "../components/Nav";
import { useAuth } from "../lib/auth";
import { listNotifikasi, tandaiNotifDibaca } from "../lib/api";

export default function Notifikasi() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const data = await listNotifikasi(user.id);
    setList(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [user]);

  async function handleRead(id: string) {
    await tandaiNotifDibaca(id);
    load();
  }

  return (
    <div className="site-shell">
      <Nav />
      <div style={{ padding: "60px 6.5%", minHeight: "80vh", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Notifikasi</h1>
        <p style={{ opacity: 0.65, marginBottom: 30 }}>Aktivitas terbaru terkait bantuanmu.</p>

        {loading && <p>Memuat…</p>}
        {!loading && list.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", background: "var(--cream)", borderRadius: 20 }}>
            <p style={{ fontSize: 48, marginBottom: 10 }}>🔔</p>
            <p style={{ opacity: 0.6 }}>Belum ada notifikasi.</p>
          </div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          {list.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.status_baca && handleRead(n.id)}
              style={{
                background: n.status_baca ? "#fafafa" : "white",
                border: n.status_baca ? "1px solid #eee" : "2px solid var(--orange)",
                padding: 18,
                borderRadius: 14,
                cursor: n.status_baca ? "default" : "pointer",
                transition: "all .2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{n.pesan}</p>
                {!n.status_baca && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", flexShrink: 0, marginTop: 8 }} />}
              </div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>{new Date(n.created_at).toLocaleString("id-ID")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
