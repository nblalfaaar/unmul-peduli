import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function PageTop({ eyebrow, title, desc, actions }: { eyebrow?: ReactNode; title: string; desc?: string; actions?: ReactNode }) {
  return (
    <header className="page-top">
      <motion.div className="orb" style={{ width: 320, height: 320, right: -80, top: -120, background: 'radial-gradient(circle, #4b8fab, transparent 70%)' }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 9, repeat: Infinity }} />
      <motion.div className="orb" style={{ width: 220, height: 220, left: '8%', bottom: -110, background: 'radial-gradient(circle, #e4a98d, transparent 70%)', opacity: 0.35 }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 11, repeat: Infinity }} />
      <div className="container" style={{ position: 'relative' }}>
        {eyebrow}
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>{title}</motion.h1>
        {desc && <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>{desc}</motion.p>}
        {actions && <motion.div className="row row-wrap" style={{ marginTop: 22 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>{actions}</motion.div>}
      </div>
    </header>
  )
}
