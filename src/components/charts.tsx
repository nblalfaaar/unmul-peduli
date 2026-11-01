import { useState } from 'react'
import { motion } from 'framer-motion'

export type Slice = { label: string; value: number; color: string }

export function Donut({ data, size = 190, thickness = 30, center }: { data: Slice[]; size?: number; thickness?: number; center?: { big: string; small: string } }) {
  const total = data.reduce((a, b) => a + b.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Diagram status">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} style={{ stroke: 'var(--c-surface-2)' }} />
        {total > 0 &&
          data
            .filter((d) => d.value > 0)
            .map((d, i) => {
              const len = (d.value / total) * c
              const off = -acc
              acc += len
              return (
                <motion.circle
                  key={d.label}
                  cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness}
                  style={{ stroke: d.color }}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  strokeDasharray={`${Math.max(0, len - 3)} ${c}`}
                  strokeLinecap="butt"
                  initial={{ strokeDashoffset: c, opacity: 0 }}
                  animate={{ strokeDashoffset: off, opacity: 1 }}
                  transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
                />
              )
            })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <b style={{ display: 'block', fontSize: 26, fontWeight: 700, color: 'var(--c-ink-strong)', lineHeight: 1.1 }}>{center?.big ?? total}</b>
          <small className="muted" style={{ fontSize: 11.5 }}>{center?.small ?? 'Total'}</small>
        </div>
      </div>
    </div>
  )
}

function smooth(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const mx = (x0 + x1) / 2
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`
  }
  return d
}

export type Series = { name: string; values: number[]; color: string }

export function AreaChart({ labels, series, height = 230 }: { labels: string[]; series: Series[]; height?: number }) {
  const W = 640, H = height, pl = 34, pr = 14, pt = 16, pb = 30
  const max = Math.max(4, ...series.flatMap((s) => s.values))
  const nice = Math.ceil(max / 4) * 4
  const x = (i: number) => pl + (i * (W - pl - pr)) / Math.max(1, labels.length - 1)
  const y = (v: number) => pt + (1 - v / nice) * (H - pt - pb)
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Grafik aktivitas" onMouseLeave={() => setHover(null)}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`ag${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 1, 2, 3, 4].map((g) => {
          const v = (nice / 4) * g
          return (
            <g key={g}>
              <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} strokeDasharray="4 5" style={{ stroke: 'var(--c-line)' }} />
              <text x={pl - 8} y={y(v) + 4} textAnchor="end" fontSize="11" style={{ fill: 'var(--c-muted)' }}>{v}</text>
            </g>
          )
        })}
        {labels.map((l, i) => (
          <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11.5" style={{ fill: 'var(--c-muted)' }}>{l}</text>
        ))}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => [x(i), y(v)] as [number, number])
          const line = smooth(pts)
          const area = `${line} L ${x(s.values.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`
          return (
            <g key={s.name}>
              <motion.path d={area} fill={`url(#ag${si})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} />
              <motion.path d={line} fill="none" strokeWidth="3" strokeLinecap="round" style={{ stroke: s.color }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
              {pts.map(([px, py], i) => (
                <motion.circle key={i} cx={px} cy={py} r={hover === i ? 6 : 3.5} style={{ fill: 'var(--c-surface)', stroke: s.color }} strokeWidth="2.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }} />
              ))}
            </g>
          )
        })}
        {labels.map((_, i) => (
          <rect key={i} x={x(i) - 20} y={pt} width="40" height={H - pt - pb} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover !== null && (
        <div style={{ position: 'absolute', left: `${(x(hover) / W) * 100}%`, top: 0, transform: 'translateX(-50%)', background: 'var(--c-deep)', color: '#fff', fontSize: 12, padding: '8px 12px', borderRadius: 12, pointerEvents: 'none', boxShadow: 'var(--shadow-md)', whiteSpace: 'nowrap' }}>
          <b style={{ display: 'block', marginBottom: 2 }}>{labels[hover]}</b>
          {series.map((s) => (
            <div key={s.name} className="row" style={{ gap: 6 }}>
              <i style={{ width: 8, height: 8, borderRadius: 4, background: s.color, display: 'inline-block' }} />
              {s.name}: {s.values[hover]}
            </div>
          ))}
        </div>
      )}
      <div className="row row-wrap" style={{ gap: 18, marginTop: 6, fontSize: 12.5 }}>
        {series.map((s) => (
          <span key={s.name} className="row" style={{ gap: 6 }}>
            <i style={{ width: 10, height: 10, borderRadius: 5, background: s.color, display: 'inline-block' }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="barlist">
      {items.map((it, i) => (
        <div className="bl-row" key={it.label}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
          <div className="track">
            <motion.div className="fill" initial={{ width: 0 }} animate={{ width: `${(it.value / max) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }} />
          </div>
          <b>{it.value}</b>
        </div>
      ))}
    </div>
  )
}
