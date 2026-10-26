import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    heart: (
      <>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" />
        <path d="M8 7h8M8 11h6" />
      </>
    ),
    food: (
      <>
        <path d="M6 3v7M10 3v7M6 7h4M8 10v11M15 3v18M15 3c4 2 4 7 0 9" />
      </>
    ),
    health: (
      <>
        <path d="M12 22s8-4.5 8-11a4.5 4.5 0 0 0-8-3 4.5 4.5 0 0 0-8 3c0 6.5 8 11 8 11Z" />
        <path d="M8 13h2l1-3 2 6 1-3h2" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const requests = [
  {
    category: "Pendidikan",
    icon: "book",
    title: "Buku Referensi Teknik Sipil",
    desc: "Membutuhkan buku Mekanika Tanah untuk persiapan ujian semester.",
    name: "Raka",
    faculty: "Fakultas Teknik",
    progress: 72,
    unit: "9 dari 12 buku",
    urgent: true,
    color: "mint",
  },
  {
    category: "Kebutuhan",
    icon: "food",
    title: "Paket Makan Minggu Tenang",
    desc: "Bantu teman-teman perantau melewati minggu ujian dengan tenang.",
    name: "BEM KM",
    faculty: "Lintas Fakultas",
    progress: 48,
    unit: "48 dari 100 paket",
    urgent: false,
    color: "peach",
  },
  {
    category: "Kesehatan",
    icon: "health",
    title: "Donor Darah untuk Ayah Dita",
    desc: "Dibutuhkan donor darah O+ di RS Abdul Wahab Sjahranie.",
    name: "Dita",
    faculty: "FISIP",
    progress: 75,
    unit: "3 dari 4 pendonor",
    urgent: true,
    color: "rose",
  },
];

const offers = [
  { icon: "book", title: "Mentoring Kalkulus", by: "Nadya • FMIPA", time: "Sabtu, 10.00 WITA", spots: "3 kursi tersisa" },
  { icon: "briefcase", title: "Review CV & Portofolio", by: "Kak Arman • Alumni", time: "Jumat, 19.30 WITA", spots: "5 kursi tersisa" },
  { icon: "food", title: "Nasi Gratis Jumat", by: "Komunitas Berbagi", time: "Jumat, 11.00 WITA", spots: "20 porsi tersedia" },
];

export default function Landing() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState("Semua");
  const [liked, setLiked] = useState<number[]>([]);
  const [modal, setModal] = useState<"request" | "offer" | "help" | null>(null);
  const filtered = filter === "Semua" ? requests : requests.filter((r) => r.category === filter);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="site-shell">
      <header className="nav">
        <button className="brand" onClick={() => scrollTo("home")} aria-label="Ke beranda">
          <span className="brand-mark">
            <Icon name="heart" size={22} />
            <span className="brand-dot" />
          </span>
          <span>
            <b>UNMUL</b> PEDULI<small>Dari mahasiswa, untuk sesama</small>
          </span>
        </button>
        <nav className="nav-links">
          <Link to="/bantuan">
            <button>Tentang</button>
          </Link>
          <Link to="/bantuan">
            <button>Butuh bantuan</button>
          </Link>
          <Link to="/tawarkan">
            <button>Tawarkan bantuan</button>
          </Link>
        </nav>
        <button className="pill pill-dark" onClick={() => nav(user ? "/ajukan" : "/login")}>
          Mulai berbagi <Icon name="arrow" size={17} />
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="pulse" /> Ruang aman untuk saling bantu
            </span>
            <h1>
              Kebaikan kecil,
              <br />
              berarti <em>besar</em>
              <br />
              untuk sesama.
            </h1>
            <p>Platform solidaritas mahasiswa Universitas Mulawarman untuk meminta bantuan tanpa ragu dan berbagi tanpa batas.</p>
            <div className="hero-actions">
              <button className="pill pill-orange" onClick={() => nav(user ? "/ajukan" : "/login")}>
                Saya butuh bantuan <Icon name="arrow" size={18} />
              </button>
              <button className="text-action" onClick={() => scrollTo("needs")}>
                Lihat yang membutuhkan <span>↓</span>
              </button>
            </div>
            <div className="trust-row">
              <div className="avatars">
                <span>DI</span>
                <span>RA</span>
                <span>NA</span>
                <span>+2k</span>
              </div>
              <p>
                <b>2.400+ mahasiswa</b>
                <br />
                telah saling menguatkan
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="photo-wrap">
              <img src="https://images.unsplash.com/photo-1628717341663-0007b0ee2597?auto=format&fit=crop&w=1100&q=85" alt="Relawan muda menyiapkan paket bantuan" />
              <span className="photo-credit">Foto: Ismael Paramo / Unsplash</span>
            </div>
            <div className="float-card verified">
              <span>
                <Icon name="shield" />
              </span>
              <div>
                <b>100% Terverifikasi</b>
                <small>Setiap pengajuan ditinjau tim</small>
              </div>
            </div>
            <div className="float-card kindness">
              <b>+138</b>
              <small>kebaikan minggu ini</small>
              <div className="mini-line" />
            </div>
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
          </div>
        </section>

        <section className="principles" id="about">
          <article>
            <span>
              <Icon name="shield" size={24} />
            </span>
            <div>
              <b>Aman & terverifikasi</b>
              <p>Setiap permintaan ditinjau untuk menjaga kepercayaan.</p>
            </div>
          </article>
          <article>
            <span>
              <Icon name="users" size={24} />
            </span>
            <div>
              <b>Dari kita, untuk kita</b>
              <p>Terhubung langsung dengan keluarga besar Unmul.</p>
            </div>
          </article>
          <article>
            <span>
              <Icon name="heart" size={24} />
            </span>
            <div>
              <b>Bantuan tanpa stigma</b>
              <p>Privasi dan kenyamananmu selalu menjadi prioritas.</p>
            </div>
          </article>
        </section>

        <section className="needs section" id="needs">
          <div className="section-head">
            <div>
              <span className="kicker">MEREKA MENUNGGUMU</span>
              <h2>Satu aksi, satu harapan baru.</h2>
            </div>
            <p>Temukan kebutuhan yang paling dekat denganmu. Sekecil apa pun bantuanmu, selalu punya arti.</p>
          </div>
          <div className="filter-row">
            {["Semua", "Pendidikan", "Kebutuhan", "Kesehatan"].map((item) => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="cards-grid">
            {filtered.map((item, index) => (
              <article className="need-card" key={item.title}>
                <div className={`card-top ${item.color}`}>
                  <span className="category-icon">
                    <Icon name={item.icon} size={30} />
                  </span>
                  <button className={`like ${liked.includes(index) ? "liked" : ""}`} onClick={() => setLiked(liked.includes(index) ? liked.filter((i) => i !== index) : [...liked, index])} aria-label="Simpan bantuan">
                    <Icon name="heart" size={19} />
                  </button>
                  {item.urgent && (
                    <span className="urgent">
                      <span /> Mendesak
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <span className="label">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <div className="requester">
                    <span>{item.name.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <b>{item.name}</b>
                      <small>{item.faculty}</small>
                    </div>
                    <i>
                      <Icon name="shield" size={15} />
                    </i>
                  </div>
                  <div className="progress-meta">
                    <b>{item.progress}% terpenuhi</b>
                    <span>{item.unit}</span>
                  </div>
                  <div className="progress">
                    <span style={{ width: `${item.progress}%` }} />
                  </div>
                  <button className="help-btn" onClick={() => setModal("help")}>
                    Bantu sekarang <Icon name="arrow" size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <button className="outline-btn" onClick={() => setFilter("Semua")}>
            Lihat semua permintaan <Icon name="arrow" size={17} />
          </button>
        </section>

        <section className="impact-band">
          <div>
            <b>2.417</b>
            <span>Mahasiswa terbantu</span>
          </div>
          <i />
          <div>
            <b>486</b>
            <span>Bantuan aktif</span>
          </div>
          <i />
          <div>
            <b>12</b>
            <span>Fakultas terhubung</span>
          </div>
          <i />
          <div>
            <b>4.9/5</b>
            <span>Rasa percaya</span>
          </div>
        </section>

        <section className="offers section" id="offers">
          <div className="offers-intro">
            <span className="kicker">PUNYA YANG BISA DIBAGI?</span>
            <h2>
              Waktu, ilmu, atau tenaga.
              <br />
              <em>Semuanya berharga.</em>
            </h2>
            <p>Tak harus berupa uang. Keahlian dan waktumu bisa jadi jawaban yang sedang dicari seseorang.</p>
            <button className="pill pill-dark" onClick={() => nav(user ? "/tawarkan" : "/login")}>
              Tawarkan bantuan <Icon name="arrow" size={17} />
            </button>
          </div>
          <div className="offer-list">
            {offers.map((offer) => (
              <article key={offer.title}>
                <span className="offer-icon">
                  <Icon name={offer.icon} size={25} />
                </span>
                <div>
                  <h3>{offer.title}</h3>
                  <p>{offer.by}</p>
                  <small>
                    <Icon name="clock" size={14} /> {offer.time}
                  </small>
                </div>
                <div className="offer-end">
                  <span>{offer.spots}</span>
                  <button onClick={() => setModal("help")} aria-label="Lihat penawaran">
                    <Icon name="arrow" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cta">
          <span className="cta-icon">
            <Icon name="heart" size={34} />
          </span>
          <h2>
            Kita mungkin tidak bisa
            <br />
            membantu semua orang.
          </h2>
          <p>Tapi setiap orang bisa membantu seseorang.</p>
          <div>
            <button className="pill pill-orange" onClick={() => nav(user ? "/ajukan" : "/login")}>
              Ajukan bantuan
            </button>
            <button className="pill pill-light" onClick={() => nav(user ? "/tawarkan" : "/login")}>
              Mulai berbagi
            </button>
          </div>
          <span className="doodle d1">✦</span>
          <span className="doodle d2">↝</span>
          <span className="doodle d3">✦</span>
        </section>
      </main>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">
            <Icon name="heart" size={20} />
          </span>
          <span>
            <b>UNMUL</b> PEDULI<small>Dari mahasiswa, untuk sesama</small>
          </span>
        </div>
        <p>© 2025 Unmul Peduli. Tumbuh bersama dalam kebaikan.</p>
        <div>
          <button onClick={() => scrollTo("about")}>Tentang</button>
          <button onClick={() => scrollTo("needs")}>Jelajahi</button>
          <button onClick={() => setModal("help")}>Bantuan</button>
        </div>
      </footer>

      {modal && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)} aria-label="Tutup">
              <Icon name="close" />
            </button>
            <span className="modal-icon">
              <Icon name={modal === "request" ? "users" : "heart"} size={30} />
            </span>
            <span className="kicker">{modal === "request" ? "KAMU TIDAK SENDIRI" : "TERIMA KASIH SUDAH PEDULI"}</span>
            <h2>{modal === "request" ? "Ceritakan kebutuhanmu." : modal === "offer" ? "Apa yang ingin kamu bagikan?" : "Pilih cara kamu membantu."}</h2>
            <p>Tim Unmul Peduli akan menghubungimu dan mendampingi proses berikutnya dengan aman.</p>
            <label>
              Nama lengkap
              <input placeholder="Masukkan nama kamu" />
            </label>
            <label>
              {modal === "request" ? "Jenis kebutuhan" : "Bentuk bantuan"}
              <select defaultValue="">
                <option value="" disabled>
                  Pilih kategori
                </option>
                <option>Pendidikan</option>
                <option>Kebutuhan harian</option>
                <option>Kesehatan</option>
                <option>Waktu & keahlian</option>
              </select>
            </label>
            <button className="pill pill-orange full" onClick={() => setModal(null)}>
              Lanjutkan <Icon name="arrow" size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
