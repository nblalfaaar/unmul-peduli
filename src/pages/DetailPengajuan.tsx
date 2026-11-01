import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarClock, CheckCircle2, Clock, Gift, HeartHandshake, Info, Loader2, Package, Pencil, PackageCheck, Trash2, Undo2, UserRound, XCircle, Layers, Gauge, Building2 } from 'lucide-react'
import {
  ambilBantuan, batalkanBantuan, getKontak, getPengajuanById, hapusPengajuan, konfirmasiDiserahkan, konfirmasiDiterima,
  listPenawaran, listRiwayat, pesanError, simpanKontak, verifikasiPengajuan,
} from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { sisaHari, tgl } from '../lib/format'
import type { Kontak, Penawaran, Pengajuan, RiwayatStatus } from '../lib/firebase'
import { PageTop } from '../components/PageTop'
import { Back, KontakCard } from '../components/Detail'
import { useFeedback } from '../components/Feedback'
import { Avatar, EmptyState, StatusBadge, Stepper, Timeline, UrgensiBadge } from '../components/ui'

type Paket = { d: Pengajuan | null; r: RiwayatStatus[]; k: Kontak[]; cocok: Penawaran[] }

function Info2({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="info-item">
      <span className="ic">{icon}</span>
      <div><small>{label}</small><b>{value}</b></div>
    </div>
  )
}

