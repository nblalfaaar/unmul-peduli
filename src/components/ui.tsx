import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView, type HTMLMotionProps } from 'framer-motion'
import {
  BookOpen, Check, Gift, GraduationCap, HandHeart, HeartPulse, ShoppingBasket, Shirt, UtensilsCrossed, Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { RiwayatStatus, StatusPengajuan } from '../lib/firebase'
import { ALUR, ALUR_LABEL } from '../lib/constants'
import { inisial, tgl } from '../lib/format'

export function Avatar({ nama, size = 38 }: { nama?: string; size?: number }) {
  return (
    <span className="avatar" style={{ ['--s' as string]: `${size}px` }} aria-hidden="true">
      {inisial(nama)}
    </span>
  )
}

const KAT_ICON: Record<string, LucideIcon> = {
  Dana: Wallet,
  Makanan: UtensilsCrossed,
  Pakaian: Shirt,
  'Perlengkapan Kuliah': BookOpen,
  Lainnya: Gift,
  Pendidikan: GraduationCap,
  Kesehatan: HeartPulse,
  Kebutuhan: ShoppingBasket,
}
export const kategoriIcon = (k: string): LucideIcon => KAT_ICON[k] ?? HandHeart
const KAT_TONE: Record<string, number> = { Dana: 0, Makanan: 1, Pakaian: 2, 'Perlengkapan Kuliah': 3, Lainnya: 4 }
export const kategoriTone = (k: string) => KAT_TONE[k] ?? 0

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Menunggu verifikasi': 'badge-warn',
    Terverifikasi: 'badge-blue',
    Ditolak: 'badge-danger',
    Pencocokan: 'badge-peach',
    Penyaluran: 'badge-peach',
    Selesai: 'badge-mint',
    Tersedia: 'badge-mint',
    Terpakai: 'badge-peach',
    Dibatalkan: 'badge-danger',
  }
  return (
    <span className={`badge ${map[status] ?? ''}`}>
      <span className="dot" />
      {status}
    </span>
  )
}

export function UrgensiBadge({ urgensi }: { urgensi: string }) {
  if (urgensi === 'tinggi') return <span className="badge badge-danger"><span className="dot" />Mendesak</span>
  if (urgensi === 'sedang') return <span className="badge badge-warn">Urgensi sedang</span>
  return <span className="badge badge-blue">Urgensi rendah</span>
}

export function EmptyState({ icon: Icon, title, desc, action }: { icon: LucideIcon; title: string; desc?: string; action?: ReactNode }) {
  return (
    <motion.div className="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="ic"><Icon size={30} /></div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action}
    </motion.div>
  )
}

export function CardSkeletons({ n = 6 }: { n?: number }) {
  return (
    <div className="cards-grid">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="need-card" aria-hidden="true">
          <div className="skel" style={{ height: 112, borderRadius: 0 }} />
          <div className="need-body">
            <div className="skel" style={{ height: 14, width: '40%' }} />
            <div className="skel" style={{ height: 20, width: '85%' }} />
            <div className="skel" style={{ height: 14 }} />
            <div className="skel" style={{ height: 14, width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RowSkeletons({ n = 4 }: { n?: number }) {
  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="skel" style={{ height: 76, borderRadius: 18 }} />
      ))}
    </div>
  )
}

/** Progres status pengajuan: Pengajuan → Verifikasi → Pencocokan → Penyaluran → Selesai */
export function Stepper({ status }: { status: StatusPengajuan }) {
  const ditolak = status === 'Ditolak'
  const idx = ditolak ? 0 : ALUR.indexOf(status)
  return (
    <div className="stepper" role="list" aria-label="Progres bantuan">
      {ALUR.map((s, i) => {
        const cls = i < idx || (status === 'Selesai' && i === idx) ? 'done' : i === idx ? 'now' : ''
        return (
          <motion.div key={s} role="listitem" className={`step ${cls}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="node">{cls === 'done' ? <Check size={16} strokeWidth={3} /> : <span style={{ margin: 0, color: 'inherit', fontSize: 12 }}>{i + 1}</span>}</div>
            <span>{ALUR_LABEL[s]}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

export function Timeline({ items }: { items: RiwayatStatus[] }) {
  return (
    <div className="timeline">
      {items.map((r, i) => (
        <motion.div key={r.id ?? i} className={`tl-item ${i === items.length - 1 ? 'last' : ''}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
          <div className="tl-dot" />
          <div>
            <b>{r.status_baru}</b>
            <small>{r.pelaku_nama} &middot; {tgl(r.created_at, true)}</small>
            {r.keterangan && <em>{r.keterangan}</em>}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 1.1, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) })
    return () => c.stop()
  }, [inView, value])
  return <span ref={ref} className={className}>{shown.toLocaleString('id-ID')}</span>
}

export function Reveal({ children, delay = 0, y = 28, ...rest }: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }} {...rest}>
      {children}
    </motion.div>
  )
}

export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
export const riseItem = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } } }

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="row row-wrap" style={{ marginBottom: 22, alignItems: 'flex-end' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 600 }}>{title}</h1>
        {sub && <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{sub}</p>}
      </div>
      <div className="spacer" />
      {actions}
    </div>
  )
}
