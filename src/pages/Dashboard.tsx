import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Gift, HandHeart, HeartHandshake, PackageCheck, Plus, ShieldCheck, Users, Wrench } from 'lucide-react'
import { listPengajuanAll, listPengajuanDibantu, listPengajuanMilik, listPenawaranMilik } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { bulanTerakhir, kunciBulan, waktuRelatif } from '../lib/format'
import type { Pengajuan, Penawaran } from '../lib/firebase'
import { AreaChart, BarList, Donut } from '../components/charts'
import { AnimatedNumber, Avatar, EmptyState, RowSkeletons, stagger, riseItem, StatusBadge } from '../components/ui'
import { useNotifikasi } from '../components/Chrome'

export default function Dashboard() {
  useTitle('Dashboard')
  const { user } = useAuth()
  const { unread } = useNotifikasi()
  const staff = user?.role === 'verifikator' || user?.role === 'admin'

  const { data, loading } = useData(
    async () => {
      if (!user) return { mine: [], offers: [], helped: [], pending: 0 }
      const [mine, offers, helped, all] = await Promise.all([
        listPengajuanMilik(user.id), listPenawaranMilik(user.id), listPengajuanDibantu(user.id),
        staff ? listPengajuanAll().catch(() => []) : Promise.resolve([] as Pengajuan[]),
      ])
      return { mine, offers, helped, pending: all.filter((p) => p.status === 'Menunggu verifikasi').length }
    },
    [user?.id],
    { mine: [] as Pengajuan[], offers: [] as Penawaran[], helped: [] as Pengajuan[], pending: 0 },
  )
  const { mine, offers, helped, pending } = data

  const aksi: { teks: string; sub: string; to: string; icon: typeof PackageCheck; tone: string }[] = [
    ...mine.filter((p) => p.status === 'Penyaluran').map((p) => ({ teks: 'Konfirmasi bantuan diterima', sub: p.judul, to: `/bantuan/${p.id}`, icon: CheckCircle2, tone: 'peach' })),
    ...mine.filter((p) => p.status === 'Ditolak').map((p) => ({ teks: 'Perbaiki pengajuan yang ditolak', sub: p.judul, to: `/bantuan/${p.id}`, icon: AlertTriangle, tone: 'peach' })),
    ...helped.filter((p) => p.status === 'Pencocokan').map((p) => ({ teks: 'Serahkan bantuan ke penerima', sub: p.judul, to: `/bantuan/${p.id}`, icon: PackageCheck, tone: 'blue' })),
    ...(staff && pending > 0 ? [{ teks: `${pending} pengajuan menunggu verifikasi`, sub: 'Tinjau dan putuskan', to: '/verifikasi', icon: ShieldCheck, tone: 'blue' }] : []),
  ]

  const bln = bulanTerakhir(6)
  const hitung = (arr: { created_at: number }[]) => bln.map((b) => arr.filter((x) => kunciBulan(x.created_at) === b.key).length)

  const st = (s: string[]) => mine.filter((p) => s.includes(p.status)).length
  const donut = [
    { label: 'Menunggu verifikasi', value: st(['Menunggu verifikasi']), color: 'var(--c-peach-strong)' },
    { label: 'Terverifikasi', value: st(['Terverifikasi']), color: 'var(--c-steel)' },
    { label: 'Dalam proses', value: st(['Pencocokan', 'Penyaluran']), color: 'var(--c-primary)' },
    { label: 'Selesai', value: st(['Selesai']), color: 'var(--c-green)' },
    { label: 'Ditolak', value: st(['Ditolak']), color: 'var(--c-danger)' },
  ]

  const perKat = Object.entries([...mine, ...offers].reduce<Record<string, number>>((a, x) => ((a[x.kategori] = (a[x.kategori] ?? 0) + 1), a), {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6)

  const kpis = [
    { cls: 'blue', icon: ClipboardList, n: mine.length, l: 'Pengajuan saya' },
    { cls: 'mint', icon: Gift, n: offers.length, l: 'Penawaran saya' },
    { cls: 'plain', icon: HeartHandshake, n: helped.length, l: 'Bantuan yang kuberikan' },
    { cls: 'peach', icon: AlertTriangle, n: aksi.length + unread, l: 'Perlu perhatian' },
  ]

  return (
    <motion.div className="dash-grid" variants={stagger} initial="hidden" animate="show">
      {staff && (
        <motion.div variants={riseItem} className="col-12">
          <div className="card row row-wrap" style={{ background: 'linear-gradient(120deg, var(--c-deep-2), var(--c-deep))', color: '#fff', border: 0 }}>
            <Wrench size={22} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <b style={{ display: 'block', fontWeight: 600 }}>Akses {user?.role === 'admin' ? 'administrator' : 'verifikator'}</b>
              <span style={{ fontSize: 13, opacity: 0.8 }}>{pending} pengajuan menunggu verifikasi.</span>
            </div>
            <Link to="/verifikasi" className="btn btn-light btn-sm"><ShieldCheck size={15} /> Verifikasi</Link>
            {user?.role === 'admin' && <Link to="/admin" className="btn btn-light btn-sm"><Users size={15} /> Panel admin</Link>}
          </div>
        </motion.div>
      )}

      <motion.div variants={riseItem} className="col-12">
        <h2 className="card-title" style={{ marginBottom: 12, fontSize: 17 }}>Ringkasan</h2>
        <div className="kpis">
          {kpis.map((k) => (
            <div key={k.l} className={`kpi ${k.cls}`}>
              <span className="ic"><k.icon size={22} /></span>
              <div><b><AnimatedNumber value={k.n} /></b><small>{k.l}</small></div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={riseItem} className="col-4">
        <div className="card" style={{ height: '100%' }}>
          <div className="card-head"><h3 className="card-title">Aksi cepat</h3></div>
          <div className="stack" style={{ gap: 10 }}>
            <Link to="/ajukan" className="btn btn-primary btn-block"><Plus size={17} /> Ajukan bantuan</Link>
            <Link to="/tawarkan" className="btn btn-soft btn-block"><Gift size={17} /> Tawarkan bantuan</Link>
            <Link to="/bantuan" className="btn btn-outline btn-block"><HandHeart size={17} /> Bantu seseorang</Link>
          </div>
        </div>
      </motion.div>

      <motion.div variants={riseItem} className="col-4">
        <div className="card" style={{ height: '100%' }}>
          <div className="card-head"><h3 className="card-title">Status pengajuan</h3></div>
          {mine.length === 0 ? <p className="muted center" style={{ padding: '36px 0', fontSize: 13 }}>Belum ada pengajuan.</p> : (
            <div className="row row-wrap" style={{ justifyContent: 'center', gap: 20 }}>
              <Donut data={donut} size={150} thickness={26} center={{ big: String(mine.length), small: 'Pengajuan' }} />
              <div className="legend" style={{ flex: 1, minWidth: 130 }}>
                {donut.filter((d) => d.value > 0).map((d) => <div key={d.label}><i style={{ background: d.color, width: 12, height: 12, borderRadius: 4 }} />{d.label}<b>{d.value}</b></div>)}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={riseItem} className="col-4">
        <div className="card" style={{ height: '100%' }}>
          <div className="card-head"><h3 className="card-title">Jenis bantuan</h3></div>
          {perKat.length === 0 ? <p className="muted center" style={{ padding: '36px 0', fontSize: 13 }}>Belum ada aktivitas.</p> : <BarList items={perKat} />}
        </div>
      </motion.div>

      <motion.div variants={riseItem} className="col-8">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Aktivitas 6 bulan terakhir</h3></div>
          <AreaChart labels={bln.map((b) => b.label)} series={[
            { name: 'Pengajuan', values: hitung(mine), color: 'var(--c-green)' },
            { name: 'Penawaran', values: hitung(offers), color: 'var(--c-peach-strong)' },
          ]} />
        </div>
      </motion.div>

      <motion.div variants={riseItem} className="col-4">
        <div className="card" style={{ height: '100%' }}>
          <div className="card-head"><h3 className="card-title">Perlu tindakanmu</h3>{aksi.length > 0 && <span className="badge badge-peach">{aksi.length}</span>}</div>
          {loading ? <RowSkeletons n={2} /> : aksi.length === 0 ? (
            <p className="muted center" style={{ padding: '30px 0', fontSize: 13 }}><CheckCircle2 size={28} style={{ margin: '0 auto 8px', color: 'var(--c-green)' }} />Semua beres. Tidak ada yang perlu ditindaklanjuti.</p>
          ) : aksi.slice(0, 5).map((a, i) => (
            <Link key={i} to={a.to} className="list-row">
              <span className={`kpi ${a.tone}`} style={{ padding: 0, border: 0, background: 'none' }}><span className="ic" style={{ width: 38, height: 38 }}><a.icon size={18} /></span></span>
              <div className="grow"><b className="t">{a.teks}</b><small className="clamp-2">{a.sub}</small></div>
              <ArrowRight size={16} className="muted" />
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={riseItem} className="col-6">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Pengajuan terbaru saya</h3><Link to="/pengajuan-saya" className="btn btn-ghost btn-sm">Semua <ArrowRight size={14} /></Link></div>
          {loading ? <RowSkeletons n={3} /> : mine.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Belum ada pengajuan" desc="Ceritakan kebutuhanmu, kami bantu menghubungkan." action={<Link to="/ajukan" className="btn btn-primary btn-sm">Ajukan bantuan</Link>} />
          ) : mine.slice(0, 4).map((p) => (
            <Link key={p.id} to={`/bantuan/${p.id}`} className="list-row">
              <div className="grow"><b className="t">{p.judul}</b><small>{p.kategori} &middot; {waktuRelatif(p.created_at)}</small></div>
              <StatusBadge status={p.status} />
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={riseItem} className="col-6">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Bantuan yang kuberikan</h3></div>
          {loading ? <RowSkeletons n={3} /> : helped.length === 0 && offers.length === 0 ? (
            <EmptyState icon={HeartHandshake} title="Belum ada bantuan diberikan" desc="Bantu pengajuan terbuka atau tawarkan sesuatu." action={<Link to="/bantuan" className="btn btn-primary btn-sm">Lihat pengajuan</Link>} />
          ) : (
            <>
              {helped.slice(0, 3).map((p) => (
                <Link key={p.id} to={`/bantuan/${p.id}`} className="list-row">
                  <Avatar nama={p.pengaju_nama} size={36} />
                  <div className="grow"><b className="t">{p.judul}</b><small>Untuk {p.pengaju_nama}</small></div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
              {offers.slice(0, 3).map((p) => (
                <Link key={p.id} to={`/penawaran/${p.id}`} className="list-row">
                  <span className="avatar" style={{ ['--s' as string]: '36px', background: 'var(--c-peach-strong)' }}><Gift size={16} /></span>
                  <div className="grow"><b className="t">{p.judul}</b><small>Penawaran &middot; {waktuRelatif(p.created_at)}</small></div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
