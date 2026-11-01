import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { AuthShell, ULineField } from '../components/AuthShell'
import { useAuth } from '../lib/auth'
import { useTitle } from '../lib/hooks'
import { useFeedback } from '../components/Feedback'

export default function Login() {
  useTitle('Masuk')
  const { user, signIn } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const { toast } = useFeedback()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)
  const dari = (loc.state as { from?: string } | null)?.from || '/dashboard'

  if (user) return <Navigate to={dari} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const { error } = await signIn(email, pass)
    setBusy(false)
    if (error) {
      setErr(error)
      setShake((s) => s + 1)
    } else {
      toast('ok', 'Berhasil masuk', 'Selamat datang kembali di UNMUL Peduli.')
      nav(dari, { replace: true })
    }
  }

  return (
    <AuthShell heading="Berbagi jadi lebih mudah, bantuan jadi lebih tepat sasaran." text="Masuk untuk mengajukan, menawarkan, dan memantau bantuan di lingkungan Universitas Mulawarman.">
      <h1>Selamat datang kembali</h1>
      <p>Masuk ke akun UNMUL Peduli kamu.</p>
      <form onSubmit={submit} noValidate={false} key={shake} className={shake ? 'shake' : ''}>
        {err && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} /> {err}
          </div>
        )}
        <ULineField id="email" label="Alamat email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <ULineField id="pass" label="Kata sandi" type="password" autoComplete="current-password" required value={pass} onChange={(e) => setPass(e.target.value)} />
        <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 22, fontSize: 13 }}>
          <Link to="/lupa-password" className="auth-link">Lupa kata sandi?</Link>
        </div>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy ? <><Loader2 size={18} className="spin" /> Memproses...</> : <>Masuk <ArrowRight size={18} /></>}
        </button>
        <p className="center muted" style={{ fontSize: 13.5, marginTop: 22 }}>
          Belum punya akun? <Link to="/register" className="auth-link">Daftar sekarang</Link>
        </p>
      </form>
    </AuthShell>
  )
}
