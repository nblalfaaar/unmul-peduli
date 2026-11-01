import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BellRing, ChevronDown, ClipboardList, LayoutDashboard, LogOut, Moon, ShieldCheck, Sun, UserCircle, Users } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { subscribeNotifikasi, tandaiNotifDibaca } from '../lib/api'
import type { Notifikasi } from '../lib/firebase'
import { waktuRelatif } from '../lib/format'
import { Avatar } from './ui'

export function Brand({ to = '/', sub = true }: { to?: string; sub?: boolean }) {
  return (
    <Link to={to} className="brand" aria-label="UNMUL Peduli - beranda">
      <img src="/logo-unmul.png" alt="" className="brand-logo" width="40" height="40" />
      <span>
        UNMUL Peduli
        {sub && <small>Berbagi untuk sesama</small>}
      </span>
    </Link>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} role="switch" aria-checked={theme === 'dark'}>
      <Sun size={14} className="bg-ic" style={{ right: 9 }} />
      <Moon size={14} className="bg-ic" style={{ left: 9 }} />
      <span className="knob">{theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}</span>
    </button>
  )
}

function useClickOutside(onOut: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onOut()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onOut()
    document.addEventListener('mousedown', h)
    document.addEventListener('keydown', k)
    return () => {
      document.removeEventListener('mousedown', h)
      document.removeEventListener('keydown', k)
    }
  }, [onOut])
  return ref
}

export function useNotifikasi() {
  const { user } = useAuth()
  const [list, setList] = useState<Notifikasi[]>([])
  useEffect(() => {
    if (!user) {
      setList([])
      return
    }
    return subscribeNotifikasi(user.id, setList)
  }, [user])
  return { list, unread: list.filter((n) => !n.status_baca).length }
}

export function NotifBell({ onDark = false }: { onDark?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  const nav = useNavigate()
  const { list, unread } = useNotifikasi()

  async function buka(n: Notifikasi) {
    setOpen(false)
    if (!n.status_baca) tandaiNotifDibaca(n.id).catch(() => {})
    if (n.link) nav(n.link)
  }

  return (
    <div className="pop" ref={ref}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`} aria-expanded={open}>
        {unread > 0 ? <BellRing size={18} /> : <Bell size={18} />}
        {unread > 0 && <span className={`notif-badge ${onDark ? '' : 'on-surface'}`}>{unread > 9 ? '9+' : unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="pop-panel" style={{ width: 340, maxWidth: 'calc(100vw - 28px)' }} initial={{ opacity: 0, scale: 0.94, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: -6 }} transition={{ duration: 0.16 }}>
            <div className="row" style={{ padding: '8px 10px 10px' }}>
              <b style={{ fontSize: 14 }}>Notifikasi</b>
              <span className="spacer" />
              {unread > 0 && <span className="badge badge-peach">{unread} baru</span>}
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {list.length === 0 && <p className="muted center" style={{ padding: '26px 10px', fontSize: 13 }}>Belum ada notifikasi.</p>}
              {list.slice(0, 6).map((n) => (
                <button key={n.id} className="pop-item" style={{ alignItems: 'flex-start', background: n.status_baca ? undefined : 'var(--c-blue-soft)' }} onClick={() => buka(n)}>
                  <span className="dot" style={{ marginTop: 8, color: n.status_baca ? 'transparent' : 'var(--c-peach-strong)' }} />
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 12.5, lineHeight: 1.45 }}>{n.pesan}</span>
                    <small className="muted" style={{ fontSize: 11 }}>{waktuRelatif(n.created_at)}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="pop-sep" />
            <Link to="/notifikasi" className="pop-item" onClick={() => setOpen(false)} style={{ justifyContent: 'center', fontWeight: 600, color: 'var(--c-primary)' }}>
              Lihat semua notifikasi
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function UserMenu({ onDark = false }: { onDark?: boolean }) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  const nav = useNavigate()
  if (!user) return null

  const item = (to: string, icon: ReactNode, label: string) => (
    <Link to={to} className="pop-item" onClick={() => setOpen(false)}>
      {icon}
      {label}
    </Link>
  )

  return (
    <div className="pop" ref={ref}>
      <button className="row" style={{ gap: 6, padding: 3, borderRadius: 99, color: onDark ? '#fff' : 'inherit' }} onClick={() => setOpen((o) => !o)} aria-label="Menu akun" aria-expanded={open}>
        <Avatar nama={user.nama} size={38} />
        <ChevronDown size={15} className="hide-sm" style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="pop-panel" initial={{ opacity: 0, scale: 0.94, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: -6 }} transition={{ duration: 0.16 }}>
            <div className="row" style={{ padding: '10px 10px 12px' }}>
              <Avatar nama={user.nama} size={44} />
              <div style={{ minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nama}</b>
                <small className="muted" style={{ display: 'block', fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</small>
                <span className="badge badge-blue" style={{ marginTop: 4, textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
            <div className="pop-sep" />
            {item('/dashboard', <LayoutDashboard size={17} />, 'Dashboard')}
            {item('/profil', <UserCircle size={17} />, 'Profil saya')}
            {item('/pengajuan-saya', <ClipboardList size={17} />, 'Aktivitas saya')}
            {(user.role === 'verifikator' || user.role === 'admin') && item('/verifikasi', <ShieldCheck size={17} />, 'Verifikasi pengajuan')}
            {user.role === 'admin' && item('/admin', <Users size={17} />, 'Panel admin')}
            <div className="pop-sep" />
            <button className="pop-item danger" onClick={async () => { setOpen(false); await signOut(); nav('/') }}>
              <LogOut size={17} /> Keluar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
