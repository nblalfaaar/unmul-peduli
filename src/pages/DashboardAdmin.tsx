import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, Download, Gift, HeartHandshake, Trash2, Users } from 'lucide-react'
import { hapusPengajuan, hapusPenawaran, listPengajuanAll, listPenawaran, listUsers, pesanError } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { bulanTerakhir, kunciBulan, tgl, unduhCsv } from '../lib/format'
import type { Penawaran, Pengajuan, Profile } from '../lib/firebase'
import { AreaChart, BarList, Donut } from '../components/charts'
import { useFeedback } from '../components/Feedback'
import { AnimatedNumber, PageHeader, riseItem, RowSkeletons, StatusBadge, stagger } from '../components/ui'

export default function DashboardAdmin() {
  useTitle('Panel Admin')
  const { user } = useAuth()
  const { toast, confirm } = useFeedback()
  const [tab, setTab] = useState<'pengajuan' | 'penawaran'>('pengajuan')

  const { data, loading, reload } = useData(
    async () => {
      const [a, b, c] = await Promise.all([listPengajuanAll(), listPenawaran(), listUsers().catch(() => [] as Profile[])])
      return { a, b, c }
    },
    [],
    { a: [] as Pengajuan[], b: [] as Penawaran[], c: [] as Profile[] },
  )
  const { a, b, c } = data

  const bln = bulanTerakhir(6)
  const hitung = (arr: { created_at: number }[]) => bln.map((x) => arr.filter((i) => kunciBulan(i.created_at) === x.key).length)
  const st = (s: string[]) => a.filter((p) => s.includes(p.status)).length
  const donut = [
    { label: 'Menunggu verifikasi', value: st(['Menunggu verifikasi']), color: 'var(--c-peach-strong)' },
    { label: 'Terverifikasi', value: st(['Terverifikasi']), color: 'var(--c-steel)' },
    { label: 'Dalam proses', value: st(['Pencocokan', 'Penyaluran']), color: 'var(--c-primary)' },
    { label: 'Selesai', value: st(['Selesai']), color: 'var(--c-green)' },
    { label: 'Ditolak', value: st(['Ditolak']), color: 'var(--c-danger)' },
  ]
  const perKat = useMemo(() => Object.entries(a.reduce<Record<string, number>>((m, p) => ((m[p.kategori] = (m[p.kategori] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value })).sort((x, y) => y.value - x.value), [a])
  const perFak = useMemo(() => Object.entries(c.reduce<Record<string, number>>((m, u) => { const k = u.fakultas || 'Tidak diisi'; m[k] = (m[k] ?? 0) + 1; return m }, {})).map(([label, value]) => ({ label: label.replace('Fakultas ', ''), value })).sort((x, y) => y.value - x.value).slice(0, 6), [c])

  async function hapusA(id: string) {
    if (!user || !(await confirm({ title: 'Hapus pengajuan ini?', desc: 'Tindakan ini tidak dapat dibatalkan.', confirmText: 'Ya, hapus', danger: true }))) return
    try { await hapusPengajuan(id, user); toast('ok', 'Pengajuan dihapus'); reload(true) } catch (e) { toast('err', 'Gagal menghapus', pesanError(e)) }
  }
  async function hapusB(id: string) {
    if (!user || !(await confirm({ title: 'Hapus penawaran ini?', desc: 'Tindakan ini tidak dapat dibatalkan.', confirmText: 'Ya, hapus', danger: true }))) return
    try { await hapusPenawaran(id, user); toast('ok', 'Penawaran dihapus'); reload(true) } catch (e) { toast('err', 'Gagal menghapus', pesanError(e)) }
  }

  function ekspor() {
    unduhCsv(`rekap-bantuan-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Jenis', 'Judul', 'Kategori', 'Pihak 1', 'Pihak 2', 'Urgensi', 'Status', 'Tanggal dibuat'],
      ...a.map((p) => ['Pengajuan', p.judul, p.kategori, p.pengaju_nama, p.pemberi_nama, p.urgensi, p.status, tgl(p.created_at)]),
      ...b.map((p) => ['Penawaran', p.judul, p.kategori, p.pemberi_nama, p.pengklaim_nama, '', p.status, tgl(p.created_at)]),
    ])
    toast('ok', 'Rekap diunduh', 'Berkas CSV dapat dibuka di Excel.')
  }

  const kpis = [
    { cls: 'blue', icon: ClipboardList, n: a.length, l: 'Total pengajuan' },
    { cls: 'mint', icon: HeartHandshake, n: st(['Selesai']), l: 'Bantuan selesai' },
    { cls: 'peach', icon: Gift, n: b.length, l: 'Total penawaran' },
    { cls: 'plain', icon: Users, n: c.length, l: 'Pengguna terdaftar' },
  ]

  return (
    <>
      <PageHeader title="Panel admin" sub="Ringkasan aktivitas dan pengelolaan platform." actions={<><button className="btn btn-soft btn-sm" onClick={ekspor} disabled={loading}><Download size={15} /> Unduh rekap CSV</button><Link to="/admin/users" className="btn btn-primary btn-sm"><Users size={15} /> Kelola pengguna</Link></>} />
      <motion.div className="dash-grid" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={riseItem} className="col-12"><div className="kpis">{kpis.map((k) => <div key={k.l} className={`kpi ${k.cls}`}><span className="ic"><k.icon size={22} /></span><div><b><AnimatedNumber value={k.n} /></b><small>{k.l}</small></div></div>)}</div></motion.div>

        <motion.div variants={riseItem} className="col-4"><div className="card" style={{ height: '100%' }}>
          <div className="card-head"><h3 className="card-title">Status pengajuan</h3></div>
          <div className="row row-wrap" style={{ justifyContent: 'center', gap: 20 }}>
            <Donut data={donut} size={150} thickness={26} center={{ big: String(a.length), small: 'Pengajuan' }} />
            <div className="legend" style={{ flex: 1, minWidth: 130 }}>{donut.map((d) => <div key={d.label}><i style={{ background: d.color, width: 12, height: 12, borderRadius: 4 }} />{d.label}<b>{d.value}</b></div>)}</div>
          </div>
        </div></motion.div>
        <motion.div variants={riseItem} className="col-4"><div className="card" style={{ height: '100%' }}><div className="card-head"><h3 className="card-title">Pengajuan per jenis</h3></div>{perKat.length ? <BarList items={perKat} /> : <p className="muted center" style={{ padding: 30, fontSize: 13 }}>Belum ada data.</p>}</div></motion.div>
        <motion.div variants={riseItem} className="col-4"><div className="card" style={{ height: '100%' }}><div className="card-head"><h3 className="card-title">Pengguna per fakultas</h3></div>{perFak.length ? <BarList items={perFak} /> : <p className="muted center" style={{ padding: 30, fontSize: 13 }}>Belum ada data.</p>}</div></motion.div>

        <motion.div variants={riseItem} className="col-12"><div className="card">
          <div className="card-head"><h3 className="card-title">Aktivitas 6 bulan terakhir</h3></div>
          <AreaChart labels={bln.map((x) => x.label)} series={[{ name: 'Pengajuan', values: hitung(a), color: 'var(--c-green)' }, { name: 'Penawaran', values: hitung(b), color: 'var(--c-peach-strong)' }]} />
        </div></motion.div>

        <motion.div variants={riseItem} className="col-12">
          <div className="tabs">
            <button className={`tab ${tab === 'pengajuan' ? 'on' : ''}`} onClick={() => setTab('pengajuan')}>Pengajuan<span className="n">{a.length}</span></button>
            <button className={`tab ${tab === 'penawaran' ? 'on' : ''}`} onClick={() => setTab('penawaran')}>Penawaran<span className="n">{b.length}</span></button>
          </div>
          {loading ? <RowSkeletons n={3} /> : (
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Judul</th><th>{tab === 'pengajuan' ? 'Pengaju' : 'Pemberi'}</th><th>Jenis</th><th>Status</th><th>Tanggal</th><th /></tr></thead>
                <tbody>
                  {tab === 'pengajuan' ? a.map((p) => (
                    <tr key={p.id}><td><Link to={`/bantuan/${p.id}`} style={{ fontWeight: 600 }}>{p.judul}</Link></td><td>{p.pengaju_nama}</td><td>{p.kategori}</td><td><StatusBadge status={p.status} /></td><td className="muted">{tgl(p.created_at)}</td><td><button className="btn btn-danger btn-sm" onClick={() => hapusA(p.id!)} aria-label={`Hapus ${p.judul}`}><Trash2 size={14} /></button></td></tr>
                  )) : b.map((p) => (
                    <tr key={p.id}><td><Link to={`/penawaran/${p.id}`} style={{ fontWeight: 600 }}>{p.judul}</Link></td><td>{p.pemberi_nama}</td><td>{p.kategori}</td><td><StatusBadge status={p.status} /></td><td className="muted">{tgl(p.created_at)}</td><td><button className="btn btn-danger btn-sm" onClick={() => hapusB(p.id!)} aria-label={`Hapus ${p.judul}`}><Trash2 size={14} /></button></td></tr>
                  ))}
                  {(tab === 'pengajuan' ? a : b).length === 0 && <tr><td colSpan={6} className="muted center" style={{ padding: 30 }}>Belum ada data.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
