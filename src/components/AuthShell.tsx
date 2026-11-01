import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Brand, ThemeToggle } from './Chrome'

const shapes = [
  { cls: 'sh-ring', style: { ['--r' as string]: '0deg' }, d: 0 },
  { cls: 'sh-slab', style: { ['--r' as string]: '-32deg' }, d: 1.2 },
  { cls: 'sh-ball', style: { ['--r' as string]: '0deg' }, d: 0.6 },
  { cls: 'sh-coin', style: { ['--r' as string]: '0deg' }, d: 1.8 },
  { cls: 'sh-tube', style: { ['--r' as string]: '-12deg' }, d: 2.4 },
  { cls: 'sh-half', style: { ['--r' as string]: '0deg' }, d: 3 },
]

export function AuthShell({ heading, text, children }: { heading: string; text: string; children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-art" aria-hidden="false">
        <Brand />
        <div className="shapes" aria-hidden="true">
          {shapes.map((s, i) => (
            <motion.div key={s.cls} className={`shape ${s.cls} floaty`} style={{ ...s.style, animationDelay: `${s.d}s` }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 * i, type: 'spring', stiffness: 120, damping: 14 }} />
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{heading}</motion.h2>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>{text}</motion.p>
        </div>
      </aside>
      <main className="auth-panel">
        <div className="auth-top">
          <Link to="/" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Beranda</Link>
          <ThemeToggle />
        </div>
        <motion.div className="auth-box" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          {children}
        </motion.div>
      </main>
    </div>
  )
}

type UProps = InputHTMLAttributes<HTMLInputElement> & { label: string }
export function ULineField({ label, type = 'text', id, ...rest }: UProps) {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <div className="uline">
      <input id={id} type={isPass && show ? 'text' : type} placeholder=" " {...rest} />
      <label htmlFor={id}>{label}</label>
      {isPass && (
        <button type="button" className="trail" onClick={() => setShow((s) => !s)} aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  )
}

type SProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string }
export function ULineSelect({ label, id, value, children, ...rest }: SProps) {
  return (
    <div className={`uline ${value ? 'filled' : ''}`}>
      <select id={id} value={value} {...rest}>{children}</select>
      <label htmlFor={id}>{label}</label>
    </div>
  )
}
