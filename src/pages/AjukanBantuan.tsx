import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "../components/Nav";
import { useAuth } from "../lib/auth";
import { createPengajuan } from "../lib/api";

export default function AjukanBantuan() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    judul: "",
    kategori: "Pendidikan" as const,
    deskripsi: "",
    urgensi: "sedang" as const,
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await createPengajuan({
        pengaju_id: user.id,
        pengaju_nama: user.nama,
        pengaju_fakultas: user.fakultas,
        judul: form.judul,
        kategori: form.kategori,
        deskripsi: form.deskripsi,
        urgensi: form.urgensi,
      });
      setMsg("✅ Pengajuan terkirim! Menunggu verifikasi.");
      setTimeout(() => nav("/bantuan"), 1400);
    } catch (err: any) {
      setMsg("❌ Gagal: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="site-shell">
      <Nav />
      <div style={{ minHeight: "80vh", background: "var(--cream)", padding: "50px 20px", display: "flex", justifyContent: "center" }}>
        <form onSubmit={submit} style={{ background: "white", padding: 40, borderRadius: 26, width: "100%", maxWidth: 620, boxShadow: "0 20px 60px rgba(0,0,0,.08)" }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Ajukan Bantuan</h1>
          <p style={{ fontSize: 13, opacity: 0.65, marginBottom: 24 }}>Ceritakan kebutuhanmu. Setiap pengajuan diverifikasi tim.</p>
          {msg && <p style={{ fontSize: 13, marginBottom: 16, padding: 12, background: "#eef", borderRadius: 10 }}>{msg}</p>}

          <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Judul</label>
          <input
            required
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            placeholder="Contoh: Buku Referensi Teknik Sipil"
            style={{ width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}
          />

          <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Kategori</label>
          <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value as any })} style={{ width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <option>Pendidikan</option>
            <option>Kebutuhan</option>
            <option>Kesehatan</option>
            <option>Lainnya</option>
          </select>

          <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Deskripsi</label>
          <textarea
            required
            rows={5}
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            placeholder="Jelaskan detail kebutuhan bantuan…"
            style={{ width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}
          />

          <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Urgensi</label>
          <select value={form.urgensi} onChange={(e) => setForm({ ...form, urgensi: e.target.value as any })} style={{ width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 20 }}>
            <option value="rendah">Rendah</option>
            <option value="sedang">Sedang</option>
            <option value="tinggi">Tinggi (mendesak)</option>
          </select>

          <button className="pill pill-orange" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Mengirim…" : "Kirim pengajuan"}
          </button>
        </form>
      </div>
    </div>
  );
}
