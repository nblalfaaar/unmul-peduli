import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserCheck, UserX } from 'lucide-react'
import { listUsers, pesanError, updateUserRole, updateUserStatus } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { tgl } from '../lib/format'
import type { Profile, Role } from '../lib/firebase'
import { useFeedback } from '../components/Feedback'
import { Avatar, EmptyState, PageHeader, RowSkeletons } from '../components/ui'

const ROLES: Role[] = ['mahasiswa', 'verifikator', 'admin']

export default function ManajemenUser() {
  useTitle('Manajemen User')
  const { user } = useAuth()
  const { toast, confirm } = useFeedback()
  const { data, loading, reload } = useData(listUsers, [], [] as Profile[])
  const [f, setF] = useState<'semua' | Role>('semua')
  const [q, setQ] = useState('')

  const hasil = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return data.filter((u) => f === 'semua' || u.role === f).filter((u) => !kw || `${u.nama} ${u.email} ${u.fakultas ?? ''} ${u.nim ?? ''}`.toLowerCase().includes(kw)).sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))
  }, [data, f, q])

  async function ubahRole(u: Profile, role: Role) {
    if (role === u.role) return
    if (!(await confirm({ title: 'Ubah peran pengguna?', desc: `${u.nama} akan menjadi ${role}.`, confirmText: 'Ya, ubah' }))) return reload(true)
    try { await updateUserRole(u.id, role); toast('ok', 'Peran diperbarui') } catch (e) { toast('err', 'Gagal mengubah peran', pesanError(e)) }
    reload(true)
  }
  async function ubahStatus(u: Profile) {
    const nonaktif = u.status_akun !== 'nonaktif'
    if (!(await confirm({ title: nonaktif ? 'Nonaktifkan akun?' : 'Aktifkan akun?', desc: nonaktif ? `${u.nama} tidak akan bisa masuk sampai diaktifkan kembali.` : `${u.nama} akan bisa masuk kembali.`, confirmText: nonaktif ? 'Ya, nonaktifkan' : 'Ya, aktifkan', danger: nonaktif }))) return
    try { await updateUserStatus(u.id, nonaktif ? 'nonaktif' : 'aktif'); toast('ok', nonaktif ? 'Akun dinonaktifkan' : 'Akun diaktifkan') } catch (e) { toast('err', 'Gagal mengubah status', pesanError(e)) }
    reload(true)
  }

  return (
    <>
      <PageHeader title="Manajemen user" sub="Atur peran dan status akun pengguna UNMUL Peduli." />
      <div className="row row-wrap" style={{ marginBottom: 6 }}>
        <div className="tabs" style={{ marginBottom: 12 }}>
          {(['semua', ...ROLES] as const).map((r) => (
            <button key={r} className={`tab ${f === r ? 'on' : ''}`} style={{ textTransform: 'capitalize' }} onClick={() => setF(r)}>{r}<span className="n">{r === 'semua' ? data.length : data.filter((u) => u.role === r).length}</span></button>
          ))}
        </div>
        <span className="spacer" />
        <div className="input-icon" style={{ width: 280, marginBottom: 12 }}><Search size={16} className="lead" /><input className="input" style={{ borderRadius: 99 }} placeholder="Cari nama, email, NIM..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari pengguna" /></div>
      </div>
      {loading ? <RowSkeletons /> : hasil.length === 0 ? <EmptyState icon={Search} title="Pengguna tidak ditemukan" desc="Coba kata kunci atau filter lain." /> : (
        <motion.div className="table-wrap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <table className="tbl">
            <thead><tr><th>Pengguna</th><th>Fakultas</th><th>Bergabung</th><th>Peran</th><th>Status</th></tr></thead>
            <tbody>
              {hasil.map((u) => {
                const diri = u.id === user?.id
                const nonaktif = u.status_akun === 'nonaktif'
                return (
                  <tr key={u.id} style={{ opacity: nonaktif ? 0.65 : 1 }}>
                    <td><div className="row"><Avatar nama={u.nama} size={38} /><div><b style={{ display: 'block' }}>{u.nama}{diri && <span className="badge badge-blue" style={{ marginLeft: 8 }}>Kamu</span>}</b><small className="muted">{u.email}</small></div></div></td>
                    <td>{u.fakultas || '-'}</td>
                    <td className="muted">{tgl(u.created_at)}</td>
                    <td>
                      <select className="select" style={{ padding: '7px 34px 7px 12px', borderRadius: 10, width: 'auto', textTransform: 'capitalize' }} value={u.role} disabled={diri} onChange={(e) => ubahRole(u, e.target.value as Role)} aria-label={`Peran ${u.nama}`}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className={`btn btn-sm ${nonaktif ? 'btn-soft' : 'btn-outline'}`} disabled={diri} onClick={() => ubahStatus(u)}>
                        {nonaktif ? <><UserCheck size={14} /> Aktifkan</> : <><UserX size={14} /> Nonaktifkan</>}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </>
  )
}
