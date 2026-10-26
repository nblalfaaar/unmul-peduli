import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export type Role = "mahasiswa" | "admin" | "verifikator";

export type Profile = {
  id: string;
  nama: string;
  email: string;
  role: Role;
  fakultas?: string;
  status_akun?: string;
};

export type Pengajuan = {
  id?: string;
  pengaju_id: string;
  pengaju_nama: string;
  pengaju_fakultas?: string;
  judul: string;
  kategori: "Pendidikan" | "Kebutuhan" | "Kesehatan" | "Lainnya";
  deskripsi: string;
  urgensi: "rendah" | "sedang" | "tinggi";
  status: "Menunggu verifikasi" | "Terverifikasi" | "Ditolak" | "Selesai";
  created_at: number;
};

export type Penawaran = {
  id?: string;
  pemberi_id: string;
  pemberi_nama: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  status: "Tersedia" | "Terpakai";
  created_at: number;
};
