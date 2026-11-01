import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift, Plus, Search, SearchX } from 'lucide-react'
import { listPenawaran } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { KATEGORI } from '../lib/constants'
import type { Penawaran as P } from '../lib/firebase'
import { PageTop } from '../components/PageTop'
import { OfferCard } from '../components/Cards'
import { CardSkeletons, EmptyState, stagger } from '../components/ui'

export default function Penawaran() {
  useTitle('Penawaran Bantuan')
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') ?? ''
  const kategori = sp.get('kategori') ?? 'Semua'
  const status = sp.get('status') ?? 'tersedia'
  const { data, loading, error } = useData(listPenawaran, [], [] as P[])

  function set(k: string, v: string, def = '') {
    const n = new URLSearchParams(sp)
    if (!v || v === def) n.delete(k)
    else n.set(k, v)
    setSp(n, { replace: true })
  }

  const hasil = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return data
      .filter((p) => status === 'semua' || p.status === 'Tersedia')
      .filter((p) => kategori === 'Semua' || p.kategori === kategori)
      .filter((p) => !kw || `${p.judul} ${p.deskripsi} ${p.pemberi_nama} ${p.kategori}`.toLowerCase().includes(kw))
  }, [data, q, kategori, status])

  return (
    <>
      <PageTop title="Penawaran Bantuan" desc="Bantuan yang ditawarkan sivitas akademika. Klaim yang kamu butuhkan, siapa cepat dia dapat." actions={<Link to="/tawarkan" className="btn btn-light"><Plus size={16} /> Tawarkan bantuan</Link>} />
      <div className="container page-body">
        <div className="toolbar" role="search">
          <div className="input-icon">
            <Search size={17} className="lead" />
            <input className="input" placeholder="Cari penawaran..." value={q} onChange={(e) => set('q', e.target.value)} aria-label="Cari penawaran" />
          </div>
          <select className="select" value={status} onChange={(e) => set('status', e.target.value, 'tersedia')} aria-label="Filter status">
            <option value="tersedia">Masih tersedia</option>
            <option value="semua">Semua status</option>
          </select>
        </div>
        <div className="filter-row">
          {['Semua', ...KATEGORI].map((c) => (
            <button key={c} className={`pill-filter ${kategori === c ? 'on' : ''}`} onClick={() => set('kategori', c, 'Semua')}>{c}</button>
          ))}
        </div>
        {!loading && !error && <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{hasil.length} penawaran ditemukan</p>}
        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
        {loading ? <CardSkeletons /> : hasil.length === 0 ? (
          (q || kategori !== 'Semua') ? (
            <EmptyState icon={SearchX} title="Tidak ada hasil yang cocok" desc="Coba ubah kata kunci atau kategori." action={<button className="btn btn-primary" onClick={() => setSp({}, { replace: true })}>Reset filter</button>} />
          ) : (
            <EmptyState icon={Gift} title="Belum ada penawaran tersedia" desc="Punya sesuatu yang bisa dibagi? Jadilah yang pertama menawarkan." action={<Link to="/tawarkan" className="btn btn-primary">Tawarkan bantuan</Link>} />
          )
        ) : (
          <motion.div className="cards-grid" variants={stagger} initial="hidden" animate="show" key={`${kategori}${status}${q}`}>
            {hasil.map((p) => <OfferCard key={p.id} p={p} />)}
          </motion.div>
        )}
      </div>
    </>
  )
}
