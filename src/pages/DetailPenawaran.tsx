import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Gift, HandHeart, Info, Layers, Loader2, Package, Trash2, UserRound, Building2 } from 'lucide-react'
import { getKontak, getPenawaranById, hapusPenawaran, klaimPenawaran, listPengajuanPublik, listRiwayat, pesanError, simpanKontak } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { tgl } from '../lib/format'
import type { Kontak, Penawaran, Pengajuan, RiwayatStatus } from '../lib/firebase'
import { PageTop } from '../components/PageTop'
import { Back, KontakCard } from '../components/Detail'
import { useFeedback } from '../components/Feedback'
import { Avatar, EmptyState, StatusBadge, Timeline, UrgensiBadge } from '../components/ui'

type Paket = { d: Penawaran | null; r: RiwayatStatus[]; k: Kontak[]; cocok: Pengajuan[] }

function Item({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="info-item">
      <span className="ic">{icon}</span>
      <div><small>{label}</small><b>{value}</b></div>
    </div>
  )
}

export default function DetailPenawaran() {
  const { id = '' } = useParams<{ id: string }>()
  const { user } = useAuth()
  const nav = useNavigate()
  const { toast, confirm } = useFeedback()
  const [busy, setBusy] = useState('')

  const { data, loading, reload } = useData<Paket>(
    async () => {
      const d = await getPenawaranById(id)
      if (!d) return { d: null, r: [], k: [], cocok: [] }
      const pihak = !!user && (user.id === d.pemberi_id || user.id === d.pengklaim_id || user.role === 'admin')
      const [r, k, req] = await Promise.all([
        listRiwayat('penawaran', id),
        pihak && d.pengklaim_id ? getKontak('penawaran', id) : Promise.resolve([] as Kontak[]),
        user?.id === d.pemberi_id && d.status === 'Tersedia' ? listPengajuanPublik().catch(() => []) : Promise.resolve([] as Pengajuan[]),
      ])
      const rank = { rendah: 0, sedang: 1, tinggi: 2 }
      return {
        d, r, k,
        cocok: req.filter((p) => p.status === 'Terverifikasi' && p.kategori === d.kategori && p.pengaju_id !== user?.id).sort((a, b) => rank[b.urgensi] - rank[a.urgensi]).slice(0, 3),
      }
    },
    [id, user?.id],
    { d: null, r: [], k: [], cocok: [] },
  )
  const { d, r, k, cocok } = data
  useTitle(d?.judul ?? 'Detail Penawaran')

  const isOwner = !!user && user.id === d?.pemberi_id
  const isKlaim = !!user && user.id === d?.pengklaim_id
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!user || !d?.id || !d.pengklaim_id) return
    if (isOwner) simpanKontak('penawaran', d.id, user, 'pemberi').catch(() => {})
    if (isKlaim) simpanKontak('penawaran', d.id, user, 'pengklaim').catch(() => {})
  }, [user, d?.id, d?.pengklaim_id, isOwner, isKlaim])

  async function klaim() {
    if (!user) return nav('/login', { state: { from: `/penawaran/${id}` } })
    if (!(await confirm({ title: 'Klaim bantuan ini?', desc: 'Pemberi akan diberi tahu dan kontakmu dibagikan untuk koordinasi penyerahan.', confirmText: 'Ya, klaim' }))) return
    setBusy('klaim')
    try {
      await klaimPenawaran(id, user)
      toast('ok', 'Klaim berhasil', 'Pemberi telah diberi tahu. Silakan koordinasi penyerahan.')
    } catch (e) {
      toast('err', 'Klaim gagal', pesanError(e))
    }
    await reload(true)
    setBusy('')
  }

  async function hapus() {
    if (!user) return
    if (!(await confirm({ title: 'Hapus penawaran ini?', desc: 'Tindakan ini tidak dapat dibatalkan.', confirmText: 'Ya, hapus', danger: true }))) return
    setBusy('hapus')
    try {
      await hapusPenawaran(id, user)
      toast('ok', 'Penawaran dihapus')
      nav(isOwner ? '/pengajuan-saya' : '/penawaran', { replace: true })
    } catch (e) {
      toast('err', 'Gagal menghapus', pesanError(e))
      setBusy('')
    }
  }

  if (loading)
    return (
      <>
        <PageTop title="Memuat..." />
        <div className="container page-body"><div className="skel" style={{ height: 340, borderRadius: 24 }} /></div>
      </>
    )

  if (!d)
    return (
      <>
        <PageTop title="Penawaran tidak ditemukan" desc="Penawaran mungkin sudah dihapus." />
        <div className="container page-body">
          <EmptyState icon={Info} title="Tidak dapat menampilkan penawaran" action={<Link to="/penawaran" className="btn btn-primary">Ke daftar penawaran</Link>} />
        </div>
      </>
    )

  return (
    <>
      <PageTop
        eyebrow={
          <>
            <Back to="/penawaran" label="Kembali ke daftar penawaran" />
            <div className="row row-wrap" style={{ gap: 8 }}><span className="badge badge-blue">{d.kategori}</span><StatusBadge status={d.status} /></div>
          </>
        }
        title={d.judul}
        desc={`Ditawarkan oleh ${d.pemberi_nama} pada ${tgl(d.created_at)}`}
      />
      <div className="container page-body">
        <div className="detail-grid">
          <div className="stack" style={{ gap: 22 }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 12 }}>Detail bantuan</h3>
              <p className="pre" style={{ lineHeight: 1.75, fontSize: 14.5 }}>{d.deskripsi}</p>
            </div>
            {r.length > 0 && (
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>Riwayat</h3>
                <Timeline items={r} />
              </div>
            )}
          </div>

          <aside className="stack sticky-card" style={{ gap: 18 }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 14 }}>Tindakan</h3>
              <div className="stack" style={{ gap: 10 }}>
                {d.status === 'Tersedia' && !isOwner && (
                  <button className="btn btn-peach btn-lg btn-block" onClick={klaim} disabled={!!busy}>
                    {busy === 'klaim' ? <><Loader2 size={18} className="spin" /> Memproses...</> : <><Gift size={18} /> {user ? 'Klaim bantuan ini' : 'Masuk untuk klaim'}</>}
                  </button>
                )}
                {d.status === 'Tersedia' && isOwner && <div className="alert alert-ok"><CheckCircle2 size={18} /> Penawaranmu tampil di daftar dan menunggu diklaim.</div>}
                {d.status === 'Terpakai' && (
                  <div className="alert alert-info"><Info size={18} /> Sudah diklaim{d.pengklaim_nama ? ` oleh ${d.pengklaim_nama}` : ''}. {(isOwner || isKlaim) && 'Silakan koordinasi penyerahan lewat kontak di bawah.'}</div>
                )}
                {((isOwner && d.status === 'Tersedia') || isAdmin) && (
                  <button className="btn btn-danger btn-block" onClick={hapus} disabled={!!busy}>
                    {busy === 'hapus' ? <><Loader2 size={16} className="spin" /> Memproses...</> : <><Trash2 size={16} /> Hapus penawaran</>}
                  </button>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 14 }}>Informasi</h3>
              <div className="info-list">
                <Item icon={<UserRound size={18} />} label="Pemberi" value={d.pemberi_nama} />
                <Item icon={<Building2 size={18} />} label="Fakultas / unit" value={d.pemberi_fakultas || 'Universitas Mulawarman'} />
                <Item icon={<Layers size={18} />} label="Jenis bantuan" value={d.kategori} />
                {d.jumlah && <Item icon={<Package size={18} />} label="Jumlah" value={d.jumlah} />}
                {d.pengklaim_nama && <Item icon={<HandHeart size={18} />} label="Diklaim oleh" value={d.pengklaim_nama} />}
              </div>
            </div>

            <KontakCard list={k} myId={user?.id} />

            {cocok.length > 0 && (
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 6 }}>Pengajuan yang cocok</h3>
                <p className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>Ada yang membutuhkan bantuan {d.kategori.toLowerCase()}. Pertimbangkan membantu langsung.</p>
                {cocok.map((p) => (
                  <Link key={p.id} to={`/bantuan/${p.id}`} className="list-row">
                    <Avatar nama={p.pengaju_nama} size={36} />
                    <div className="grow"><b className="t">{p.judul}</b><small>{p.pengaju_nama}</small></div>
                    <UrgensiBadge urgensi={p.urgensi} />
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
