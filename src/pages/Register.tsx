import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { AuthShell, ULineField, ULineSelect } from '../components/AuthShell'
import { useAuth } from '../lib/auth'
import { useTitle } from '../lib/hooks'
import { FAKULTAS } from '../lib/constants'
import { useFeedback } from '../components/Feedback'

function kekuatan(p: string): { w: number; c: string; t: string } {
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++
  const m = [
    { w: 12, c: 'var(--c-danger)', t: 'Terlalu lemah' },
    { w: 35, c: 'var(--c-danger)', t: 'Lemah' },
    { w: 60, c: 'var(--c-peach-strong)', t: 'Cukup' },
    { w: 82, c: 'var(--c-green)', t: 'Kuat' },
    { w: 100, c: 'var(--c-green)', t: 'Sangat kuat' },
  ]
  return m[s]
}

export default function Register() {
  useTitle('Daftar')
  const { user, signUp } = useAuth()
  const nav = useNavigate()
  const { toast } = useFeedback()
  const [f, setF] = useState({ nama: '', email: '', fakultas: '', nim: '', password: '', ulang: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  if (user) return <Navigate to="/dashboard" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    if (f.nama.trim().length < 3) return setErr('Nama lengkap minimal 3 karakter.')
    if (f.password.length < 6) return setErr('Kata sandi minimal 6 karakter.')
    if (f.password !== f.ulang) return setErr('Konfirmasi kata sandi tidak sama.')
    setBusy(true)
    const { error } = await signUp(f.email, f.password, f.nama.trim(), f.fakultas, f.nim.trim() || undefined)
    setBusy(false)
    if (error) return setErr(error)
    toast('ok', 'Akun berhasil dibuat', 'Selamat bergabung di UNMUL Peduli.')
    nav('/dashboard', { replace: true })
  }

  const k = f.password ? kekuatan(f.password) : null

  return (
    <AuthShell heading="Bergabung dengan keluarga besar Universitas Mulawarman." text="Satu akun untuk mengajukan bantuan, menawarkan bantuan, dan memantau prosesnya sampai selesai.">
      <h1>Buat akun</h1>
      <p>Lengkapi data berikut untuk mulai berbagi.</p>
      <form onSubmit={submit}>
        {err && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} /> {err}
          </div>
        )}
        <ULineField id="nama" label="Nama lengkap" autoComplete="name" required value={f.nama} onChange={set('nama')} />
        <ULineField id="email" label="Alamat email" type="email" autoComplete="email" required value={f.email} onChange={set('email')} />
        <ULineSelect id="fak" label="Fakultas / unit" required value={f.fakultas} onChange={set('fakultas')}>
          <option value="" disabled hidden />
          {FAKULTAS.map((x) => <option key={x} value={x}>{x}</option>)}
        </ULineSelect>
        <ULineField id="nim" label="NIM / NIP (opsional)" inputMode="numeric" value={f.nim} onChange={set('nim')} />
        <ULineField id="pw" label="Kata sandi (min. 6 karakter)" type="password" autoComplete="new-password" required value={f.password} onChange={set('password')} />
        {k && (
          <div style={{ marginTop: -6, marginBottom: 18 }}>
            <div className="strength" style={{ margin: '0 0 4px' }}><i style={{ width: `${k.w}%`, background: k.c }} /></div>
            <small className="muted" style={{ fontSize: 11.5 }}>Kekuatan: {k.t}</small>
          </div>
        )}
        <ULineField id="pw2" label="Ulangi kata sandi" type="password" autoComplete="new-password" required value={f.ulang} onChange={set('ulang')} />
        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 6 }} disabled={busy}>
          {busy ? <><Loader2 size={18} className="spin" /> Membuat akun...</> : <>Buat akun <ArrowRight size={18} /></>}
        </button>
        <p className="center muted" style={{ fontSize: 13.5, marginTop: 22 }}>
          Sudah punya akun? <Link to="/login" className="auth-link">Masuk</Link>
        </p>
      </form>
    </AuthShell>
  )
}
