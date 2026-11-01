import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Building2, CalendarDays, IdCard, Loader2, Mail, Save, ShieldCheck } from 'lucide-react'
import { updateProfile, pesanError } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useTitle } from '../lib/hooks'
import { FAKULTAS } from '../lib/constants'
import { tgl } from '../lib/format'
import { useFeedback } from '../components/Feedback'
import { Avatar, PageHeader } from '../components/ui'

export default function Profil() {
  useTitle('Profil Saya')
  const { user, refreshUser } = useAuth()
  const { toast } = useFeedback()
  const [f, setF] = useState({ nama: user?.nama ?? '', fakultas: user?.fakultas ?? '', nim: user?.nim ?? '', no_hp: user?.no_hp ?? '', bio: user?.bio ?? '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  if (!user) return null

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    const digits = f.no_hp.replace(/\D/g, '')
    if (f.no_hp && (digits.length < 9 || digits.length > 15)) return setErr('Nomor HP tidak valid (9 sampai 15 digit).')
    if (f.nama.trim().length < 3) return setErr('Nama minimal 3 karakter.')
    setBusy(true)
    try {
      await updateProfile(user!.id, { nama: f.nama.trim(), fakultas: f.fakultas, nim: f.nim.trim(), no_hp: f.no_hp.trim(), bio: f.bio.trim() })
      await refreshUser()
      toast('ok', 'Profil disimpan')
    } catch (e2) {
      setErr(pesanError(e2))
    }
    setBusy(false)
  }

  const lengkap = [f.nama, f.fakultas, f.no_hp, f.nim, f.bio].filter(Boolean).length * 20

  return (
    <>
      <PageHeader title="Profil saya" sub="Kelola informasi akun. Nomor HP hanya dibagikan ke pihak yang terhubung denganmu." />
      <div className="form-grid">
        <motion.div className="card" style={{ padding: 0 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="profile-hero" />
          <div className="profile-card">
            <div className="row" style={{ alignItems: 'flex-end', marginBottom: 20, gap: 16 }}>
              <Avatar nama={user.nama} size={92} />
              <div style={{ paddingBottom: 6 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>{user.nama}</h2>
                <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
            <form className="stack" style={{ gap: 18 }} onSubmit={submit}>
              {err && <div className="alert alert-danger" role="alert">{err}</div>}
              <div className="grid-2">
                <div className="field"><label htmlFor="nama">Nama lengkap</label><input id="nama" className="input" required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} /></div>
                <div className="field"><label htmlFor="nim">NIM / NIP</label><input id="nim" className="input" inputMode="numeric" value={f.nim} onChange={(e) => setF({ ...f, nim: e.target.value })} /></div>
              </div>
              <div className="grid-2">
                <div className="field"><label htmlFor="fak">Fakultas / unit</label>
                  <select id="fak" className="select" value={f.fakultas} onChange={(e) => setF({ ...f, fakultas: e.target.value })}>
                    <option value="">Pilih fakultas</option>
                    {f.fakultas && !FAKULTAS.includes(f.fakultas) && <option>{f.fakultas}</option>}
                    {FAKULTAS.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div className="field"><label htmlFor="hp">No. HP / WhatsApp</label><input id="hp" className="input" inputMode="tel" placeholder="08xxxxxxxxxx" value={f.no_hp} onChange={(e) => setF({ ...f, no_hp: e.target.value })} /></div>
              </div>
              <div className="field"><label htmlFor="bio">Bio singkat</label><textarea id="bio" className="textarea" style={{ minHeight: 90 }} maxLength={240} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="Ceritakan sedikit tentangmu." /></div>
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? <><Loader2 size={18} className="spin" /> Menyimpan...</> : <><Save size={17} /> Simpan profil</>}</button>
              </div>
            </form>
          </div>
        </motion.div>

        <aside className="stack sticky-card" style={{ gap: 18 }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Informasi akun</h3>
            <div className="info-list">
              <div className="info-item"><span className="ic"><Mail size={18} /></span><div><small>Email</small><b>{user.email}</b></div></div>
              <div className="info-item"><span className="ic"><ShieldCheck size={18} /></span><div><small>Peran</small><b style={{ textTransform: 'capitalize' }}>{user.role}</b></div></div>
              <div className="info-item"><span className="ic"><Building2 size={18} /></span><div><small>Fakultas / unit</small><b>{user.fakultas || '-'}</b></div></div>
              <div className="info-item"><span className="ic"><IdCard size={18} /></span><div><small>NIM / NIP</small><b>{user.nim || '-'}</b></div></div>
              <div className="info-item"><span className="ic"><CalendarDays size={18} /></span><div><small>Bergabung</small><b>{tgl(user.created_at)}</b></div></div>
            </div>
          </div>
          <div className="card">
            <div className="row" style={{ marginBottom: 10 }}><h3 className="card-title">Kelengkapan profil</h3><span className="spacer" /><b>{Math.min(100, lengkap)}%</b></div>
            <div className="strength" style={{ margin: 0, height: 8 }}><i style={{ width: `${Math.min(100, lengkap)}%`, background: 'var(--c-green)' }} /></div>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Profil lengkap, terutama nomor HP, mempermudah koordinasi penyerahan bantuan.</p>
          </div>
        </aside>
      </div>
    </>
  )
}
