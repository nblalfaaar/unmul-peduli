import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export type Role = 'mahasiswa' | 'admin' | 'verifikator'

export type StatusPengajuan =
  | 'Menunggu verifikasi'
  | 'Terverifikasi'
  | 'Ditolak'
  | 'Pencocokan'
  | 'Penyaluran'
  | 'Selesai'

export type Urgensi = 'rendah' | 'sedang' | 'tinggi'

export type Profile = {
  id: string
  nama: string
  email: string
  role: Role
  fakultas?: string
  nim?: string
  no_hp?: string
  bio?: string
  status_akun?: 'aktif' | 'nonaktif'
  created_at?: number
}

export type Pengajuan = {
  id?: string
  pengaju_id: string
  pengaju_nama: string
  pengaju_fakultas?: string
  judul: string
  kategori: string
  deskripsi: string
  jumlah?: string
  kondisi?: string
  batas_waktu?: number
  urgensi: Urgensi
  status: StatusPengajuan
  alasan_penolakan?: string
  pemberi_id?: string
  pemberi_nama?: string
  created_at: number
  updated_at?: number
}

export type Penawaran = {
  id?: string
  pemberi_id: string
  pemberi_nama: string
  pemberi_fakultas?: string
  judul: string
  kategori: string
  deskripsi: string
  jumlah?: string
  status: 'Tersedia' | 'Terpakai' | 'Dibatalkan'
  pengklaim_id?: string
  pengklaim_nama?: string
  created_at: number
  updated_at?: number
}

export type Notifikasi = {
  id: string
  penerima_id: string
  pesan: string
  link?: string
  status_baca: boolean
  created_at: number
}

export type RiwayatStatus = {
  id?: string
  entitas: 'pengajuan' | 'penawaran'
  entitas_id: string
  status_lama: string
  status_baru: string
  keterangan?: string
  pelaku_id: string
  pelaku_nama: string
  created_at: number
}

export type Kontak = {
  id: string
  nama: string
  no_hp?: string
  peran: 'pengaju' | 'pemberi' | 'pengklaim'
}
