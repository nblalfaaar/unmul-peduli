import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, Eye, Gift, HeartHandshake, Pencil, Plus, Trash2 } from 'lucide-react'
import { hapusPengajuan, hapusPenawaran, listPengajuanDibantu, listPengajuanMilik, listPenawaranMilik, pesanError } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { tgl } from '../lib/format'
import type { Pengajuan, Penawaran } from '../lib/firebase'
import { useFeedback } from '../components/Feedback'
import { EmptyState, PageHeader, riseItem, RowSkeletons, StatusBadge, stagger, UrgensiBadge } from '../components/ui'

export default function PengajuanSaya() {
  useTitle('Aktivitas Saya')
  const { user } = useAuth()
  const { toast, confirm } = useFeedback()
  const [tab, setTab] = useState<'pengajuan' | 'penawaran' | 'dibantu'>('pengajuan')

  const { data, loading, reload } = useData(
    async () => {
      const [a, b, c] = await Promise.all([listPengajuanMilik(user!.id), listPenawaranMilik(user!.id), listPengajuanDibantu(user!.id)])
      return { a, b, c }
    },
    [user?.id],
    { a: [] as Pengajuan[], b: [] as Penawaran[], c: [] as Pengajuan[] },
  )

  async function hapusA(id: string) {
    if (!user || !(await confirm({ title: 'Hapus pengajuan ini?', desc: 'Tindakan ini tidak dapat dibatalkan.', confirmText: 'Ya, hapus', danger: true }))) return
    try { await hapusPengajuan(id, user); toast('ok', 'Pengajuan dihapus'); reload(true) } catch (e) { toast('err', 'Gagal menghapus', pesanError(e)) }
  }
  async function hapusB(id: string) {
    if (!user || !(await confirm({ title: 'Hapus penawaran ini?', desc: 'Tindakan ini tidak dapat dibatalkan.', confirmText: 'Ya, hapus', danger: true }))) return
    try { await hapusPenawaran(id, user); toast('ok', 'Penawaran dihapus'); reload(true) } catch (e) { toast('err', 'Gagal menghapus', pesanError(e)) }
  }

  const tabs = [
    { k: 'pengajuan' as const, label: 'Pengajuan', n: data.a.length },
    { k: 'penawaran' as const, label: 'Penawaran', n: data.b.length },
    { k: 'dibantu' as const, label: 'Bantuan yang kuberikan', n: data.c.length },
  ]

  return (
    <>
      <PageHeader title="Aktivitas saya" sub="Semua pengajuan, penawaran, dan bantuan yang kamu berikan." actions={<><Link to="/ajukan" className="btn btn-primary btn-sm"><Plus size={15} /> Ajukan</Link><Link to="/tawarkan" className="btn btn-soft btn-sm"><Gift size={15} /> Tawarkan</Link></>} />
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.k} role="tab" aria-selected={tab === t.k} className={`tab ${tab === t.k ? 'on' : ''}`} onClick={() => setTab(t.k)}>{t.label}<span className="n">{t.n}</span></button>
        ))}
      </div>

      {loading ? <RowSkeletons /> : (
        <motion.div className="stack" variants={stagger} initial="hidden" animate="show" key={tab}>
          {tab === 'pengajuan' && (data.a.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Belum ada pengajuan" desc="Ceritakan kebutuhanmu agar bisa dibantu." action={<Link to="/ajukan" className="btn btn-primary">Buat pengajuan</Link>} />
          ) : data.a.map((p) => (
            <motion.div key={p.id} variants={riseItem} className="card card-hover">
              <div className="row row-wrap" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="row row-wrap" style={{ gap: 6, marginBottom: 8 }}><span className="badge badge-blue">{p.kategori}</span><StatusBadge status={p.status} /><UrgensiBadge urgensi={p.urgensi} /></div>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{p.judul}</h3>
                  <p className="muted clamp-2" style={{ fontSize: 13, margin: '4px 0 6px' }}>{p.deskripsi}</p>
                  <small className="muted">Diajukan {tgl(p.created_at)}{p.pemberi_nama ? ` · dibantu ${p.pemberi_nama}` : ''}</small>
                  {p.status === 'Ditolak' && p.alasan_penolakan && <div className="alert alert-danger" style={{ marginTop: 10, fontSize: 12.5 }}>Alasan penolakan: {p.alasan_penolakan}</div>}
                </div>
                <div className="row row-wrap" style={{ gap: 8 }}>
                  <Link to={`/bantuan/${p.id}`} className="btn btn-outline btn-sm"><Eye size={14} /> Detail</Link>
                  {['Menunggu verifikasi', 'Ditolak'].includes(p.status) && <Link to={`/ajukan/${p.id}/edit`} className="btn btn-soft btn-sm"><Pencil size={14} /> {p.status === 'Ditolak' ? 'Perbaiki' : 'Ubah'}</Link>}
                  {['Menunggu verifikasi', 'Terverifikasi', 'Ditolak'].includes(p.status) && <button className="btn btn-danger btn-sm" onClick={() => hapusA(p.id!)}><Trash2 size={14} /> Hapus</button>}
                </div>
              </div>
            </motion.div>
          )))}

          {tab === 'penawaran' && (data.b.length === 0 ? (
            <EmptyState icon={Gift} title="Belum ada penawaran" desc="Bagikan yang kamu punya kepada yang membutuhkan." action={<Link to="/tawarkan" className="btn btn-primary">Buat penawaran</Link>} />
          ) : data.b.map((p) => (
            <motion.div key={p.id} variants={riseItem} className="card card-hover">
              <div className="row row-wrap" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="row row-wrap" style={{ gap: 6, marginBottom: 8 }}><span className="badge badge-blue">{p.kategori}</span><StatusBadge status={p.status} /></div>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{p.judul}</h3>
                  <p className="muted clamp-2" style={{ fontSize: 13, margin: '4px 0 6px' }}>{p.deskripsi}</p>
                  <small className="muted">Ditawarkan {tgl(p.created_at)}{p.pengklaim_nama ? ` · diklaim ${p.pengklaim_nama}` : ''}</small>
                </div>
                <div className="row row-wrap" style={{ gap: 8 }}>
                  <Link to={`/penawaran/${p.id}`} className="btn btn-outline btn-sm"><Eye size={14} /> Detail</Link>
                  {p.status === 'Tersedia' && <button className="btn btn-danger btn-sm" onClick={() => hapusB(p.id!)}><Trash2 size={14} /> Hapus</button>}
                </div>
              </div>
            </motion.div>
          )))}

          {tab === 'dibantu' && (data.c.length === 0 ? (
            <EmptyState icon={HeartHandshake} title="Belum ada bantuan yang kamu berikan" desc="Pilih pengajuan yang ingin kamu bantu." action={<Link to="/bantuan" className="btn btn-primary">Lihat pengajuan</Link>} />
          ) : data.c.map((p) => (
            <motion.div key={p.id} variants={riseItem} className="card card-hover">
              <div className="row row-wrap">
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="row row-wrap" style={{ gap: 6, marginBottom: 8 }}><span className="badge badge-blue">{p.kategori}</span><StatusBadge status={p.status} /></div>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{p.judul}</h3>
                  <small className="muted">Untuk {p.pengaju_nama} &middot; {tgl(p.updated_at ?? p.created_at)}</small>
                </div>
                <Link to={`/bantuan/${p.id}`} className="btn btn-primary btn-sm"><Eye size={14} /> {p.status === 'Pencocokan' ? 'Lanjutkan' : 'Detail'}</Link>
              </div>
            </motion.div>
          )))}
        </motion.div>
      )}
    </>
  )
}
