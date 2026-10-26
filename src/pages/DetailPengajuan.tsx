import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Nav } from "../components/Nav";
import { getPengajuanById, ambilBantuan } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Pengajuan } from "../lib/firebase";

export default function DetailPengajuan() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState<Pengajuan | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPengajuanById(id).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [id]);

  async function handleAmbil() {
    if (!user) {
      nav("/login");
      return;
    }
    if (!data || !id) return;
    setProcessing(true);
    try {
      await ambilBantuan(id, data, user.nama);
      setMsg("✅ Kamu akan membantu! Pengaju telah dinotifikasi.");
      setData({ ...data, status: "Selesai" });
    } catch (e: any) {
      setMsg("❌ Gagal: " + e.message);
    }
    setProcessing(false);
  }

  return (
    <div className="site-shell">
      <Nav />
      <div style={{ padding: "60px 6.5%", minHeight: "80vh", maxWidth: 900, margin: "0 auto" }}>
        <Link to="/bantuan" style={{ fontSize: 13, opacity: 0.6, textDecoration: "none" }}>
          ← Kembali ke daftar bantuan
        </Link>

        {loading && <p style={{ marginTop: 40 }}>Memuat…</p>}
        {!loading && !data && (
          <div style={{ marginTop: 40, padding: 40, background: "var(--cream)", borderRadius: 20, textAlign: "center" }}>
            <p style={{ fontSize: 40 }}>🔍</p>
            <p>Pengajuan tidak ditemukan.</p>
          </div>
        )}

        {data && (
          <div style={{ marginTop: 30 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <span className="label" style={{ padding: "6px 14px", background: "var(--pale)", borderRadius: 99 }}>
                {data.kategori}
              </span>
              {data.urgensi === "tinggi" && (
                <span className="label" style={{ padding: "6px 14px", background: "#fee", color: "#c33", borderRadius: 99 }}>
                  MENDESAK
                </span>
              )}
              <span className="label" style={{ padding: "6px 14px", background: "#eef", borderRadius: 99 }}>
                {data.status}
              </span>
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>{data.judul}</h1>

            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 30, paddingBottom: 24, borderBottom: "1px solid #eee" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--pale)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18 }}>{data.pengaju_nama.slice(0, 2).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{data.pengaju_nama}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>{data.pengaju_fakultas || "Universitas Mulawarman"}</div>
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Deskripsi Kebutuhan</h3>
            <p style={{ lineHeight: 1.7, opacity: 0.8, marginBottom: 30 }}>{data.deskripsi}</p>

            <div style={{ background: "var(--cream)", padding: 24, borderRadius: 16, marginBottom: 30 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Tingkat Urgensi</h3>
              <p style={{ fontSize: 16, textTransform: "capitalize" }}>{data.urgensi}</p>
            </div>

            {msg && <p style={{ marginBottom: 16, padding: 14, background: msg.startsWith("✅") ? "#e7f5ee" : "#fee", borderRadius: 10, fontSize: 14 }}>{msg}</p>}

            {data.status === "Terverifikasi" && (
              <button className="pill pill-orange" style={{ width: "100%", padding: 20, fontSize: 16 }} onClick={handleAmbil} disabled={processing}>
                {processing ? "Memproses…" : "🤝 Saya ingin membantu"}
              </button>
            )}
            {data.status === "Selesai" && <div style={{ padding: 20, background: "#e7f5ee", borderRadius: 12, textAlign: "center", fontWeight: 700, color: "#2a7" }}>✅ Bantuan sudah diambil</div>}
          </div>
        )}
      </div>
    </div>
  );
}
