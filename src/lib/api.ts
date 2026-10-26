import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc} from "firebase/firestore";
import { db, type Pengajuan, type Penawaran } from "./firebase";

const col = {
  pengajuan: collection(db, "pengajuan"),
  penawaran: collection(db, "penawaran"),
  notifikasi: collection(db, "notifikasi"),
};

// ============ PENGAJUAN ============

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

export async function getPengajuanById(id: string): Promise<Pengajuan | null> {
  const snap = await getDoc(doc(db, "pengajuan", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Pengajuan) : null;
}

export async function updateStatusPengajuan(id: string, status: Pengajuan["status"]) {
  await updateDoc(doc(db, "pengajuan", id), { status });
}

export async function ambilBantuan(pengajuanId: string, pengajuan: Pengajuan, namaPengambil: string) {
  await updateDoc(doc(db, "pengajuan", pengajuanId), { status: "Selesai" });
  await kirimNotif(pengajuan.pengaju_id, `${namaPengambil} akan membantu "${pengajuan.judul}". Terima kasih!`);
}

// ============ PENAWARAN ============

export async function createPenawaran(data: Omit<Penawaran, "id" | "created_at" | "status">) {
  return addDoc(col.penawaran, { ...data, status: "Tersedia", created_at: Date.now() });
}

export async function listPenawaran(): Promise<Penawaran[]> {
  const q = query(col.penawaran, orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Penawaran);
}

export async function getPenawaranById(id: string): Promise<Penawaran | null> {
  const snap = await getDoc(doc(db, "penawaran", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Penawaran) : null;
}

export async function klaimPenawaran(penawaranId: string, penawaran: Penawaran, namaPengklaim: string) {
  await updateDoc(doc(db, "penawaran", penawaranId), { status: "Terpakai" });
  await kirimNotif(penawaran.pemberi_id, `${namaPengklaim} mengklaim "${penawaran.judul}".`);
}

// ============ NOTIFIKASI ============

export async function kirimNotif(penerima_id: string, pesan: string) {
  await addDoc(col.notifikasi, { penerima_id, pesan, status_baca: false, created_at: Date.now() });
}

export async function listNotifikasi(penerima_id: string) {
  const q = query(col.notifikasi, orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((n: any) => n.penerima_id === penerima_id);
}

export async function tandaiNotifDibaca(id: string) {
  await updateDoc(doc(db, "notifikasi", id), { status_baca: true });
}
