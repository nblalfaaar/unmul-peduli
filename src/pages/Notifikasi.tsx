import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { tandaiNotifDibaca, tandaiSemuaNotifDibaca } from '../lib/api'
import { useTitle } from '../lib/hooks'
import { tgl, waktuRelatif } from '../lib/format'
import type { Notifikasi as N } from '../lib/firebase'
import { useNotifikasi } from '../components/Chrome'
import { useFeedback } from '../components/Feedback'
import { EmptyState, PageHeader, riseItem, stagger } from '../components/ui'

export default function Notifikasi() {
  useTitle('Notifikasi')
  const nav = useNavigate()
  const { toast } = useFeedback()
  const { list, unread } = useNotifikasi()
  const [hanyaBaru, setHanyaBaru] = useState(false)
  const tampil = hanyaBaru ? list.filter((n) => !n.status_baca) : list

  async function buka(n: N) {
    if (!n.status_baca) tandaiNotifDibaca(n.id).catch(() => {})
    if (n.link) nav(n.link)
  }

  async function semua() {
    try {
      await tandaiSemuaNotifDibaca(list.filter((n) => !n.status_baca).map((n) => n.id))
      toast('ok', 'Semua notifikasi ditandai dibaca')
    } catch {
      toast('err', 'Gagal menandai notifikasi')
    }
  }

  return (
    <>
      <PageHeader title="Notifikasi" sub={unread > 0 ? `${unread} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'} actions={unread > 0 && <button className="btn btn-soft btn-sm" onClick={semua}><CheckCheck size={15} /> Tandai semua dibaca</button>} />
      <div className="tabs">
        <button className={`tab ${!hanyaBaru ? 'on' : ''}`} onClick={() => setHanyaBaru(false)}>Semua<span className="n">{list.length}</span></button>
        <button className={`tab ${hanyaBaru ? 'on' : ''}`} onClick={() => setHanyaBaru(true)}>Belum dibaca<span className="n">{unread}</span></button>
      </div>
      {tampil.length === 0 ? (
        <EmptyState icon={BellOff} title={hanyaBaru ? 'Tidak ada notifikasi baru' : 'Belum ada notifikasi'} desc="Pembaruan status pengajuan dan penawaranmu akan muncul di sini." />
      ) : (
        <motion.div className="stack" style={{ gap: 10 }} variants={stagger} initial="hidden" animate="show" key={String(hanyaBaru)}>
          {tampil.map((n) => (
            <motion.button key={n.id} variants={riseItem} className={`notif-item ${n.status_baca ? '' : 'unread'}`} onClick={() => buka(n)}>
              <span className="ic"><Bell size={18} /></span>
              <div style={{ flex: 1 }}>
                <p>{n.pesan}</p>
                <small title={tgl(n.created_at, true)}>{waktuRelatif(n.created_at)}</small>
              </div>
              {!n.status_baca && <span className="dot" style={{ color: 'var(--c-peach-strong)', marginTop: 8 }} />}
            </motion.button>
          ))}
        </motion.div>
      )}
    </>
  )
}
