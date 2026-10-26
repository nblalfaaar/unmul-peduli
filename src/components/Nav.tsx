import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function Nav() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  async function handleLogout() {
    await signOut();
    nav("/");
  }

  const linkStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "var(--pale)" : "transparent",
    border: 0,
    color: "var(--ink)",
    fontSize: 14,
    fontWeight: 600,
    padding: "8px 12px",
    borderRadius: 8,
    textDecoration: "none",
  });

  return (
    <header className="nav" style={{ gap: 20 }}>
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

      <nav className="nav-links" style={{ flex: 1, justifyContent: "center" }}>
        <Link to="/bantuan" style={linkStyle(pathname === "/bantuan")}>
          Pengajuan
        </Link>
        <Link to="/penawaran" style={linkStyle(pathname === "/penawaran")}>
          Penawaran
        </Link>
        {user && (
          <Link to="/notifikasi" style={linkStyle(pathname === "/notifikasi")}>
            Notifikasi
          </Link>
        )}
        {user?.role === "admin" && (
          <Link to="/admin" style={linkStyle(pathname === "/admin")}>
            Dashboard
          </Link>
        )}
        {user?.role === "verifikator" && (
          <Link to="/verifikasi" style={linkStyle(pathname === "/verifikasi")}>
            Verifikasi
          </Link>
        )}
      </nav>

      {user ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{user.nama}</div>
            <div style={{ fontSize: 10, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>{user.role}</div>
          </div>
          <button className="pill pill-dark" onClick={handleLogout} style={{ padding: "10px 18px", fontSize: 13 }}>
            Keluar
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/login">
            <button className="pill pill-light" style={{ padding: "10px 18px", fontSize: 13 }}>
              Masuk
            </button>
          </Link>
          <Link to="/register">
            <button className="pill pill-dark" style={{ padding: "10px 18px", fontSize: 13 }}>
              Daftar
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}
