import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Send } from 'lucide-react'
import { createPenawaran, pesanError } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useTitle } from '../lib/hooks'
import { CategoryPicker } from '../components/Forms'
import { useFeedback } from '../components/Feedback'
import { PageHeader } from '../components/ui'

export default function TawarkanBantuan() {
  useTitle('Tawarkan Bantuan')
  const { user } = useAuth()
  const nav = useNavigate()
  const { toast } = useFeedback()
  const [f, setF] = useState({ judul: '', kategori: 'Perlengkapan Kuliah', jumlah: '', deskripsi: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setErr('')
    if (f.judul.trim().length < 5) return setErr('Judul minimal 5 karakter.')
    if (f.deskripsi.trim().length < 15) return setErr('Deskripsi minimal 15 karakter.')
    setBusy(true)
    try {
      const id = await createPenawaran({ judul: f.judul.trim(), kategori: f.kategori, deskripsi: f.deskripsi.trim(), jumlah: f.jumlah.trim() || undefined }, user)
      toast('ok', 'Penawaran dipublikasikan', 'Sivitas akademika kini dapat mengklaim bantuanmu.')
      nav(`/penawaran/${id}`)
    } catch (e2) {
      setErr(pesanError(e2))
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Tawarkan bantuan" sub="Bagikan yang kamu punya: dana, makanan, pakaian, perlengkapan kuliah, atau lainnya." />
      <div className="form-grid">
        <form className="card stack" style={{ gap: 20 }} onSubmit={submit}>
          {err && <div className="alert alert-danger" role="alert"><AlertCircle size={18} /> {err}</div>}
          {!user?.no_hp && <div className="alert alert-info"><AlertCircle size={18} /> <span>Tambahkan nomor HP di <Link to="/profil" style={{ fontWeight: 600, textDecoration: 'underline' }}>profil</Link> agar penerima dapat menghubungimu.</span></div>}
          <div className="field"><span className="label">Jenis bantuan</span><CategoryPicker value={f.kategori} onChange={(v) => setF({ ...f, kategori: v })} /></div>
          <div className="field"><label htmlFor="judul">Judul penawaran</label><input id="judul" className="input" required value={f.judul} onChange={(e) => setF({ ...f, judul: e.target.value })} placeholder="Contoh: Buku Kalkulus & Fisika Dasar bekas" maxLength={90} /></div>
          <div className="field"><label htmlFor="jumlah">Jumlah / ketersediaan</label><input id="jumlah" className="input" value={f.jumlah} onChange={(e) => setF({ ...f, jumlah: e.target.value })} placeholder="Contoh: 4 buku / 10 porsi / Rp 200.000" /></div>
          <div className="field"><label htmlFor="desk">Detail bantuan</label><textarea id="desk" className="textarea" required value={f.deskripsi} onChange={(e) => setF({ ...f, deskripsi: e.target.value })} placeholder="Jelaskan kondisi barang, lokasi serah terima, atau syarat tertentu." /></div>
          <div className="row row-wrap" style={{ justifyContent: 'flex-end' }}>
            <Link to="/dashboard" className="btn btn-outline">Batal</Link>
            <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? <><Loader2 size={18} className="spin" /> Mengirim...</> : <><Send size={17} /> Publikasikan</>}</button>
          </div>
        </form>
        <aside className="card sticky-card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Bagaimana penawaran bekerja?</h3>
          <ol className="steps-list" style={{ padding: 0, margin: 0 }}>
            <li><div><b>Tampil di daftar</b>Penawaranmu langsung dapat dilihat sivitas akademika.</div></li>
            <li><div><b>Diklaim</b>Siapa cepat dia dapat. Kamu menerima notifikasi saat ada yang mengklaim.</div></li>
            <li><div><b>Koordinasi</b>Kontak penerima dibagikan, penyerahan dilakukan langsung.</div></li>
          </ol>
        </aside>
      </div>
    </>
  )
}
