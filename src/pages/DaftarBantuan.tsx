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
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 10 }}>Pengajuan Bantuan</h1>
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
          <div style={{ padding: 60, textAlign: "center", background: "var(--cream)", borderRadius: 20 }}>
            <p style={{ fontSize: 48, marginBottom: 10 }}>🤝</p>
            <p style={{ opacity: 0.6, marginBottom: 20 }}>Belum ada bantuan terverifikasi.</p>
            <Link to="/ajukan">
              <button className="pill pill-orange">Ajukan sekarang</button>
            </Link>
          </div>
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
                <Link to={`/bantuan/${p.id}`}>
                  <button className="help-btn">
                    Bantu sekarang <span style={{ marginLeft: 6 }}>→</span>
                  </button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
