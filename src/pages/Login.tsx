import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await signIn(email, pass);
    setLoading(false);
    if (error) setErr(error);
    else nav("/");
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--cream)", padding: 20 }}>
      <form onSubmit={submit} style={{ background: "white", padding: 40, borderRadius: 26, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,.1)" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Masuk</h1>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 24 }}>Selamat datang kembali di UNMUL Peduli</p>
        {err && <p style={{ fontSize: 13, color: "#c33", marginBottom: 12, padding: 10, background: "#fee", borderRadius: 8 }}>{err}</p>}
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }} />
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Password</label>
        <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} style={{ width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 20 }} />
        <button className="pill pill-orange" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Memproses…" : "Masuk"}
        </button>
        <p style={{ fontSize: 12, textAlign: "center", marginTop: 16, opacity: 0.6 }}>
          Belum punya akun?{" "}
          <Link to="/register" style={{ fontWeight: 700, textDecoration: "underline" }}>
            Daftar
          </Link>
        </p>
      </form>
    </div>
  );
}
