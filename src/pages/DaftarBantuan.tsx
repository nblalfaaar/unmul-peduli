import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HandHeart, Plus, Search, SearchX } from 'lucide-react'
import { listPengajuanPublik } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { KATEGORI } from '../lib/constants'
import type { Pengajuan } from '../lib/firebase'
import { PageTop } from '../components/PageTop'
import { NeedCard } from '../components/Cards'
import { CardSkeletons, EmptyState, stagger } from '../components/ui'

const URUT: Record<string, (a: Pengajuan, b: Pengajuan) => number> = {
  terbaru: (a, b) => b.created_at - a.created_at,
  mendesak: (a, b) => ['rendah', 'sedang', 'tinggi'].indexOf(b.urgensi) - ['rendah', 'sedang', 'tinggi'].indexOf(a.urgensi) || b.created_at - a.created_at,
  batas: (a, b) => (a.batas_waktu ?? Infinity) - (b.batas_waktu ?? Infinity),
}

export default function DaftarBantuan() {
  useTitle('Pengajuan Bantuan')
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') ?? ''
  const kategori = sp.get('kategori') ?? 'Semua'
  const urgensi = sp.get('urgensi') ?? ''
  const status = sp.get('status') ?? 'terbuka'
  const urut = sp.get('urut') ?? 'terbaru'

  const { data, loading, error } = useData(listPengajuanPublik, [], [] as Pengajuan[])

  function set(k: string, v: string, def = '') {
    const n = new URLSearchParams(sp)
    if (!v || v === def) n.delete(k)
    else n.set(k, v)
    setSp(n, { replace: true })
  }

  const hasil = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return data
      .filter((p) => (status === 'semua' ? true : status === 'terbuka' ? p.status === 'Terverifikasi' : status === 'proses' ? ['Pencocokan', 'Penyaluran'].includes(p.status) : p.status === 'Selesai'))
      .filter((p) => kategori === 'Semua' || p.kategori === kategori)
      .filter((p) => !urgensi || p.urgensi === urgensi)
      .filter((p) => !kw || `${p.judul} ${p.deskripsi} ${p.pengaju_nama} ${p.kategori}`.toLowerCase().includes(kw))
      .sort(URUT[urut] ?? URUT.terbaru)
  }, [data, q, kategori, urgensi, status, urut])

  return (
    <>
      <PageTop title="Pengajuan Bantuan" desc="Kebutuhan sivitas akademika yang sudah diverifikasi. Pilih yang ingin kamu bantu." actions={<Link to="/ajukan" className="btn btn-light"><Plus size={16} /> Ajukan bantuan</Link>} />
      <div className="container page-body">
        <div className="toolbar" role="search">
          <div className="input-icon">
            <Search size={17} className="lead" />
            <input className="input" placeholder="Cari judul, deskripsi, atau nama pengaju..." value={q} onChange={(e) => set('q', e.target.value)} aria-label="Cari pengajuan" />
          </div>
          <select className="select" value={status} onChange={(e) => set('status', e.target.value, 'terbuka')} aria-label="Filter status">
            <option value="terbuka">Perlu dibantu</option>
            <option value="proses">Dalam proses</option>
            <option value="selesai">Selesai</option>
            <option value="semua">Semua status</option>
          </select>
          <select className="select" value={urgensi} onChange={(e) => set('urgensi', e.target.value)} aria-label="Filter urgensi">
            <option value="">Semua urgensi</option>
            <option value="tinggi">Mendesak</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
          </select>
          <select className="select" value={urut} onChange={(e) => set('urut', e.target.value, 'terbaru')} aria-label="Urutkan">
            <option value="terbaru">Terbaru</option>
            <option value="mendesak">Paling mendesak</option>
            <option value="batas">Batas waktu terdekat</option>
          </select>
        </div>

        <div className="filter-row">
          {['Semua', ...KATEGORI].map((c) => (
            <button key={c} className={`pill-filter ${kategori === c ? 'on' : ''}`} onClick={() => set('kategori', c, 'Semua')}>{c}</button>
          ))}
        </div>

        {!loading && !error && <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{hasil.length} pengajuan ditemukan</p>}
        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

        {loading ? <CardSkeletons /> : hasil.length === 0 ? (
          (q || kategori !== 'Semua' || urgensi) ? (
            <EmptyState icon={SearchX} title="Tidak ada hasil yang cocok" desc="Coba ubah kata kunci atau hapus beberapa filter." action={<button className="btn btn-primary" onClick={() => setSp({}, { replace: true })}>Reset filter</button>} />
          ) : (
            <EmptyState icon={HandHeart} title="Belum ada pengajuan di kategori ini" desc="Saat ini belum ada pengajuan terverifikasi. Kamu bisa menjadi yang pertama." action={<Link to="/ajukan" className="btn btn-primary">Ajukan sekarang</Link>} />
          )
        ) : (
          <motion.div className="cards-grid" variants={stagger} initial="hidden" animate="show" key={`${kategori}${status}${urgensi}${urut}${q}`}>
            {hasil.map((p) => <NeedCard key={p.id} p={p} />)}
          </motion.div>
        )}
      </div>
    </>
  )
}
