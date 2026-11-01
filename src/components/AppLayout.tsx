import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell, ClipboardList, Gift, HandHeart, HeartHandshake, LayoutDashboard, LogOut, Menu, Plus, Search, ShieldCheck, UserCircle, Users, X,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { Avatar } from './ui'
import { Brand, NotifBell, ThemeToggle, useNotifikasi } from './Chrome'

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const { unread } = useNotifikasi()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const { pathname } = useLocation()
  const nav = useNavigate()

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  if (!user) return null
  const staff = user.role === 'verifikator' || user.role === 'admin'

  const link = (to: string, icon: React.ReactNode, label: string, extra?: React.ReactNode, end = false) => (
    <NavLink to={to} end={end} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
      {icon}
      {label}
      {extra}
    </NavLink>
  )

  function cari(e: FormEvent) {
    e.preventDefault()
    nav(`/bantuan${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }

  const jam = new Date().getHours()
  const salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam'

  return (
    <div className="app">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`side ${open ? 'open' : ''}`} aria-label="Menu samping">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Brand to="/dashboard" sub={false} />
          <button className="icon-btn menu-toggle" style={{ marginRight: 12, background: 'rgba(255,255,255,.12)', color: '#fff', border: 0 }} onClick={() => setOpen(false)} aria-label="Tutup menu"><X size={18} /></button>
        </div>
        <div className="side-profile">
          <div className="ring"><Avatar nama={user.nama} size={78} /></div>
          <b>{user.nama}</b>
          <small>{user.email}</small>
          <span className="badge">{user.role}</span>
        </div>
        <nav className="side-nav">
          {link('/dashboard', <LayoutDashboard size={18} />, 'Dashboard')}
          {link('/pengajuan-saya', <ClipboardList size={18} />, 'Aktivitas Saya')}
          {link('/notifikasi', <Bell size={18} />, 'Notifikasi', unread > 0 && <span className="cnt">{unread}</span>)}
          {link('/profil', <UserCircle size={18} />, 'Profil')}
          <div className="side-label">Jelajahi</div>
          {link('/bantuan', <HandHeart size={18} />, 'Pengajuan Bantuan', null, true)}
          {link('/penawaran', <Gift size={18} />, 'Penawaran Bantuan', null, true)}
          <div className="side-label">Buat baru</div>
          {link('/ajukan', <Plus size={18} />, 'Ajukan Bantuan')}
          {link('/tawarkan', <HeartHandshake size={18} />, 'Tawarkan Bantuan')}
          {staff && <div className="side-label">Pengelolaan</div>}
          {staff && link('/verifikasi', <ShieldCheck size={18} />, 'Verifikasi')}
          {user.role === 'admin' && link('/admin', <LayoutDashboard size={18} />, 'Panel Admin', null, true)}
          {user.role === 'admin' && link('/admin/users', <Users size={18} />, 'Manajemen User')}
        </nav>
        <div className="side-foot">
          <Link to="/" style={{ display: 'block', fontSize: 12.5, opacity: 0.75, padding: '0 6px 10px' }}>Kembali ke beranda</Link>
          <button onClick={async () => { await signOut(); nav('/') }}><LogOut size={18} /> Keluar</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setOpen(true)} aria-label="Buka menu"><Menu size={18} /></button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{salam}, {user.nama.split(' ')[0]}</h1>
            <div className="sub hide-sm">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div className="spacer" />
          <form onSubmit={cari} className="input-icon hide-md" style={{ width: 260 }} role="search">
            <Search size={16} className="lead" />
            <input className="input" style={{ borderRadius: 99, padding: '9px 14px 9px 40px' }} placeholder="Cari bantuan..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari bantuan" />
          </form>
          <ThemeToggle />
          <NotifBell />
        </header>
        <motion.div key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
