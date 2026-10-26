import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function Nav() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    await signOut();
    nav("/");
  }

  return (
    <header className="nav">
      <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        <span className="brand-mark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
        </span>
        <span>
          <b>UNMUL</b> PEDULI<small>Dari mahasiswa, untuk sesama</small>
        </span>
      </Link>
      <nav className="nav-links">
        <Link to="/bantuan">
          <button>Tentang</button>
        </Link>
        <Link to="/bantuan">
          <button>Bantuan</button>
        </Link>
      </nav>
      {user ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{user.nama}</span>
          <button className="pill pill-dark" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      ) : (
        <Link to="/login">
          <button className="pill pill-dark">Masuk</button>
        </Link>
      )}
    </header>
  );
}
