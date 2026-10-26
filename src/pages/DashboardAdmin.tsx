import { useEffect, useState } from "react";
import { Nav } from "../components/Nav";
import { listPengajuanAll, listPenawaran } from "../lib/api";
import type { Pengajuan, Penawaran } from "../lib/firebase";

export default function DashboardAdmin() {
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
  const [penawaran, setPenawaran] = useState<Penawaran[]>([]);

  useEffect(() => {
    listPengajuanAll().then(setPengajuan);
    listPenawaran().then(setPenawaran);
  }, []);

  const stats = [
    { label: "Total Pengajuan", value: pengajuan.length },
    { label: "Terverifikasi", value: pengajuan.filter((p) => p.status === "Terverifikasi").length },
    { label: "Menunggu Verifikasi", value: pengajuan.filter((p) => p.status === "Menunggu verifikasi").length },
    { label: "Total Penawaran", value: penawaran.length },
  ];

  return (
    <div className="site-shell">
      <Nav />
      <div style={{ padding: "50px 6.5%", minHeight: "80vh" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Dashboard Admin</h1>
        <p style={{ opacity: 0.65, marginBottom: 30 }}>Ringkasan aktivitas platform.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Pengajuan Terbaru</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {pengajuan.slice(0, 10).map((p) => (
            <div key={p.id} style={{ background: "white", padding: 14, borderRadius: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <b style={{ fontSize: 14 }}>{p.judul}</b>
                <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 8 }}>
                  {p.pengaju_nama} • {p.kategori}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: "var(--pale)" }}>{p.status}</span>
            </div>
          ))}
          {pengajuan.length === 0 && <p style={{ opacity: 0.5 }}>Belum ada pengajuan.</p>}
        </div>
      </div>
    </div>
  );
}
