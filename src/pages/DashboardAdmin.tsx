import { useEffect, useState } from "react";
import { Nav } from "../components/Nav";
import { listPengajuanAll, listPenawaran } from "../lib/api";
import type { Pengajuan, Penawaran } from "../lib/firebase";

export default function DashboardAdmin() {
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
  const [penawaran, setPenawaran] = useState<Penawaran[]>([]);
  const [tab, setTab] = useState<"pengajuan" | "penawaran">("pengajuan");

  useEffect(() => {
    listPengajuanAll().then(setPengajuan);
    listPenawaran().then(setPenawaran);
  }, []);

  const stats = [
    { label: "Total Pengajuan", value: pengajuan.length, color: "var(--pale)" },
    { label: "Terverifikasi", value: pengajuan.filter((p) => p.status === "Terverifikasi").length, color: "#e7f5ee" },
    { label: "Menunggu Verifikasi", value: pengajuan.filter((p) => p.status === "Menunggu verifikasi").length, color: "#f5ddcc" },
    { label: "Total Penawaran", value: penawaran.length, color: "#eef" },
  ];

  return (
    <div className="site-shell">
      <Nav />
      <div style={{ padding: "50px 6.5%", minHeight: "80vh" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Dashboard Admin</h1>
        <p style={{ opacity: 0.65, marginBottom: 30 }}>Ringkasan aktivitas platform.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: s.color, padding: 24, borderRadius: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            className={`filter-row`}
            onClick={() => setTab("pengajuan")}
            style={{
              padding: "10px 20px",
              borderRadius: 30,
              border: "1px solid var(--line)",
              background: tab === "pengajuan" ? "var(--deep)" : "white",
              color: tab === "pengajuan" ? "white" : "var(--ink)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📋 Pengajuan ({pengajuan.length})
          </button>
          <button
            onClick={() => setTab("penawaran")}
            style={{
              padding: "10px 20px",
              borderRadius: 30,
              border: "1px solid var(--line)",
              background: tab === "penawaran" ? "var(--deep)" : "white",
              color: tab === "penawaran" ? "white" : "var(--ink)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🎁 Penawaran ({penawaran.length})
          </button>
        </div>

        {tab === "pengajuan" && (
          <div style={{ display: "grid", gap: 10 }}>
            {pengajuan.map((p) => (
              <div key={p.id} style={{ background: "white", padding: 16, borderRadius: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, border: "1px solid #eee" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <b style={{ fontSize: 14 }}>{p.judul}</b>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    {p.pengaju_nama} • {p.kategori} • {p.pengaju_fakultas || "-"}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 99, background: "var(--pale)", height: "fit-content" }}>{p.status}</span>
              </div>
            ))}
            {pengajuan.length === 0 && <p style={{ opacity: 0.5 }}>Belum ada pengajuan.</p>}
          </div>
        )}

        {tab === "penawaran" && (
          <div style={{ display: "grid", gap: 10 }}>
            {penawaran.map((p) => (
              <div key={p.id} style={{ background: "white", padding: 16, borderRadius: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, border: "1px solid #eee" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <b style={{ fontSize: 14 }}>{p.judul}</b>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    {p.pemberi_nama} • {p.kategori}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 99, background: p.status === "Tersedia" ? "#e7f5ee" : "#fee", height: "fit-content" }}>{p.status}</span>
              </div>
            ))}
            {penawaran.length === 0 && <p style={{ opacity: 0.5 }}>Belum ada penawaran.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
