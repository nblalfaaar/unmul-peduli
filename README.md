# UNMUL Peduli

Platform web penghubung pemberi dan penerima bantuan di Universitas Mulawarman.
Stack: React 19, Vite, TypeScript, React Router, Firebase (Auth + Firestore), Framer Motion, Lucide Icons. Font: Poppins.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi konfigurasi Firebase
npm run dev
npm run build
```

## Setup Firebase (gratis, paket Spark)

1. Authentication > Sign-in method > aktifkan **Email/Password**.
2. Firestore Database > buat database.
3. Firestore > **Rules** > tempel isi `firestore.rules`, lalu Publish.
4. Buat akun admin pertama: daftar lewat aplikasi, lalu di Firestore ubah field `role` dokumen `users/{uid}` menjadi `admin`. Setelahnya admin dapat mengatur peran lain dari menu Manajemen User.

Tidak memakai Firebase Storage (tidak ada fitur unggah berkas).

## Alur sesuai laporan

Pengajuan > Verifikasi > Pencocokan > Penyaluran > Selesai. Semua perubahan status memakai transaksi Firestore, dicatat di `riwayat_status`, dan memicu notifikasi realtime.

| Peran | Akses |
| --- | --- |
| Mahasiswa | Ajukan, tawarkan, bantu, klaim, pantau status |
| Verifikator | Setujui / tolak pengajuan (alasan wajib saat menolak) |
| Admin | Semua akses verifikator, panel statistik, rekap CSV, manajemen user |
