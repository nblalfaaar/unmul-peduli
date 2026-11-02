import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Gift, HandHeart, HeartHandshake, Layers, Search, ShieldCheck, SlidersHorizontal, Sparkles, Users, Zap } from 'lucide-react'
import { listPengajuanPublik, listPenawaran } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { KATEGORI } from '../lib/constants'
import type { Penawaran, Pengajuan } from '../lib/firebase'
import { NeedCard, OfferCard } from '../components/Cards'
import { AnimatedNumber, CardSkeletons, EmptyState, Reveal, stagger } from '../components/ui'

const FITUR = [
  { icon: ShieldCheck, t: 'Terverifikasi', d: 'Setiap pengajuan diperiksa verifikator sebelum tampil.' },
  { icon: Layers, t: 'Terlacak', d: 'Status jelas dari pengajuan hingga bantuan selesai.' },
  { icon: Zap, t: 'Tepat sasaran', d: 'Dicocokkan berdasarkan jenis bantuan dan tingkat urgensi.' },
  { icon: HeartHandshake, t: 'Untuk semua', d: 'Mahasiswa, dosen, dan staf lintas fakultas UNMUL.' },
]

export default function Landing() {
  useTitle('Berbagi Bantuan di Universitas Mulawarman')
  const nav = useNavigate()
  const { hash } = useLocation()
  const { user } = useAuth()

  const { data, loading } = useData(
    async () => {
      const [req, off] = await Promise.all([listPengajuanPublik().catch(() => []), listPenawaran().catch(() => [])])
      return { req, off }
    },
    [],
    { req: [] as Pengajuan[], off: [] as Penawaran[] },
  )

  const tersedia = data.off.filter((o) => o.status === 'Tersedia')
  const terbuka = data.req.filter((r) => r.status === 'Terverifikasi')
  const selesai = data.req.filter((r) => r.status === 'Selesai')

  const [kat, setKat] = useState('Semua')
  const tampil = (kat === 'Semua' ? terbuka : terbuka.filter((r) => r.kategori === kat)).slice(0, 3)

  const [cari, setCari] = useState({ peran: 'bantu', kategori: '', urgensi: '' })

  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120)
  }, [hash])

  function jalankanCari() {
    const p = new URLSearchParams()
    if (cari.kategori) p.set('kategori', cari.kategori)
    if (cari.urgensi && cari.peran === 'bantu') p.set('urgensi', cari.urgensi)
    nav(`${cari.peran === 'bantu' ? '/bantuan' : '/penawaran'}${p.toString() ? `?${p}` : ''}`)
  }

  return (
    <div className="hm">
      {/* HERO */}
      <section className="hm-hero">
        <img className="hm-hero-img" src="/campus-hero.jpg" alt="Gerbang Universitas Mulawarman, Samarinda" fetchPriority="high" />
        <div className="container hm-hero-inner">
          <motion.span className="hm-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Platform bantuan Universitas Mulawarman
          </motion.span>
          <motion.h1 className="hm-title" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            Satu kampus,
            <em>satu kepedulian.</em>
          </motion.h1>
          <motion.p className="hm-lead" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
            Ajukan kebutuhan atau tawarkan bantuan. Terorganisasi, transparan, dan tepat sasaran untuk seluruh sivitas akademika.
          </motion.p>
          <motion.div className="row row-wrap" style={{ marginTop: 26 }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.6 }}>
            <button className="btn btn-primary btn-lg" onClick={() => nav(user ? '/ajukan' : '/register')}>
              {user ? 'Ajukan bantuan' : 'Mulai berbagi'} <ArrowRight size={17} />
            </button>
            <Link to="/bantuan" className="btn btn-lg btn-outline" style={{ background: 'color-mix(in srgb, var(--c-surface) 70%, transparent)' }}>Lihat bantuan</Link>
          </motion.div>
        </div>
      </section>

      {/* PENCARIAN */}
      <div className="container">
        <motion.div className="hm-search" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} role="search">
          <label className="f">
            <HandHeart size={20} />
            <span><small>Saya ingin</small>
              <select value={cari.peran} onChange={(e) => setCari({ ...cari, peran: e.target.value })} aria-label="Saya ingin">
                <option value="bantu">Membantu</option>
                <option value="butuh">Mencari bantuan</option>
              </select>
            </span>
          </label>
          <label className="f">
            <Layers size={20} />
            <span><small>Jenis bantuan</small>
              <select value={cari.kategori} onChange={(e) => setCari({ ...cari, kategori: e.target.value })} aria-label="Jenis bantuan">
                <option value="">Semua jenis</option>
                {KATEGORI.map((k) => <option key={k}>{k}</option>)}
              </select>
            </span>
          </label>
          <label className="f">
            <SlidersHorizontal size={20} />
            <span><small>Urgensi</small>
              <select value={cari.urgensi} disabled={cari.peran !== 'bantu'} onChange={(e) => setCari({ ...cari, urgensi: e.target.value })} aria-label="Urgensi">
                <option value="">Semua</option>
                <option value="tinggi">Mendesak</option>
                <option value="sedang">Sedang</option>
                <option value="rendah">Rendah</option>
              </select>
            </span>
          </label>
          <button className="btn btn-primary btn-lg" onClick={jalankanCari}><Search size={17} /> Cari</button>
        </motion.div>
      </div>

      {/* KEUNGGULAN */}
      <section className="hm-section" style={{ paddingTop: 72 }}>
        <div className="container">
          <div className="hm-features">
            {FITUR.map((f, i) => (
              <Reveal key={f.t} delay={i * 0.08} className="hm-feature">
                <span className="ic"><f.icon size={26} /></span>
                <b>{f.t}</b>
                <p>{f.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PENGAJUAN */}
      <section className="hm-section hm-alt">
        <div className="container">
          <div className="hm-head">
            <Reveal>
              <span className="hm-eyebrow">Butuh uluran tangan</span>
              <h2>Pengajuan yang menunggu dibantu</h2>
            </Reveal>
            <Link to="/bantuan" className="hm-link">Lihat semua <ArrowRight size={16} /></Link>
          </div>
          <div className="filter-row" style={{ marginTop: 0 }}>
            {['Semua', ...KATEGORI].map((c) => (
              <button key={c} className={`pill-filter ${kat === c ? 'on' : ''}`} onClick={() => setKat(c)}>{c}</button>
            ))}
          </div>
          {loading ? <CardSkeletons n={3} /> : tampil.length === 0 ? (
            <EmptyState icon={HandHeart} title="Belum ada pengajuan terbuka" desc="Jadilah yang pertama mengajukan atau tawarkan bantuanmu." action={<Link to="/ajukan" className="btn btn-primary">Ajukan bantuan</Link>} />
          ) : (
            <motion.div className="cards-grid" variants={stagger} initial="hidden" animate="show" key={kat}>
              {tampil.map((p) => <NeedCard key={p.id} p={p} />)}
            </motion.div>
          )}
        </div>
      </section>

      {/* TENTANG */}
      <section className="hm-section">
        <div className="container hm-story">
          <Reveal className="hm-story-img">
            <img src="/campus-story.jpg" alt="Tugu dan gerbang kampus Universitas Mulawarman" loading="lazy" />
            <div className="hm-note"><Sparkles size={16} /> Berbagi itu mudah, bila terorganisasi.</div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="hm-eyebrow">Mengapa UNMUL Peduli</span>
            <h2 className="hm-h2">Lebih dari sekadar grup chat.<br />Kami membangun kepedulian.</h2>
            <p className="muted" style={{ fontSize: 15, maxWidth: 480 }}>
              Informasi bantuan tidak lagi tenggelam di grup WhatsApp. Pengajuan diverifikasi, dicocokkan, dan dilacak sampai selesai, sehingga bantuan sampai ke yang benar-benar membutuhkan.
            </p>
            <div className="hm-stats">
              {[
                { n: terbuka.length, l: 'Menunggu dibantu' },
                { n: selesai.length, l: 'Bantuan tersalurkan' },
                { n: tersedia.length, l: 'Penawaran tersedia' },
                { n: data.req.length + data.off.length, l: 'Total aktivitas' },
              ].map((s) => (
                <div key={s.l}><b><AnimatedNumber value={s.n} /></b><span>{s.l}</span></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PENAWARAN */}
      <section className="hm-section hm-alt">
        <div className="container">
          <div className="hm-head">
            <Reveal>
              <span className="hm-eyebrow">Siap diklaim</span>
              <h2>Penawaran bantuan terbaru</h2>
            </Reveal>
            <Link to="/penawaran" className="hm-link">Lihat semua <ArrowRight size={16} /></Link>
          </div>
          {loading ? <CardSkeletons n={3} /> : tersedia.length === 0 ? (
            <EmptyState icon={Gift} title="Belum ada penawaran tersedia" desc="Punya sesuatu yang bisa dibagi? Tawarkan sekarang." action={<Link to="/tawarkan" className="btn btn-primary">Tawarkan bantuan</Link>} />
          ) : (
            <motion.div className="cards-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {tersedia.slice(0, 3).map((p) => <OfferCard key={p.id} p={p} />)}
            </motion.div>
          )}
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="hm-section" id="cara-kerja">
        <div className="container">
          <div className="hm-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <Reveal>
              <span className="hm-eyebrow">Cara kerja</span>
              <h2>Tiga langkah sederhana</h2>
            </Reveal>
          </div>
          <div className="hm-steps">
            {[
              { icon: HandHeart, t: 'Ajukan kebutuhan', d: 'Ceritakan jenis, jumlah, kondisi, dan urgensi. Verifikator memeriksa kelengkapan datamu.', to: user ? '/ajukan' : '/register', cta: 'Ajukan bantuan' },
              { icon: Gift, t: 'Tawarkan atau bantu', d: 'Tawarkan yang kamu punya, atau pilih pengajuan yang ingin kamu bantu langsung.', to: user ? '/tawarkan' : '/register', cta: 'Tawarkan bantuan' },
              { icon: Users, t: 'Pantau sampai selesai', d: 'Pengajuan, verifikasi, pencocokan, penyaluran, selesai. Semua tercatat dan ada notifikasi.', to: '/bantuan', cta: 'Lihat daftar' },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 0.1} className="hm-step">
                <span className="no">0{i + 1}</span>
                <span className="ic"><s.icon size={24} /></span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <Link to={s.to} className="hm-link">{s.cta} <ArrowRight size={15} /></Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ paddingBottom: 72 }}>
        <Reveal className="hm-cta">
          <img src="/campus-hero.jpg" alt="" aria-hidden="true" loading="lazy" />
          <div className="body">
            <span className="hm-eyebrow" style={{ color: '#bcd3de' }}>Siap berbagi kepedulian?</span>
            <h2>Mari wujudkan bersama</h2>
            <p>Buat akun dalam satu menit, lalu ajukan atau tawarkan bantuan di lingkungan kampus.</p>
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-peach btn-lg">{user ? 'Buka dashboard' : 'Mulai sekarang'} <ArrowRight size={17} /></Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
