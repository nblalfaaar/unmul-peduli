import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Nav } from "../components/Nav";
import { listPenawaran } from "../lib/api";
import type { Penawaran as PenawaranType } from "../lib/firebase";

export default function Penawaran() {
  const [list, setList] = useState<PenawaranType[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPenawaran().then((d) => {
      setList(d.filter((p) => p.status === "Tersedia"));
      setLoading(false);
    });
  }, []);

  const filtered = filter === "Semua" ? list : list.filter((p) => p.kategori === filter);

  return (
    <div className="site-shell">
      <Nav />
      <main style={{ padding: "60px 6.5%", minHeight: "70vh" }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 10 }}>Penawaran Bantuan</h1>
        <p style={{ opacity: 0.65, marginBottom: 30 }}>Bantuan yang ditawarkan mahasiswa. Siapa cepat, dia dapat!</p>

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
            <p style={{ fontSize: 48, marginBottom: 10 }}>🎁</p>
            <p style={{ opacity: 0.6, marginBottom: 20 }}>Belum ada penawaran tersedia.</p>
            <Link to="/tawarkan">
              <button className="pill pill-dark">Jadi yang pertama menawarkan</button>
            </Link>
          </div>
        )}

        <div className="cards-grid">
          {filtered.map((p) => (
            <article key={p.id} className="need-card">
              <div className="card-top peach">
                <span className="category-icon" style={{ fontSize: 30 }}>
                  🎁
                </span>
              </div>
              <div className="card-body">
                <span className="label">{p.kategori}</span>
                <h3>{p.judul}</h3>
                <p>{p.deskripsi}</p>
                <div className="requester">
                  <span>{p.pemberi_nama.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <b>{p.pemberi_nama}</b>
                    <small>Pemberi bantuan</small>
                  </div>
                </div>
                <Link to={`/penawaran/${p.id}`}>
                  <button className="help-btn">
                    Lihat detail <span style={{ marginLeft: 6 }}>→</span>
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
