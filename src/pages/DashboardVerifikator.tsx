import { useEffect, useState } from "react";
import { Nav } from "../components/Nav";
import { listPengajuanAll, updateStatusPengajuan, kirimNotif } from "../lib/api";
import type { Pengajuan } from "../lib/firebase";

export default function DashboardVerifikator() {
  const [list, setList] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await listPengajuanAll();
    setList(data);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function decide(p: Pengajuan, status: "Terverifikasi" | "Ditolak") {
    if (!p.id) return;
    await updateStatusPengajuan(p.id, status);
    await kirimNotif(p.pengaju_id, `Pengajuan "${p.judul}" telah ${status.toLowerCase()}.`);
    load();
  }

  const pending = list.filter((p) => p.status === "Menunggu verifikasi");
  const decided = list.filter((p) => p.status !== "Menunggu verifikasi");

  return (
    <div className="site-shell">
      <Nav />
      <div style={{ padding: "50px 6.5%", minHeight: "80vh" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Dashboard Verifikator</h1>
        <p style={{ opacity: 0.65, marginBottom: 30 }}>Tinjau pengajuan dari mahasiswa.</p>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Menunggu Verifikasi ({pending.length})</h2>
        {loading && <p>Memuat…</p>}
        {!loading && pending.length === 0 && <p style={{ opacity: 0.5, marginBottom: 30 }}>Tidak ada pengajuan baru. 👍</p>}
        <div style={{ display: "grid", gap: 14, marginBottom: 40 }}>
          {pending.map((p) => (
            <div key={p.id} style={{ background: "white", padding: 20, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,.06)", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ fontWeight: 700, fontSize: 17 }}>{p.judul}</h3>
                <p style={{ fontSize: 12, opacity: 0.7 }}>
                  {p.pengaju_nama} • {p.pengaju_fakultas || "-"} • {p.kategori}
                </p>
                <p style={{ fontSize: 13, marginTop: 8 }}>{p.deskripsi}</p>
                <span style={{ display: "inline-block", marginTop: 10, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: "var(--pale)" }}>Urgensi: {p.urgensi}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => decide(p, "Terverifikasi")} className="pill pill-dark" style={{ fontSize: 13 }}>
                  Setujui
                </button>
                <button onClick={() => decide(p, "Ditolak")} style={{ padding: "12px 20px", borderRadius: 99, background: "#fee", color: "#c33", fontWeight: 700, border: 0, fontSize: 13 }}>
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Sudah Diputuskan ({decided.length})</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {decided.map((p) => (
            <div key={p.id} style={{ background: "#fafafa", padding: 14, borderRadius: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <b style={{ fontSize: 14 }}>{p.judul}</b>
                <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 8 }}>{p.pengaju_nama}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: p.status === "Terverifikasi" ? "#2a7" : "#c33" }}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
