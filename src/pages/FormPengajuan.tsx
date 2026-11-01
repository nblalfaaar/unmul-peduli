import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Loader2, Send } from 'lucide-react'
import { createPengajuan, editPengajuan, getPengajuanById, pesanError } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useTitle } from '../lib/hooks'
import { URGENSI } from '../lib/constants'
import type { Urgensi } from '../lib/firebase'
import { CategoryPicker } from '../components/Forms'
import { useFeedback } from '../components/Feedback'
import { PageHeader } from '../components/ui'

export default function FormPengajuan() {
  const { id } = useParams<{ id: string }>()
  const edit = !!id
  useTitle(edit ? 'Ubah Pengajuan' : 'Ajukan Bantuan')
  const { user } = useAuth()
  const nav = useNavigate()
  const { toast } = useFeedback()
  const [f, setF] = useState({ judul: '', kategori: 'Dana', jumlah: '', deskripsi: '', kondisi: '', urgensi: 'sedang' as Urgensi, batas: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(!edit)
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!edit || !id || !user) return
    getPengajuanById(id).then((d) => {
      if (!d || d.pengaju_id !== user.id || !['Menunggu verifikasi', 'Ditolak'].includes(d.status)) {
        toast('err', 'Tidak dapat diubah', 'Pengajuan yang sudah diverifikasi tidak bisa diubah.')
        nav(d ? `/bantuan/${id}` : '/pengajuan-saya', { replace: true })
        return
      }
      setF({
        judul: d.judul, kategori: d.kategori, jumlah: d.jumlah ?? '', deskripsi: d.deskripsi, kondisi: d.kondisi ?? '', urgensi: d.urgensi,
        batas: d.batas_waktu ? new Date(d.batas_waktu).toISOString().slice(0, 10) : '',
      })
      setReady(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setErr('')
    if (f.judul.trim().length < 5) return setErr('Judul minimal 5 karakter.')
    if (f.deskripsi.trim().length < 20) return setErr('Deskripsi minimal 20 karakter agar verifikator memahami kebutuhanmu.')
    const data = {
      judul: f.judul.trim(), kategori: f.kategori, deskripsi: f.deskripsi.trim(), urgensi: f.urgensi,
      jumlah: f.jumlah.trim() || undefined, kondisi: f.kondisi.trim() || undefined,
      batas_waktu: f.batas ? new Date(`${f.batas}T23:59:59`).getTime() : undefined,
    }
    setBusy(true)
    try {
      if (edit && id) {
        await editPengajuan(id, data, user)
        toast('ok', 'Pengajuan diperbarui', 'Menunggu pemeriksaan verifikator.')
        nav(`/bantuan/${id}`)
      } else {
        const newId = await createPengajuan(data, user)
        toast('ok', 'Pengajuan terkirim', 'Verifikator akan memeriksa kelengkapan datamu.')
        nav(`/bantuan/${newId}`)
      }
    } catch (e2) {
      setErr(pesanError(e2))
      setBusy(false)
    }
  }

  if (!ready) return <div className="skel" style={{ height: 420, borderRadius: 24 }} />

  return (
    <>
      <PageHeader title={edit ? 'Ubah pengajuan' : 'Ajukan bantuan'} sub="Ceritakan kebutuhanmu dengan jelas. Setiap pengajuan diperiksa verifikator sebelum tampil." />
      <div className="form-grid">
        <form className="card stack" style={{ gap: 20 }} onSubmit={submit}>
          {err && <div className="alert alert-danger" role="alert"><AlertCircle size={18} /> {err}</div>}
          {!user?.no_hp && (
            <div className="alert alert-info"><AlertCircle size={18} /> <span>Tambahkan nomor HP di <Link to="/profil" style={{ fontWeight: 600, textDecoration: 'underline' }}>profil</Link> agar pemberi bantuan dapat menghubungimu.</span></div>
          )}
          <div className="field"><span className="label">Jenis bantuan</span><CategoryPicker value={f.kategori} onChange={(v) => set('kategori', v)} /></div>
          <div className="field"><label htmlFor="judul">Judul pengajuan</label><input id="judul" className="input" required value={f.judul} onChange={(e) => set('judul', e.target.value)} placeholder="Contoh: Buku referensi Teknik Sipil semester 5" maxLength={90} /></div>
          <div className="grid-2">
            <div className="field"><label htmlFor="jumlah">Jumlah</label><input id="jumlah" className="input" value={f.jumlah} onChange={(e) => set('jumlah', e.target.value)} placeholder="Contoh: 3 buku / Rp 500.000" /></div>
            <div className="field"><label htmlFor="batas">Batas waktu (opsional)</label><input id="batas" type="date" className="input" min={new Date().toISOString().slice(0, 10)} value={f.batas} onChange={(e) => set('batas', e.target.value)} /></div>
          </div>
          <div className="field"><label htmlFor="desk">Deskripsi kebutuhan</label><textarea id="desk" className="textarea" required value={f.deskripsi} onChange={(e) => set('deskripsi', e.target.value)} placeholder="Jelaskan apa yang dibutuhkan dan untuk apa." /><span className="hint">{f.deskripsi.trim().length} karakter (minimal 20)</span></div>
          <div className="field"><label htmlFor="kond">Kondisi saat ini (opsional)</label><textarea id="kond" className="textarea" style={{ minHeight: 80 }} value={f.kondisi} onChange={(e) => set('kondisi', e.target.value)} placeholder="Ceritakan kondisi yang melatarbelakangi pengajuan ini." /></div>
          <div className="field">
            <span className="label">Tingkat urgensi</span>
            <div className="seg" role="radiogroup" aria-label="Tingkat urgensi">
              {URGENSI.map((u) => (
                <button type="button" key={u.value} role="radio" aria-checked={f.urgensi === u.value} className={`${f.urgensi === u.value ? 'on' : ''} ${u.value === 'tinggi' ? 'high' : ''}`} onClick={() => set('urgensi', u.value)}>{u.label}</button>
              ))}
            </div>
          </div>
          <div className="row row-wrap" style={{ justifyContent: 'flex-end' }}>
            <Link to={edit ? `/bantuan/${id}` : '/dashboard'} className="btn btn-outline">Batal</Link>
            <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? <><Loader2 size={18} className="spin" /> Mengirim...</> : <><Send size={17} /> {edit ? 'Simpan & ajukan' : 'Kirim pengajuan'}</>}</button>
          </div>
        </form>

        <aside className="card sticky-card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Apa yang terjadi setelah ini?</h3>
          <ol className="steps-list" style={{ padding: 0, margin: 0 }}>
            <li><div><b>Verifikasi</b>Verifikator memeriksa kelengkapan data dan identitasmu.</div></li>
            <li><div><b>Tampil di daftar</b>Pengajuan terverifikasi dapat dilihat dan dibantu sivitas akademika.</div></li>
            <li><div><b>Pencocokan</b>Pemberi bantuan bersedia membantu dan kontaknya dibagikan.</div></li>
            <li><div><b>Penyaluran</b>Bantuan diserahkan langsung, lalu kamu konfirmasi penerimaan.</div></li>
          </ol>
          <div className="alert alert-warn" style={{ marginTop: 18 }}><AlertCircle size={18} /> Pengajuan hanya dapat diubah sebelum diverifikasi.</div>
        </aside>
      </div>
    </>
  )
}
