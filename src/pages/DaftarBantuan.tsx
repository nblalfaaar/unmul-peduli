import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Nav } from "../components/Nav";
import { listPengajuanPublik } from "../lib/api";
import type { Pengajuan } from "../lib/firebase";

export default function DaftarBantuan() {
  const [list, setList] = useState<Pengajuan[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPengajuanPublik().then((d) => {
      setList(d);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "Semua" ? list : list.filter((p) => p.kategori === filter);

  return (
    <div className="site-shell">
      <Nav />
      <main style={{ padding: "60px 6.5%", minHeight: "70vh" }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 10 }}>Daftar Bantuan</h1>
        <p style={{ opacity: 0.65, marginBottom: 30 }}>Bantuan yang sudah terverifikasi & siap dibantu.</p>

        <div className="filter-row">
          {["Semua", "Pendidikan", "Kebutuhan", "Kesehatan", "Lainnya"].map((c) => (
            <button key={c} className={filter === c ? "active" : ""} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>

        {loading && <p>Memuat…</p>}
        {!loading && filtered.length === 0 && (
          <p style={{ opacity: 0.5, padding: 40, textAlign: "center" }}>
            Belum ada bantuan terverifikasi.{" "}
            <Link to="/ajukan" style={{ color: "var(--orange)" }}>
              Ajukan sekarang
            </Link>
            .
          </p>
        )}

        <div className="cards-grid">
          {filtered.map((p) => (
            <article key={p.id} className="need-card">
              <div className="card-top mint">
                <span className="category-icon" style={{ fontSize: 30 }}>
                  🤝
                </span>
                {p.urgensi === "tinggi" && (
                  <span className="urgent">
                    <span /> Mendesak
                  </span>
                )}
              </div>
              <div className="card-body">
                <span className="label">{p.kategori}</span>
                <h3>{p.judul}</h3>
                <p>{p.deskripsi}</p>
                <div className="requester">
                  <span>{p.pengaju_nama.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <b>{p.pengaju_nama}</b>
                    <small>{p.pengaju_fakultas || "Universitas Mulawarman"}</small>
                  </div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 8 }}>
                  Status: <b>{p.status}</b>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Link to="/ajukan">
            <button className="pill pill-orange">Ajukan bantuan baru</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
