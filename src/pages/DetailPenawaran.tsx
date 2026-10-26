import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Nav } from "../components/Nav";
import { getPenawaranById, klaimPenawaran } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Penawaran } from "../lib/firebase";

export default function DetailPenawaran() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState<Penawaran | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPenawaranById(id).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [id]);

  async function handleKlaim() {
    if (!user) {
      nav("/login");
      return;
    }
    if (!data || !id) return;
    setProcessing(true);
    try {
      await klaimPenawaran(id, data, user.nama);
      setMsg("✅ Klaim berhasil! Pemberi telah dinotifikasi.");
      setData({ ...data, status: "Terpakai" });
    } catch (e: any) {
      setMsg("❌ Gagal: " + e.message);
    }
    setProcessing(false);
  }

  return (
    <div className="site-shell">
      <Nav />
      <div style={{ padding: "60px 6.5%", minHeight: "80vh", maxWidth: 900, margin: "0 auto" }}>
        <Link to="/penawaran" style={{ fontSize: 13, opacity: 0.6, textDecoration: "none" }}>
          ← Kembali ke daftar penawaran
        </Link>

        {loading && <p style={{ marginTop: 40 }}>Memuat…</p>}
        {!loading && !data && (
          <div style={{ marginTop: 40, padding: 40, background: "var(--cream)", borderRadius: 20, textAlign: "center" }}>
            <p style={{ fontSize: 40 }}>🔍</p>
            <p>Penawaran tidak ditemukan.</p>
          </div>
        )}

        {data && (
          <div style={{ marginTop: 30 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <span className="label" style={{ padding: "6px 14px", background: "var(--pale)", borderRadius: 99 }}>
                {data.kategori}
              </span>
              <span className="label" style={{ padding: "6px 14px", background: data.status === "Tersedia" ? "#e7f5ee" : "#fee", borderRadius: 99 }}>
                {data.status}
              </span>
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>{data.judul}</h1>

            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 30, paddingBottom: 24, borderBottom: "1px solid #eee" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f5ddcc", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18 }}>{data.pemberi_nama.slice(0, 2).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{data.pemberi_nama}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>Pemberi bantuan</div>
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Detail Bantuan</h3>
            <p style={{ lineHeight: 1.7, opacity: 0.8, marginBottom: 30 }}>{data.deskripsi}</p>

            {msg && <p style={{ marginBottom: 16, padding: 14, background: msg.startsWith("✅") ? "#e7f5ee" : "#fee", borderRadius: 10, fontSize: 14 }}>{msg}</p>}

            {data.status === "Tersedia" && (
              <button className="pill pill-dark" style={{ width: "100%", padding: 20, fontSize: 16 }} onClick={handleKlaim} disabled={processing}>
                {processing ? "Memproses…" : "🎁 Klaim bantuan ini"}
              </button>
            )}
            {data.status === "Terpakai" && <div style={{ padding: 20, background: "#fee", borderRadius: 12, textAlign: "center", fontWeight: 700, color: "#c33" }}>⚠️ Penawaran sudah diklaim orang lain</div>}
          </div>
        )}
      </div>
    </div>
  );
}
