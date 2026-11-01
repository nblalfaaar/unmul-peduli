import {
  addDoc, collection, deleteField, doc, getDoc, getDocs, onSnapshot, orderBy, query,
  runTransaction, setDoc, updateDoc, where, writeBatch, type Transaction,
} from 'firebase/firestore'
import {
  db, type Kontak, type Notifikasi, type Penawaran, type Pengajuan, type Profile,
  type RiwayatStatus, type StatusPengajuan,
} from './firebase'
import { STATUS_PUBLIK } from './constants'

export type Pelaku = { id: string; nama: string; no_hp?: string }

const col = {
  pengajuan: collection(db, 'pengajuan'),
  penawaran: collection(db, 'penawaran'),
  notifikasi: collection(db, 'notifikasi'),
  users: collection(db, 'users'),
  riwayat: collection(db, 'riwayat_status'),
}

/** Firestore menolak nilai undefined, jadi buang dulu. */
function bersih<T extends Record<string, unknown>>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T
}

export function pesanError(e: unknown): string {
  const err = e as { code?: string; message?: string }
  if (err?.code === 'permission-denied') return 'Kamu tidak punya izin untuk aksi ini.'
  if (err?.code === 'unavailable') return 'Koneksi bermasalah. Periksa internetmu lalu coba lagi.'
  return err?.message || 'Terjadi kesalahan. Coba lagi.'
}

const byNewest = <T extends { created_at: number }>(a: T, b: T) => b.created_at - a.created_at

// ============ RIWAYAT ============
export async function listRiwayat(entitas: 'pengajuan' | 'penawaran', id: string): Promise<RiwayatStatus[]> {
  try {
    const snap = await getDocs(query(col.riwayat, where('entitas_id', '==', id)))
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as RiwayatStatus)
      .filter((r) => r.entitas === entitas)
      .sort((a, b) => a.created_at - b.created_at)
  } catch {
    return []
  }
}

// ============ KONTAK (subkoleksi, hanya untuk pihak terkait) ============
export async function getKontak(entitas: 'pengajuan' | 'penawaran', id: string): Promise<Kontak[]> {
  try {
    const snap = await getDocs(collection(db, entitas, id, 'kontak'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Kontak)
  } catch {
    return []
  }
}

export async function simpanKontak(entitas: 'pengajuan' | 'penawaran', id: string, pelaku: Pelaku, peran: Kontak['peran']) {
  await setDoc(doc(db, entitas, id, 'kontak', pelaku.id), bersih({ nama: pelaku.nama, no_hp: pelaku.no_hp, peran }))
}

// ============ NOTIFIKASI ============
export async function kirimNotif(penerima_id: string | undefined, pesan: string, link?: string) {
  if (!penerima_id) return
  try {
    await addDoc(col.notifikasi, bersih({ penerima_id, pesan, link, status_baca: false, created_at: Date.now() }))
  } catch {
    /* notifikasi gagal tidak boleh membatalkan aksi utama */
  }
}

export function subscribeNotifikasi(userId: string, cb: (list: Notifikasi[]) => void): () => void {
  return onSnapshot(
    query(col.notifikasi, where('penerima_id', '==', userId)),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Notifikasi).sort(byNewest)),
    () => cb([]),
  )
}

export async function tandaiNotifDibaca(id: string) {
  await updateDoc(doc(db, 'notifikasi', id), { status_baca: true })
}

export async function tandaiSemuaNotifDibaca(ids: string[]) {
  for (let i = 0; i < ids.length; i += 400) {
    const batch = writeBatch(db)
    ids.slice(i, i + 400).forEach((id) => batch.update(doc(db, 'notifikasi', id), { status_baca: true }))
    await batch.commit()
  }
}

// ============ PENGAJUAN ============
type DataPengajuan = Pick<Pengajuan, 'judul' | 'kategori' | 'deskripsi' | 'jumlah' | 'kondisi' | 'batas_waktu' | 'urgensi'>

export async function createPengajuan(data: DataPengajuan, pelaku: Pelaku & { fakultas?: string }) {
  const ref = doc(col.pengajuan)
  const batch = writeBatch(db)
  batch.set(
    ref,
    bersih({
      ...data,
      pengaju_id: pelaku.id,
      pengaju_nama: pelaku.nama,
      pengaju_fakultas: pelaku.fakultas,
      status: 'Menunggu verifikasi',
      created_at: Date.now(),
    }),
  )
  batch.set(doc(col.riwayat), {
    entitas: 'pengajuan', entitas_id: ref.id, status_lama: '-', status_baru: 'Menunggu verifikasi',
    pelaku_id: pelaku.id, pelaku_nama: pelaku.nama, keterangan: 'Pengajuan dibuat', created_at: Date.now(),
  })
  batch.set(doc(db, 'pengajuan', ref.id, 'kontak', pelaku.id), bersih({ nama: pelaku.nama, no_hp: pelaku.no_hp, peran: 'pengaju' }))
  await batch.commit()
  return ref.id
}

