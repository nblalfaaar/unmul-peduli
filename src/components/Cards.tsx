import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarClock, Package } from 'lucide-react'
import type { Penawaran, Pengajuan } from '../lib/firebase'
import { sisaHari } from '../lib/format'
import { Avatar, kategoriIcon, kategoriTone, riseItem, StatusBadge, UrgensiBadge } from './ui'

function BatasWaktu({ ms }: { ms?: number }) {
  const s = sisaHari(ms)
  if (s === null) return null
  return (
    <span style={{ color: s < 0 ? 'var(--c-danger)' : s <= 3 ? 'var(--c-peach-ink)' : undefined }}>
      <CalendarClock size={13} /> {s < 0 ? 'Lewat batas waktu' : s === 0 ? 'Berakhir hari ini' : `${s} hari lagi`}
    </span>
  )
}

export function NeedCard({ p }: { p: Pengajuan }) {
  const Icon = kategoriIcon(p.kategori)
  const open = p.status === 'Terverifikasi'
  return (
    <motion.div variants={riseItem} style={{ height: '100%' }}>
      <Link to={`/bantuan/${p.id}`} className="need-card card-hover" aria-label={`Lihat pengajuan ${p.judul}`}>
        <div className={`need-top tone-${kategoriTone(p.kategori)}`}>
          <span className="ico"><Icon size={26} /></span>
          <Icon size={120} className="bgart" strokeWidth={1.2} />
          <div style={{ position: 'relative', zIndex: 1 }}>{p.urgensi === 'tinggi' ? <UrgensiBadge urgensi="tinggi" /> : !open && <StatusBadge status={p.status} />}</div>
        </div>
        <div className="need-body">
          <div className="row" style={{ gap: 6 }}>
            <span className="badge badge-blue">{p.kategori}</span>
            {p.urgensi === 'tinggi' && !open && <StatusBadge status={p.status} />}
          </div>
          <h3 className="clamp-2">{p.judul}</h3>
          <p className="clamp-2">{p.deskripsi}</p>
          <div className="meta-row">
            {p.jumlah && <span><Package size={13} /> {p.jumlah}</span>}
            <BatasWaktu ms={p.batas_waktu} />
          </div>
          <div className="person">
            <Avatar nama={p.pengaju_nama} size={34} />
            <div style={{ minWidth: 0 }}>
              <b>{p.pengaju_nama}</b>
              <small>{p.pengaju_fakultas || 'Universitas Mulawarman'}</small>
            </div>
            <span className="spacer" />
            <span className="btn btn-primary btn-sm">{open ? 'Bantu' : 'Detail'} <ArrowRight size={14} /></span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function OfferCard({ p }: { p: Penawaran }) {
  const Icon = kategoriIcon(p.kategori)
  return (
    <motion.div variants={riseItem} style={{ height: '100%' }}>
      <Link to={`/penawaran/${p.id}`} className="need-card card-hover" aria-label={`Lihat penawaran ${p.judul}`}>
        <div className={`need-top tone-${(kategoriTone(p.kategori) + 2) % 5}`}>
          <span className="ico"><Icon size={26} /></span>
          <Icon size={120} className="bgart" strokeWidth={1.2} />
          <div style={{ position: 'relative', zIndex: 1 }}><StatusBadge status={p.status} /></div>
        </div>
        <div className="need-body">
          <div className="row" style={{ gap: 6 }}><span className="badge badge-blue">{p.kategori}</span></div>
          <h3 className="clamp-2">{p.judul}</h3>
          <p className="clamp-2">{p.deskripsi}</p>
          <div className="meta-row">{p.jumlah && <span><Package size={13} /> {p.jumlah}</span>}</div>
          <div className="person">
            <Avatar nama={p.pemberi_nama} size={34} />
            <div style={{ minWidth: 0 }}>
              <b>{p.pemberi_nama}</b>
              <small>{p.pemberi_fakultas || 'Pemberi bantuan'}</small>
            </div>
            <span className="spacer" />
            <span className="btn btn-primary btn-sm">Lihat <ArrowRight size={14} /></span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