export default function DetailPengajuan() {
  const { id = '' } = useParams<{ id: string }>()
  const { user } = useAuth()
  const nav = useNavigate()
  const { toast, confirm, askReason } = useFeedback()
  const [busy, setBusy] = useState('')

  const { data, loading, reload } = useData<Paket>(
    async () => {
      const d = await getPengajuanById(id)
      if (!d) return { d: null, r: [], k: [], cocok: [] }
      const pihak = !!user && (user.id === d.pengaju_id || user.id === d.pemberi_id || user.role === 'admin' || user.role === 'verifikator')
      const [r, k, off] = await Promise.all([
        listRiwayat('pengajuan', id),
        pihak && d.pemberi_id ? getKontak('pengajuan', id) : Promise.resolve([] as Kontak[]),
        user?.id === d.pengaju_id && d.status === 'Terverifikasi' ? listPenawaran().catch(() => []) : Promise.resolve([] as Penawaran[]),
      ])
      return { d, r, k, cocok: off.filter((o) => o.status === 'Tersedia' && o.kategori === d.kategori).slice(0, 3) }
    },
    [id, user?.id],
    { d: null, r: [], k: [], cocok: [] },
  )
  const { d, r, k, cocok } = data
  useTitle(d?.judul ?? 'Detail Pengajuan')

  const isOwner = !!user && user.id === d?.pengaju_id
  const isPemberi = !!user && user.id === d?.pemberi_id
  const isStaff = user?.role === 'admin' || user?.role === 'verifikator'
  const isAdmin = user?.role === 'admin'

  // jaga kontak sendiri tetap mutakhir untuk pihak terkait
  useEffect(() => {
    if (!user || !d?.id || !d.pemberi_id) return
    if (isOwner) simpanKontak('pengajuan', d.id, user, 'pengaju').catch(() => {})
    if (isPemberi) simpanKontak('pengajuan', d.id, user, 'pemberi').catch(() => {})
  }, [user, d?.id, d?.pemberi_id, isOwner, isPemberi])

  async function jalankan(kunci: string, fn: () => Promise<void>, sukses: string, desc?: string) {
    setBusy(kunci)
    try {
      await fn()
      toast('ok', sukses, desc)
      await reload(true)
    } catch (e) {
      toast('err', 'Aksi gagal', pesanError(e))
      await reload(true)
    }
    setBusy('')
  }

  async function ambil() {
    if (!user) return nav('/login', { state: { from: `/bantuan/${id}` } })
    const ok = await confirm({
      title: 'Bersedia membantu?',
      desc: 'Pengaju akan diberi tahu dan kontakmu dibagikan kepadanya untuk koordinasi penyerahan. Pengajuan ini tidak bisa diambil orang lain selama kamu membantu.',
      confirmText: 'Ya, saya bersedia',
    })
    if (ok) jalankan('ambil', () => ambilBantuan(id, user), 'Terima kasih sudah membantu', 'Pengaju telah diberi tahu. Silakan koordinasi penyerahan.')
  }
  async function batal() {
    if (!user) return
    if (await confirm({ title: 'Batalkan bantuan?', desc: 'Pengajuan akan kembali terbuka agar orang lain dapat membantu.', confirmText: 'Ya, batalkan', danger: true }))
      jalankan('batal', () => batalkanBantuan(id, user), 'Bantuan dibatalkan')
  }
  async function serahkan() {
    if (!user) return
    if (await confirm({ title: 'Sudah menyerahkan bantuan?', desc: 'Penerima akan diminta mengonfirmasi penerimaannya.', confirmText: 'Ya, sudah diserahkan' }))
      jalankan('serah', () => konfirmasiDiserahkan(id, user), 'Penyerahan dikonfirmasi')
  }
  async function terima() {
    if (!user) return
    if (await confirm({ title: 'Bantuan sudah diterima?', desc: 'Setelah dikonfirmasi, pengajuan ditandai selesai.', confirmText: 'Ya, sudah diterima' }))
      jalankan('terima', () => konfirmasiDiterima(id, user), 'Bantuan selesai', 'Terima kasih sudah memakai UNMUL Peduli.')
  }
  async function setujui() {
    if (!user) return
    jalankan('setuju', () => verifikasiPengajuan(id, true, user), 'Pengajuan disetujui', 'Pengaju telah diberi tahu.')
  }
  async function tolak() {
    if (!user) return
    const alasan = await askReason({ title: 'Tolak pengajuan', desc: 'Alasan akan tercatat dan dikirim ke pengaju.', confirmText: 'Tolak pengajuan' })
    if (alasan) jalankan('tolak', () => verifikasiPengajuan(id, false, user, alasan), 'Pengajuan ditolak')
  }
  async function hapus() {
    if (!user) return
    if (!(await confirm({ title: 'Hapus pengajuan ini?', desc: 'Tindakan ini tidak dapat dibatalkan.', confirmText: 'Ya, hapus', danger: true }))) return
    setBusy('hapus')
    try {
      await hapusPengajuan(id, user)
      toast('ok', 'Pengajuan dihapus')
      nav(isOwner ? '/pengajuan-saya' : '/bantuan', { replace: true })
    } catch (e) {
      toast('err', 'Gagal menghapus', pesanError(e))
      setBusy('')
    }
  }

  if (loading)
    return (
      <>
        <PageTop title="Memuat..." />
        <div className="container page-body"><div className="skel" style={{ height: 380, borderRadius: 24 }} /></div>
      </>
    )

  if (!d)
    return (
      <>
        <PageTop title="Pengajuan tidak ditemukan" desc="Pengajuan mungkin sudah dihapus, belum diverifikasi, atau kamu tidak memiliki akses." />
        <div className="container page-body">
          <EmptyState icon={Info} title="Tidak dapat menampilkan pengajuan" desc="Periksa kembali tautan atau masuk dengan akun yang sesuai." action={<Link to="/bantuan" className="btn btn-primary">Ke daftar pengajuan</Link>} />
        </div>
      </>
    )

  const sisa = sisaHari(d.batas_waktu)
  const Spin = ({ k2, children }: { k2: string; children: ReactNode }) => (busy === k2 ? <><Loader2 size={16} className="spin" /> Memproses...</> : <>{children}</>)

  return (
    <>
      <PageTop
        eyebrow={
          <>
            <Back to={isOwner ? '/pengajuan-saya' : '/bantuan'} label={isOwner ? 'Kembali ke aktivitas saya' : 'Kembali ke daftar pengajuan'} />
            <div className="row row-wrap" style={{ gap: 8 }}>
              <span className="badge badge-blue">{d.kategori}</span>
              <UrgensiBadge urgensi={d.urgensi} />
              <StatusBadge status={d.status} />
            </div>
          </>
        }
        title={d.judul}
        desc={`Diajukan oleh ${d.pengaju_nama} pada ${tgl(d.created_at)}`}
      />
      <div className="container page-body">
        <div className="detail-grid">
          <div className="stack" style={{ gap: 22 }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 14 }}>Progres bantuan</h3>
              {d.status === 'Ditolak' ? (
                <div className="alert alert-danger"><XCircle size={18} /><div><b>Pengajuan ditolak verifikator.</b>{d.alasan_penolakan && <div style={{ marginTop: 4 }}>Alasan: {d.alasan_penolakan}</div>}</div></div>
              ) : (
                <Stepper status={d.status} />
              )}
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 12 }}>Deskripsi kebutuhan</h3>
              <p className="pre" style={{ lineHeight: 1.75, fontSize: 14.5 }}>{d.deskripsi}</p>
              {d.kondisi && (
                <>
                  <h3 className="card-title" style={{ margin: '22px 0 10px' }}>Kondisi pengaju</h3>
                  <p className="pre" style={{ lineHeight: 1.75, fontSize: 14.5 }}>{d.kondisi}</p>
                </>
              )}
            </div>

            {r.length > 0 && (
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>Riwayat proses</h3>
                <Timeline items={r} />
              </div>
            )}
          </div>

          <aside className="stack sticky-card" style={{ gap: 18 }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 14 }}>Tindakan</h3>
              <div className="stack" style={{ gap: 10 }}>
                {d.status === 'Menunggu verifikasi' && isStaff && (
                  <>
                    <button className="btn btn-primary btn-block" onClick={setujui} disabled={!!busy}><Spin k2="setuju"><CheckCircle2 size={17} /> Setujui pengajuan</Spin></button>
                    <button className="btn btn-danger btn-block" onClick={tolak} disabled={!!busy}><XCircle size={17} /> Tolak dengan alasan</button>
                  </>
                )}
                {d.status === 'Menunggu verifikasi' && isOwner && (
                  <div className="alert alert-warn"><Clock size={18} /> Pengajuanmu menunggu pemeriksaan verifikator. Kamu masih bisa mengubahnya.</div>
                )}
                {d.status === 'Terverifikasi' && !isOwner && (
                  <button className="btn btn-peach btn-lg btn-block" onClick={ambil} disabled={!!busy}><Spin k2="ambil"><HeartHandshake size={18} /> {user ? 'Saya ingin membantu' : 'Masuk untuk membantu'}</Spin></button>
                )}
                {d.status === 'Terverifikasi' && isOwner && (
                  <div className="alert alert-ok"><CheckCircle2 size={18} /> Pengajuanmu sudah terverifikasi dan tampil di daftar. Menunggu pemberi bantuan.</div>
                )}
                {d.status === 'Pencocokan' && isPemberi && (
                  <>
                    <button className="btn btn-primary btn-block" onClick={serahkan} disabled={!!busy}><Spin k2="serah"><PackageCheck size={17} /> Konfirmasi sudah diserahkan</Spin></button>
                    <button className="btn btn-outline btn-block" onClick={batal} disabled={!!busy}><Undo2 size={16} /> Batalkan bantuan</button>
                  </>
                )}
                {d.status === 'Pencocokan' && isOwner && (
                  <div className="alert alert-info"><Info size={18} /> {d.pemberi_nama} bersedia membantu. Hubungi untuk koordinasi, lalu tunggu konfirmasi penyerahan.</div>
                )}
                {d.status === 'Penyaluran' && isOwner && (
                  <button className="btn btn-peach btn-lg btn-block" onClick={terima} disabled={!!busy}><Spin k2="terima"><CheckCircle2 size={18} /> Konfirmasi bantuan diterima</Spin></button>
                )}
                {d.status === 'Penyaluran' && isPemberi && (
                  <div className="alert alert-info"><Clock size={18} /> Menunggu penerima mengonfirmasi bantuan sudah diterima.</div>
                )}
                {d.status === 'Selesai' && (
                  <div className="alert alert-ok"><CheckCircle2 size={18} /> Bantuan ini sudah selesai. Terima kasih atas kepeduliannya.</div>
                )}
                {d.status === 'Ditolak' && isOwner && (
                  <Link to={`/ajukan/${id}/edit`} className="btn btn-primary btn-block"><Pencil size={16} /> Perbaiki &amp; ajukan ulang</Link>
                )}
                {isOwner && d.status === 'Menunggu verifikasi' && (
                  <Link to={`/ajukan/${id}/edit`} className="btn btn-outline btn-block"><Pencil size={16} /> Ubah pengajuan</Link>
                )}
                {((isOwner && ['Menunggu verifikasi', 'Terverifikasi', 'Ditolak'].includes(d.status)) || isAdmin) && (
                  <button className="btn btn-danger btn-block" onClick={hapus} disabled={!!busy}><Spin k2="hapus"><Trash2 size={16} /> Hapus pengajuan</Spin></button>
                )}
                {!user && d.status !== 'Terverifikasi' && <Link to="/login" className="btn btn-primary btn-block">Masuk untuk melihat tindakan</Link>}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 14 }}>Informasi</h3>
              <div className="info-list">
                <Info2 icon={<UserRound size={18} />} label="Pengaju" value={d.pengaju_nama} />
                <Info2 icon={<Building2 size={18} />} label="Fakultas / unit" value={d.pengaju_fakultas || 'Universitas Mulawarman'} />
                <Info2 icon={<Layers size={18} />} label="Jenis bantuan" value={d.kategori} />
                {d.jumlah && <Info2 icon={<Package size={18} />} label="Jumlah" value={d.jumlah} />}
                <Info2 icon={<Gauge size={18} />} label="Urgensi" value={{ rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi (mendesak)' }[d.urgensi]} />
                {d.batas_waktu && <Info2 icon={<CalendarClock size={18} />} label="Batas waktu" value={<>{tgl(d.batas_waktu)}{sisa !== null && <span className="muted" style={{ fontWeight: 400 }}> ({sisa < 0 ? 'terlewat' : `${sisa} hari lagi`})</span>}</>} />}
                {d.pemberi_nama && <Info2 icon={<HeartHandshake size={18} />} label="Pemberi bantuan" value={d.pemberi_nama} />}
              </div>
            </div>

            <KontakCard list={k} myId={user?.id} />

            {cocok.length > 0 && (
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 6 }}>Penawaran yang cocok</h3>
                <p className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>Ada yang menawarkan bantuan {d.kategori.toLowerCase()}. Mungkin sesuai kebutuhanmu.</p>
                {cocok.map((o) => (
                  <Link key={o.id} to={`/penawaran/${o.id}`} className="list-row">
                    <Avatar nama={o.pemberi_nama} size={36} />
                    <div className="grow"><b className="t">{o.judul}</b><small>{o.pemberi_nama}</small></div>
                    <Gift size={16} className="muted" />
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
