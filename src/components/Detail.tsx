import { Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react'
import type { Kontak } from '../lib/firebase'
import { Avatar } from './ui'

export function Back({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="row" style={{ gap: 6, fontSize: 13, color: '#bcd3de', marginBottom: 12, display: 'inline-flex' }}>
      <ArrowLeft size={15} /> {label}
    </Link>
  )
}

export function waLink(hp: string): string {
  let d = hp.replace(/\D/g, '')
  if (d.startsWith('0')) d = '62' + d.slice(1)
  return `https://wa.me/${d}`
}

const PERAN: Record<string, string> = { pengaju: 'Penerima bantuan', pemberi: 'Pemberi bantuan', pengklaim: 'Penerima bantuan' }

export function KontakCard({ list, myId }: { list: Kontak[]; myId?: string }) {
  const lain = list.filter((k) => k.id !== myId)
  if (lain.length === 0) return null
  return (
    <div className="card">
      <div className="card-head"><h3 className="card-title">Kontak untuk koordinasi</h3></div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Penyerahan bantuan dilakukan langsung di luar sistem. Hubungi pihak terkait untuk menentukan waktu dan tempat.</p>
      <div className="stack">
        {lain.map((k) => (
          <div key={k.id} className="row" style={{ gap: 12 }}>
            <Avatar nama={k.nama} size={40} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ display: 'block', fontSize: 14 }}>{k.nama}</b>
              <small className="muted">{PERAN[k.peran] ?? k.peran}</small>
              {k.no_hp ? (
                <div className="row row-wrap" style={{ gap: 8, marginTop: 8 }}>
                  <a className="btn btn-primary btn-sm" href={waLink(k.no_hp)} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</a>
                  <a className="btn btn-outline btn-sm" href={`tel:${k.no_hp}`}><Phone size={14} /> {k.no_hp}</a>
                </div>
              ) : (
                <small className="muted" style={{ display: 'block', marginTop: 6 }}>Belum mencantumkan nomor HP. Gunakan notifikasi atau hubungi lewat fakultas.</small>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
