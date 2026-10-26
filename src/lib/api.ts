import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc} from "firebase/firestore";
import { db, type Pengajuan, type Penawaran } from "./firebase";

const col = {
  pengajuan: collection(db, "pengajuan"),
  penawaran: collection(db, "penawaran"),
  notifikasi: collection(db, "notifikasi"),
};

export async function createPengajuan(data: Omit<Pengajuan, "id" | "created_at" | "status">) {
  return addDoc(col.pengajuan, { ...data, status: "Menunggu verifikasi", created_at: Date.now() });
}

export async function listPengajuanPublik(): Promise<Pengajuan[]> {
  const q = query(col.pengajuan, orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pengajuan).filter((p) => p.status === "Terverifikasi" || p.status === "Selesai");
}

export async function listPengajuanAll(): Promise<Pengajuan[]> {
  const q = query(col.pengajuan, orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pengajuan);
}

export async function updateStatusPengajuan(id: string, status: Pengajuan["status"]) {
  await updateDoc(doc(db, "pengajuan", id), { status });
}

export async function createPenawaran(data: Omit<Penawaran, "id" | "created_at" | "status">) {
  return addDoc(col.penawaran, { ...data, status: "Tersedia", created_at: Date.now() });
}

export async function listPenawaran(): Promise<Penawaran[]> {
  const q = query(col.penawaran, orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Penawaran);
}

export async function kirimNotif(penerima_id: string, pesan: string) {
  await addDoc(col.notifikasi, { penerima_id, pesan, status_baca: false, created_at: Date.now() });
}