export async function listPengajuanPublik(): Promise<Pengajuan[]> {
  const snap = await getDocs(query(col.pengajuan, where('status', 'in', STATUS_PUBLIK)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pengajuan).sort(byNewest)
}

export async function listPengajuanAll(): Promise<Pengajuan[]> {
  const snap = await getDocs(query(col.pengajuan, orderBy('created_at', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pengajuan)
}

export async function listPengajuanMilik(userId: string): Promise<Pengajuan[]> {
  const snap = await getDocs(query(col.pengajuan, where('pengaju_id', '==', userId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pengajuan).sort(byNewest)
}

export async function listPengajuanDibantu(userId: string): Promise<Pengajuan[]> {
  const snap = await getDocs(query(col.pengajuan, where('pemberi_id', '==', userId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pengajuan).sort(byNewest)
}

export async function getPengajuanById(id: string): Promise<Pengajuan | null> {
  try {
    const snap = await getDoc(doc(db, 'pengajuan', id))
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Pengajuan) : null
  } catch {
    return null
  }
}

type Transisi = {
  dari: StatusPengajuan[]
  ke: StatusPengajuan
  pelaku: Pelaku
  keterangan?: string
  patch?: Record<string, unknown>
  validasi?: (cur: Pengajuan) => void
  tambahan?: (tx: Transaction, cur: Pengajuan) => void
}

/** Semua perubahan status lewat transaksi: status dicek ulang di server sehingga tidak ada tabrakan antar pengguna. */
async function transisi(id: string, t: Transisi): Promise<Pengajuan> {
  const ref = doc(db, 'pengajuan', id)
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error('Pengajuan tidak ditemukan atau sudah dihapus.')
    const cur = { id, ...snap.data() } as Pengajuan
    if (!t.dari.includes(cur.status)) throw new Error(`Status pengajuan sudah berubah menjadi "${cur.status}". Muat ulang halaman.`)
    t.validasi?.(cur)
    tx.update(ref, { status: t.ke, updated_at: Date.now(), ...t.patch })
    tx.set(doc(col.riwayat), bersih({
      entitas: 'pengajuan', entitas_id: id, status_lama: cur.status, status_baru: t.ke,
      pelaku_id: t.pelaku.id, pelaku_nama: t.pelaku.nama, keterangan: t.keterangan, created_at: Date.now(),
    }))
    t.tambahan?.(tx, cur)
    return cur
  })
}

export async function verifikasiPengajuan(id: string, setuju: boolean, pelaku: Pelaku, alasan?: string) {
  if (!setuju && !alasan?.trim()) throw new Error('Alasan penolakan wajib diisi.')
  const cur = await transisi(id, {
    dari: ['Menunggu verifikasi'],
    ke: setuju ? 'Terverifikasi' : 'Ditolak',
    pelaku,
    keterangan: setuju ? `Disetujui oleh ${pelaku.nama}` : `Ditolak: ${alasan!.trim()}`,
    patch: { alasan_penolakan: setuju ? deleteField() : alasan!.trim() },
  })
  await kirimNotif(
    cur.pengaju_id,
    setuju
      ? `Pengajuan "${cur.judul}" telah diverifikasi dan tampil di daftar bantuan.`
      : `Pengajuan "${cur.judul}" ditolak. Alasan: ${alasan!.trim()}`,
    `/bantuan/${id}`,
  )
}

export async function ambilBantuan(id: string, pelaku: Pelaku) {
  const cur = await transisi(id, {
    dari: ['Terverifikasi'],
    ke: 'Pencocokan',
    pelaku,
    keterangan: `${pelaku.nama} bersedia membantu`,
    patch: { pemberi_id: pelaku.id, pemberi_nama: pelaku.nama },
    validasi: (c) => {
      if (c.pengaju_id === pelaku.id) throw new Error('Kamu tidak bisa membantu pengajuanmu sendiri.')
    },
    tambahan: (tx) =>
      tx.set(doc(db, 'pengajuan', id, 'kontak', pelaku.id), bersih({ nama: pelaku.nama, no_hp: pelaku.no_hp, peran: 'pemberi' })),
  })
  await kirimNotif(cur.pengaju_id, `${pelaku.nama} bersedia membantu pengajuan "${cur.judul}". Silakan koordinasi penyerahan.`, `/bantuan/${id}`)
}

export async function batalkanBantuan(id: string, pelaku: Pelaku) {
  const cur = await transisi(id, {
    dari: ['Pencocokan'],
    ke: 'Terverifikasi',
    pelaku,
    keterangan: `${pelaku.nama} membatalkan kesediaan membantu`,
    patch: { pemberi_id: deleteField(), pemberi_nama: deleteField() },
    validasi: (c) => {
      if (c.pemberi_id !== pelaku.id) throw new Error('Hanya pemberi bantuan yang dapat membatalkan.')
    },
    tambahan: (tx) => tx.delete(doc(db, 'pengajuan', id, 'kontak', pelaku.id)),
  })
  await kirimNotif(cur.pengaju_id, `${pelaku.nama} membatalkan bantuan untuk "${cur.judul}". Pengajuan kembali terbuka.`, `/bantuan/${id}`)
}

export async function konfirmasiDiserahkan(id: string, pelaku: Pelaku) {
  const cur = await transisi(id, {
    dari: ['Pencocokan'],
    ke: 'Penyaluran',
    pelaku,
    keterangan: 'Pemberi menandai bantuan sudah diserahkan',
    validasi: (c) => {
      if (c.pemberi_id !== pelaku.id) throw new Error('Hanya pemberi bantuan yang dapat mengonfirmasi penyerahan.')
    },
  })
  await kirimNotif(cur.pengaju_id, `Bantuan untuk "${cur.judul}" ditandai sudah diserahkan. Mohon konfirmasi penerimaan.`, `/bantuan/${id}`)
}

export async function konfirmasiDiterima(id: string, pelaku: Pelaku) {
  const cur = await transisi(id, {
    dari: ['Penyaluran'],
    ke: 'Selesai',
    pelaku,
    keterangan: 'Penerima mengonfirmasi bantuan sudah diterima',
    validasi: (c) => {
      if (c.pengaju_id !== pelaku.id) throw new Error('Hanya penerima bantuan yang dapat mengonfirmasi penerimaan.')
    },
  })
  await kirimNotif(cur.pemberi_id, `Penerima mengonfirmasi bantuan "${cur.judul}" sudah diterima. Terima kasih sudah berbagi.`, `/bantuan/${id}`)
}

/** Edit hanya boleh sebelum diverifikasi (atau setelah ditolak, sekaligus diajukan ulang). */
export async function editPengajuan(id: string, data: DataPengajuan, pelaku: Pelaku) {
  const ref = doc(db, 'pengajuan', id)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error('Pengajuan tidak ditemukan.')
    const cur = snap.data() as Pengajuan
    if (cur.pengaju_id !== pelaku.id) throw new Error('Kamu hanya dapat mengubah pengajuan milikmu.')
    if (cur.status !== 'Menunggu verifikasi' && cur.status !== 'Ditolak')
      throw new Error('Pengajuan sudah diverifikasi sehingga tidak dapat diubah.')
    const resubmit = cur.status === 'Ditolak'
    tx.update(ref, {
      ...bersih({ ...data }),
      jumlah: data.jumlah ?? deleteField(),
      kondisi: data.kondisi ?? deleteField(),
      batas_waktu: data.batas_waktu ?? deleteField(),
      status: 'Menunggu verifikasi',
      alasan_penolakan: deleteField(),
      updated_at: Date.now(),
    })
    tx.set(doc(col.riwayat), {
      entitas: 'pengajuan', entitas_id: id, status_lama: cur.status, status_baru: 'Menunggu verifikasi',
      pelaku_id: pelaku.id, pelaku_nama: pelaku.nama,
      keterangan: resubmit ? 'Pengajuan diperbaiki dan diajukan ulang' : 'Pengajuan diedit', created_at: Date.now(),
    })
    tx.set(doc(db, 'pengajuan', id, 'kontak', pelaku.id), bersih({ nama: pelaku.nama, no_hp: pelaku.no_hp, peran: 'pengaju' }))
  })
}

export async function hapusPengajuan(id: string, pelaku: Pick<Profile, 'id' | 'role'>) {
  const cur = await getPengajuanById(id)
  if (!cur) throw new Error('Pengajuan tidak ditemukan.')
  const admin = pelaku.role === 'admin'
  const pemilik = cur.pengaju_id === pelaku.id
  if (!admin && !(pemilik && ['Menunggu verifikasi', 'Terverifikasi', 'Ditolak'].includes(cur.status)))
    throw new Error('Pengajuan yang sudah dicocokkan tidak dapat dihapus.')
  const batch = writeBatch(db)
  batch.delete(doc(db, 'pengajuan', id, 'kontak', cur.pengaju_id))
  if (cur.pemberi_id) batch.delete(doc(db, 'pengajuan', id, 'kontak', cur.pemberi_id))
  batch.delete(doc(db, 'pengajuan', id))
  await batch.commit()
}

// ============ PENAWARAN ============
type DataPenawaran = Pick<Penawaran, 'judul' | 'kategori' | 'deskripsi' | 'jumlah'>

export async function createPenawaran(data: DataPenawaran, pelaku: Pelaku & { fakultas?: string }) {
  const ref = doc(col.penawaran)
  const batch = writeBatch(db)
  batch.set(ref, bersih({
    ...data, pemberi_id: pelaku.id, pemberi_nama: pelaku.nama, pemberi_fakultas: pelaku.fakultas,
    status: 'Tersedia', created_at: Date.now(),
  }))
  batch.set(doc(col.riwayat), {
    entitas: 'penawaran', entitas_id: ref.id, status_lama: '-', status_baru: 'Tersedia',
    pelaku_id: pelaku.id, pelaku_nama: pelaku.nama, keterangan: 'Penawaran dibuat', created_at: Date.now(),
  })
  batch.set(doc(db, 'penawaran', ref.id, 'kontak', pelaku.id), bersih({ nama: pelaku.nama, no_hp: pelaku.no_hp, peran: 'pemberi' }))
  await batch.commit()
  return ref.id
}

export async function listPenawaran(): Promise<Penawaran[]> {
  const snap = await getDocs(query(col.penawaran, orderBy('created_at', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Penawaran)
}

export async function listPenawaranMilik(userId: string): Promise<Penawaran[]> {
  const snap = await getDocs(query(col.penawaran, where('pemberi_id', '==', userId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Penawaran).sort(byNewest)
}

export async function getPenawaranById(id: string): Promise<Penawaran | null> {
  try {
    const snap = await getDoc(doc(db, 'penawaran', id))
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Penawaran) : null
  } catch {
    return null
  }
}

export async function klaimPenawaran(id: string, pelaku: Pelaku) {
  const ref = doc(db, 'penawaran', id)
  const cur = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error('Penawaran tidak ditemukan atau sudah dihapus.')
    const p = { id, ...snap.data() } as Penawaran
    if (p.status !== 'Tersedia') throw new Error('Maaf, penawaran ini sudah diklaim pengguna lain.')
    if (p.pemberi_id === pelaku.id) throw new Error('Kamu tidak bisa mengklaim penawaranmu sendiri.')
    tx.update(ref, { status: 'Terpakai', pengklaim_id: pelaku.id, pengklaim_nama: pelaku.nama, updated_at: Date.now() })
    tx.set(doc(col.riwayat), {
      entitas: 'penawaran', entitas_id: id, status_lama: 'Tersedia', status_baru: 'Terpakai',
      pelaku_id: pelaku.id, pelaku_nama: pelaku.nama, keterangan: `${pelaku.nama} mengklaim bantuan`, created_at: Date.now(),
    })
    tx.set(doc(db, 'penawaran', id, 'kontak', pelaku.id), bersih({ nama: pelaku.nama, no_hp: pelaku.no_hp, peran: 'pengklaim' }))
    return p
  })
  await kirimNotif(cur.pemberi_id, `${pelaku.nama} mengklaim penawaranmu "${cur.judul}". Silakan koordinasi penyerahan.`, `/penawaran/${id}`)
}

export async function hapusPenawaran(id: string, pelaku: Pick<Profile, 'id' | 'role'>) {
  const cur = await getPenawaranById(id)
  if (!cur) throw new Error('Penawaran tidak ditemukan.')
  const admin = pelaku.role === 'admin'
  if (!admin && !(cur.pemberi_id === pelaku.id && cur.status === 'Tersedia'))
    throw new Error('Penawaran yang sudah diklaim tidak dapat dihapus.')
  const batch = writeBatch(db)
  batch.delete(doc(db, 'penawaran', id, 'kontak', cur.pemberi_id))
  if (cur.pengklaim_id) batch.delete(doc(db, 'penawaran', id, 'kontak', cur.pengklaim_id))
  batch.delete(doc(db, 'penawaran', id))
  await batch.commit()
}

// ============ USERS ============
export async function listUsers(): Promise<Profile[]> {
  const snap = await getDocs(col.users)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Profile)
}

export async function updateUserRole(userId: string, role: Profile['role']) {
  await updateDoc(doc(db, 'users', userId), { role })
}

export async function updateUserStatus(userId: string, status: 'aktif' | 'nonaktif') {
  await updateDoc(doc(db, 'users', userId), { status_akun: status })
}

export async function updateProfile(userId: string, data: Partial<Pick<Profile, 'nama' | 'fakultas' | 'nim' | 'no_hp' | 'bio'>>) {
  await updateDoc(doc(db, 'users', userId), bersih({ ...data }))
}
