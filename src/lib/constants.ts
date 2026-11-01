import type { StatusPengajuan, Urgensi } from './firebase'

export const KATEGORI = ['Dana', 'Makanan', 'Pakaian', 'Perlengkapan Kuliah', 'Lainnya'] as const

export const FAKULTAS = [
  'Fakultas Ekonomi dan Bisnis',
  'Fakultas Farmasi',
  'Fakultas Hukum',
  'Fakultas Ilmu Budaya',
  'Fakultas Ilmu Sosial dan Ilmu Politik',
  'Fakultas Kedokteran',
  'Fakultas Kehutanan',
  'Fakultas Keguruan dan Ilmu Pendidikan',
  'Fakultas Kesehatan Masyarakat',
  'Fakultas Matematika dan Ilmu Pengetahuan Alam',
  'Fakultas Pertanian',
  'Fakultas Perikanan dan Ilmu Kelautan',
  'Fakultas Teknik',
  'Pascasarjana',
  'Dosen / Staf',
  'Lainnya',
]

export const URGENSI: { value: Urgensi; label: string }[] = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'tinggi', label: 'Tinggi (mendesak)' },
]

export const ALUR: StatusPengajuan[] = ['Menunggu verifikasi', 'Terverifikasi', 'Pencocokan', 'Penyaluran', 'Selesai']

export const ALUR_LABEL: Record<string, string> = {
  'Menunggu verifikasi': 'Pengajuan',
  Terverifikasi: 'Verifikasi',
  Pencocokan: 'Pencocokan',
  Penyaluran: 'Penyaluran',
  Selesai: 'Selesai',
}

export const STATUS_PUBLIK: StatusPengajuan[] = ['Terverifikasi', 'Pencocokan', 'Penyaluran', 'Selesai']
