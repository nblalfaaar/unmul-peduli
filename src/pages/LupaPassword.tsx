import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { AuthShell, ULineField } from '../components/AuthShell'
import { useAuth } from '../lib/auth'
import { useTitle } from '../lib/hooks'

export default function LupaPassword() {
  useTitle('Lupa kata sandi')
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const { error } = await resetPassword(email)
    setBusy(false)
    if (error) setErr(error)
    else setSent(true)
  }

  return (
    <AuthShell heading="Lupa kata sandi? Tenang, kami bantu pulihkan." text="Masukkan email akunmu dan kami akan mengirim tautan untuk membuat kata sandi baru.">
      <h1>Atur ulang kata sandi</h1>
      <p>Tautan pemulihan akan dikirim ke emailmu.</p>
      {sent ? (
        <div className="alert alert-ok" role="status">
          <CheckCircle2 size={18} />
          <div>
            Jika <b>{email}</b> terdaftar, tautan pemulihan sudah dikirim. Periksa kotak masuk atau folder spam.
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          {err && <div className="alert alert-danger" role="alert" style={{ marginBottom: 18 }}><AlertCircle size={18} /> {err}</div>}
          <ULineField id="email" label="Alamat email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? <><Loader2 size={18} className="spin" /> Mengirim...</> : <>Kirim tautan pemulihan <ArrowRight size={18} /></>}
          </button>
        </form>
      )}
      <p className="center muted" style={{ fontSize: 13.5, marginTop: 22 }}>
        Ingat kata sandimu? <Link to="/login" className="auth-link">Kembali masuk</Link>
      </p>
    </AuthShell>
  )
}
