import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Register() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nama: "", email: "", password: "", fakultas: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await signUp(form.email, form.password, form.nama, form.fakultas);
    setLoading(false);
    if (error) setErr(error);
    else nav("/");
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--cream)", padding: 20 }}>
      <form onSubmit={submit} style={{ background: "white", padding: 40, borderRadius: 26, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,.1)" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Daftar</h1>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 24 }}>Bergabung dengan keluarga besar Unmul</p>
        {err && <p style={{ fontSize: 13, color: "#c33", marginBottom: 12, padding: 10, background: "#fee", borderRadius: 8 }}>{err}</p>}
        {(["nama", "email", "password", "fakultas"] as const).map((field) => (
          <div key={field}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
              {field === "nama" ? "Nama Lengkap" : field === "fakultas" ? "Fakultas (opsional)" : field === "password" ? "Password (min 6 karakter)" : "Email"}
            </label>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              required={field !== "fakultas"}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              style={{ width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}
            />
          </div>
        ))}
        <button className="pill pill-orange" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
          {loading ? "Memproses…" : "Daftar"}
        </button>
        <p style={{ fontSize: 12, textAlign: "center", marginTop: 16, opacity: 0.6 }}>
          Sudah punya akun?{" "}
          <Link to="/login" style={{ fontWeight: 700, textDecoration: "underline" }}>
            Masuk
          </Link>
        </p>
      </form>
    </div>
  );
}
