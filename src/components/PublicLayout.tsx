import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Menu, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { Brand, NotifBell, ThemeToggle, UserMenu } from './Chrome'

const LINKS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/bantuan', label: 'Pengajuan Bantuan' },
  { to: '/penawaran', label: 'Penawaran Bantuan' },
]

export function PublicNavbar() {
  const { user, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12)
    h()
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="nav-wrap">
      <motion.nav className={`nav-pill ${scrolled ? 'scrolled' : ''}`} aria-label="Navigasi utama" initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
        <Brand />
        <div className="nav-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          {!loading && user && (
            <>
              <Link to="/dashboard" className="btn btn-light btn-sm hide-md"><LayoutDashboard size={15} /> Dashboard</Link>
              <NotifBell onDark />
              <UserMenu onDark />
            </>
          )}
          {!loading && !user && (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm hide-sm" style={{ color: '#fff' }}>Masuk</Link>
              <Link to="/register" className="btn btn-light btn-sm"><span className="btn-label">Daftar</span><span className="sr-only">Daftar</span></Link>
            </>
          )}
          <button className="icon-btn burger" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>
      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>{l.label}</NavLink>
        ))}
        {user ? <Link to="/dashboard">Dashboard</Link> : <Link to="/login">Masuk</Link>}
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand sub={false} />
            <p>Platform digital berbasis web yang menghubungkan pemberi dan penerima bantuan di lingkungan Universitas Mulawarman secara terorganisasi, transparan, dan tepat sasaran.</p>
          </div>
          <div>
            <h4>Jelajahi</h4>
            <Link to="/bantuan">Pengajuan bantuan</Link>
            <Link to="/penawaran">Penawaran bantuan</Link>
            <Link to="/#cara-kerja">Cara kerja</Link>
          </div>
          <div>
            <h4>Mulai berbagi</h4>
            <Link to="/ajukan">Ajukan bantuan</Link>
            <Link to="/tawarkan">Tawarkan bantuan</Link>
            <Link to="/register">Buat akun</Link>
          </div>
          <div>
            <h4>Akun</h4>
            <Link to="/login">Masuk</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profil">Profil</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 UNMUL Peduli &middot; Kelompok 8 Program Studi Informatika, Universitas Mulawarman</span>
          <span>Mata kuliah Manajemen Proyek IT</span>
        </div>
      </div>
    </footer>
  )
}

export default function PublicLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0 })
  }, [pathname])
  return (
    <>
      <PublicNavbar />
      <motion.div key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Outlet />
      </motion.div>
      <Footer />
    </>
  )
}
