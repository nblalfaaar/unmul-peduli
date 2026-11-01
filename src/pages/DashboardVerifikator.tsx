import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Eye, Loader2, PartyPopper, Search, ShieldCheck, XCircle } from 'lucide-react'
import { listPengajuanAll, pesanError, verifikasiPengajuan } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { tgl, waktuRelatif } from '../lib/format'
import type { Pengajuan } from '../lib/firebase'
import { useFeedback } from '../components/Feedback'
import { AnimatedNumber, Avatar, EmptyState, PageHeader, riseItem, RowSkeletons, StatusBadge, stagger, UrgensiBadge } from '../components/ui'

const RANK = { rendah: 0, sedang: 1, tinggi: 2 }

export default function DashboardVerifikator() {
  useTitle('Verifikasi Pengajuan')
  const { user } = useAuth()
  const { toast, askReason } = useFeedback()
  const { data, loading, reload } = useData(listPengajuanAll, [], [] as Pengajuan[])
  const [tab, setTab] = useState<'menunggu' | 'riwayat'>('menunggu')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState('')

  const pending = useMemo(() => data.filter((p) => p.status === 'Menunggu verifikasi').sort((a, b) => RANK[b.urgensi] - RANK[a.urgensi] || a.created_at - b.created_at), [data])
  const decided = useMemo(() => data.filter((p) => p.status !== 'Menunggu verifikasi').sort((a, b) => (b.updated_at ?? b.created_at) - (a.updated_at ?? a.created_at)), [data])
  const kw = q.trim().toLowerCase()
  const cari = (p: Pengajuan) => !kw || `${p.judul} ${p.pengaju_nama} ${p.kategori}`.toLowerCase().includes(kw)

  async function putuskan(p: Pengajuan, setuju: boolean) {
    if (!user || !p.id) return
    let alasan: string | undefined
    if (!setuju) {
      const a = await askReason({ title: 'Tolak pengajuan', desc: `Berikan alasan agar ${p.pengaju_nama} dapat memperbaiki pengajuannya.`, confirmText: 'Tolak pengajuan' })
      if (!a) return
      alasan = a
    }
    setBusy(p.id + setuju)
    try {
      await verifikasiPengajuan(p.id, setuju, user, alasan)
      toast('ok', setuju ? 'Pengajuan disetujui' : 'Pengajuan ditolak', 'Pengaju telah diberi tahu.')
    } catch (e) {
      toast('err', 'Gagal memproses', pesanError(e))
    }
    await reload(true)
    setBusy('')
  }

  const kpi = [
    { cls: 'peach', icon: Clock, n: pending.length, l: 'Menunggu verifikasi' },
    { cls: 'mint', icon: CheckCircle2, n: decided.filter((p) => p.status !== 'Ditolak').length, l: 'Telah diverifikasi' },
    { cls: 'blue', icon: XCircle, n: decided.filter((p) => p.status === 'Ditolak').length, l: 'Ditolak' },
  ]

  return (
    <>
      <PageHeader title="Verifikasi pengajuan" sub="Periksa kelengkapan data dan identitas pengaju. Pengajuan mendesak ditampilkan lebih dulu." />
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 22 }}>
        {kpi.map((k) => <div key={k.l} className={`kpi ${k.cls}`}><span className="ic"><k.icon size={22} /></span><div><b><AnimatedNumber value={k.n} /></b><small>{k.l}</small></div></div>)}
      </div>
      <div className="row row-wrap" style={{ marginBottom: 6 }}>
        <div className="tabs" style={{ marginBottom: 12 }}>
          <button className={`tab ${tab === 'menunggu' ? 'on' : ''}`} onClick={() => setTab('menunggu')}>Menunggu<span className="n">{pending.length}</span></button>
          <button className={`tab ${tab === 'riwayat' ? 'on' : ''}`} onClick={() => setTab('riwayat')}>Sudah diputuskan<span className="n">{decided.length}</span></button>
        </div>
        <span className="spacer" />
        <div className="input-icon" style={{ width: 260, marginBottom: 12 }}><Search size={16} className="lead" /><input className="input" style={{ borderRadius: 99 }} placeholder="Cari pengajuan..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari" /></div>
      </div>

      {loading ? <RowSkeletons /> : tab === 'menunggu' ? (
        pending.filter(cari).length === 0 ? (
          <EmptyState icon={PartyPopper} title="Tidak ada pengajuan menunggu" desc="Semua pengajuan sudah diperiksa. Kerja bagus." />
        ) : (
          <motion.div className="stack" variants={stagger} initial="hidden" animate="show">
            {pending.filter(cari).map((p) => (
              <motion.div key={p.id} variants={riseItem} layout className="card">
                <div className="row row-wrap" style={{ alignItems: 'flex-start', gap: 18 }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div className="row row-wrap" style={{ gap: 6, marginBottom: 10 }}><span className="badge badge-blue">{p.kategori}</span><UrgensiBadge urgensi={p.urgensi} />{p.jumlah && <span className="badge">{p.jumlah}</span>}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 600 }}>{p.judul}</h3>
                    <div className="row" style={{ gap: 8, margin: '8px 0 10px' }}><Avatar nama={p.pengaju_nama} size={26} /><small className="muted">{p.pengaju_nama} &middot; {p.pengaju_fakultas || '-'} &middot; {waktuRelatif(p.created_at)}</small></div>
                    <p className="pre" style={{ fontSize: 13.5, lineHeight: 1.65 }}>{p.deskripsi}</p>
                    {p.kondisi && <p className="muted pre" style={{ fontSize: 13, marginTop: 8 }}><b>Kondisi:</b> {p.kondisi}</p>}
                    {p.batas_waktu && <small className="muted" style={{ display: 'block', marginTop: 8 }}>Batas waktu: {tgl(p.batas_waktu)}</small>}
                  </div>
                  <div className="stack" style={{ gap: 8, minWidth: 170 }}>
                    <button className="btn btn-primary" onClick={() => putuskan(p, true)} disabled={!!busy}>{busy === p.id + 'true' ? <><Loader2 size={16} className="spin" /> Memproses</> : <><ShieldCheck size={16} /> Setujui</>}</button>
                    <button className="btn btn-danger" onClick={() => putuskan(p, false)} disabled={!!busy}><XCircle size={16} /> Tolak</button>
                    <Link to={`/bantuan/${p.id}`} className="btn btn-outline btn-sm"><Eye size={14} /> Lihat detail</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )
      ) : decided.filter(cari).length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Belum ada keputusan" desc="Pengajuan yang sudah kamu putuskan akan tampil di sini." />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Pengajuan</th><th>Pengaju</th><th>Jenis</th><th>Status</th><th>Diperbarui</th></tr></thead>
            <tbody>
              {decided.filter(cari).map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/bantuan/${p.id}`} style={{ fontWeight: 600 }}>{p.judul}</Link></td>
                  <td>{p.pengaju_nama}</td>
                  <td>{p.kategori}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="muted">{tgl(p.updated_at ?? p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
